import { authFetch } from "../../../utils/authFetch";
import { buildApiUrl } from "../../../utils/networkConfig";

const DRINK_TABLES_PATH = "/api/order/drink-tables/";

const getDownloadCandidates = (tableId) => [
  buildApiUrl(`/api/order/tables/${tableId}/qr/download/`),
  buildApiUrl(`/api/order/drink-tables/${tableId}/qr/download/`),
];

const normalizeTablesList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export async function getDrinkTablesForQr() {
  const response = await authFetch(buildApiUrl(DRINK_TABLES_PATH), { method: "GET" });
  if (!response.ok) {
    let message = "No se pudieron cargar las mesas";
    try {
      const errorData = await response.json();
      message = errorData?.detail || errorData?.message || message;
    } catch {}
    throw new Error(message);
  }
  const payload = await response.json();
  return normalizeTablesList(payload);
}

export async function createDrinkTable() {
  let nextTableNumber = 1;

  try {
    const listResponse = await authFetch(buildApiUrl(DRINK_TABLES_PATH), { method: "GET" });
    if (listResponse.ok) {
      const tablesPayload = await listResponse.json();
      const tables = normalizeTablesList(tablesPayload);
      const numericNames = tables
        .map((table) => Number(String(table?.name || "").replace(/\D/g, "")))
        .filter((value) => Number.isFinite(value) && value > 0);

      if (numericNames.length > 0) {
        nextTableNumber = Math.max(...numericNames) + 1;
      }
    }
  } catch {}

  const tableName = `Mesa ${nextTableNumber}`;

  const payloads = [
    { name: tableName, status: 1 },
    { name: tableName, status: "1" },
    { name: tableName, status: "Libre" },
    { name: tableName, id_status: 1 },
    { name: tableName, id_table_status: 1 },
  ];

  let error = null;

  for (const payload of payloads) {
    const response = await authFetch(buildApiUrl(DRINK_TABLES_PATH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }

    try {
      const errorData = await response.json();
      error = errorData?.detail || errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      error = null;
    }
  }

  throw new Error(error || "No se pudo crear la mesa");
}

export async function requestTableQrDownload(tableId, explicitUrl) {
  const urls = [explicitUrl, ...getDownloadCandidates(tableId)].filter(Boolean);
  let error = null;

  for (const url of urls) {
    const response = await authFetch(url, {
      method: "GET",
    });

    if (response.ok) {
      return response;
    }

    try {
      const errorData = await response.json();
      error = errorData?.detail || errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      error = null;
    }
  }

  throw new Error(error || `No se pudo descargar el QR de la mesa ${tableId}`);
}
