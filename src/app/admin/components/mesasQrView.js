"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, QrCode, Plus } from "lucide-react";
import {
  createDrinkTable,
  getDrinkTablesForQr,
  requestTableQrDownload,
} from "../hooks/tableQr";

function resolveTableId(table) {
  const candidate = table?.id ?? table?.table_id ?? table?.id_mesa ?? table?.mesa_id;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildOrderUrl(tableId, qrToken) {
  const frontendBase =
    (typeof window !== "undefined" && window.location?.origin) ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "http://localhost:3000";

  const params = new URLSearchParams();
  params.append("mesa", String(tableId));
  params.append("token", String(qrToken));
  return `${frontendBase}/order?${params.toString()}`;
}

function extractFilename(contentDisposition, tableId) {
  if (!contentDisposition) {
    return `mesa-${tableId}-qr.png`;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const simpleMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return `mesa-${tableId}-qr.png`;
}

async function triggerFileDownload(response, tableId) {
  const blob = await response.blob();
  const fileName = extractFilename(response.headers.get("content-disposition"), tableId);

  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}

function mapTablesToView(tables) {
  return (Array.isArray(tables) ? tables : [])
    .map((table) => {
      const id = resolveTableId(table);
      if (!id) return null;

      const qrToken = String(table?.qr_token || table?.token || "").trim();
      return {
        id,
        qrToken,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.id - a.id);
}

export default function MesasQrView() {
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [downloadingTableId, setDownloadingTableId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [createdTables, setCreatedTables] = useState([]);

  const loadTables = async () => {
    setLoadingTables(true);
    try {
      const tables = await getDrinkTablesForQr();
      setCreatedTables(mapTablesToView(tables));
    } catch (error) {
      const message = error?.message || "No se pudieron cargar las mesas";
      setFeedback(message);
      console.error("Error cargando mesas QR:", error);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreateAndDownload = async () => {
    setLoading(true);
    setFeedback("");

    try {
      const newTable = await createDrinkTable();
      const tableId = resolveTableId(newTable);

      if (!tableId) {
        throw new Error("La mesa se creó pero no se pudo identificar su id");
      }

      const qrUrl =
        newTable?.qr_download_url ||
        newTable?.qr_url ||
        newTable?.download_url ||
        null;

      const response = await requestTableQrDownload(tableId, qrUrl);
      await triggerFileDownload(response, tableId);

      await loadTables();
      setFeedback(`Mesa ${tableId} creada y QR descargado`);
    } catch (error) {
      setFeedback(error.message || "No se pudo crear la mesa con QR");
    } finally {
      setLoading(false);
    }
  };

  const handleRedownloadQr = async (tableId) => {
    setDownloadingTableId(tableId);
    setFeedback("");

    try {
      const response = await requestTableQrDownload(tableId, null);
      await triggerFileDownload(response, tableId);
      setFeedback(`QR de la mesa ${tableId} descargado nuevamente`);
    } catch (error) {
      setFeedback(error?.message || `No se pudo descargar el QR de la mesa ${tableId}`);
    } finally {
      setDownloadingTableId(null);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-yellow-500 tracking-wide">Mesas QR</h2>

      <div className="bg-gradient-to-br from-[#050816] via-[#0a0f2a] to-black border border-yellow-500/20 rounded-2xl p-8 shadow-xl">
        <p className="text-gray-300 mb-6">
          Crea mesas y descarga sus códigos QR.
        </p>

        <button
          type="button"
          onClick={handleCreateAndDownload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          <QrCode size={16} />
          {loading ? "Generando..." : "Crear mesa y descargar QR"}
        </button>

        {feedback && <p className="mt-4 text-sm text-yellow-300">{feedback}</p>}
      </div>

      <div className="bg-gradient-to-br from-[#050816] via-[#0a0f2a] to-black border border-yellow-500/20 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">Últimas mesas generadas</h3>

        <div className="mb-4">
          <button
            type="button"
            onClick={loadTables}
            disabled={loadingTables}
            className="rounded-lg border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingTables ? "Actualizando..." : "Actualizar mesas"}
          </button>
        </div>

        {createdTables.length === 0 ? (
          <p className="text-gray-400">No hay mesas disponibles para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {createdTables.map((table) => (
              <div
                key={table.id}
                className="rounded-xl border border-yellow-500/20 bg-black/30 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-yellow-300">Mesa {table.id}</p>
                    {table.qrToken ? (
                      <div className="mt-2 rounded-lg border border-yellow-500/15 bg-black/35 px-3 py-2">
                        <p className="text-xs text-gray-500 mb-1">URL de orden</p>
                        <p className="text-xs text-gray-300 font-mono break-all">
                          {buildOrderUrl(table.id, table.qrToken)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400 break-all">
                        Mesa sin token, actualiza mesas
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2 w-full md:w-auto md:min-w-[230px]">
                    <button
                      type="button"
                      onClick={() => handleRedownloadQr(table.id)}
                      disabled={downloadingTableId === table.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={14} />
                      {downloadingTableId === table.id ? "Descargando..." : "Volver a descargar QR"}
                    </button>

                    {table.qrToken ? (
                      <a
                        href={buildOrderUrl(table.id, table.qrToken)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/10"
                      >
                        <ExternalLink size={14} />
                        Abrir URL de orden
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-500/20 px-4 py-2 text-sm text-yellow-300/60"
                      >
                        <ExternalLink size={14} />
                        Mesa sin token, actualiza mesas
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
