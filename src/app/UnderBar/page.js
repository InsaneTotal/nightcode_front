"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import VistaPedidos from "./components/VistaPedidos";
import HistorialPedidos from "./components/HistorialPedidos";
import ProtectedRoute from "../../routes/protectedRoutes";
import { authFetch } from "../../utils/authFetch";
import { getOrders } from "../order/waitress/hook/orders";
import { getDrinkTables } from "../order/waitress/hook/drinkTables";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../utils/realtime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ORDER_STATUS_CANCELLED = 5;
const ORDER_STATUS_PAID = 4;
const TABLE_STATUS_SERVED = 3;

const getTableUrl = (tableId) =>
  `${API_URL}/api/order/drink-tables/${tableId}/`;

async function syncTableStatus(tableId, statusId) {
  const payloads = [
    { status: statusId },
    { id_status: statusId },
    { id_table_status: statusId },
  ];

  for (const payload of payloads) {
    const response = await authFetch(getTableUrl(tableId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    }
  }

  return false;
}

function getOrderItems(order) {
  if (!order?.details || !Array.isArray(order.details)) {
    return [];
  }

  return order.details.reduce((items, detail) => {
    const nombre = detail?.drink?.name || detail?.name || "Producto sin nombre";
    const cantidad = Number(detail?.amount || 1);

    const existing = items.find((item) => item.nombre === nombre);
    if (existing) {
      existing.cantidad += cantidad;
      return items;
    }

    items.push({
      nombre,
      cantidad,
    });

    return items;
  }, []);
}

function getOrderTime(order) {
  return (
    order?.updated_at ||
    order?.created_at ||
    order?.date_order ||
    order?.fecha ||
    order?.date ||
    new Date().toISOString()
  );
}

function formatTime(value) {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

function mapOrderToCard(order) {
  const statusId = Number(order?.id_order_status);
  const estadoLabel =
    statusId === ORDER_STATUS_PAID
      ? "Pagado"
      : statusId === ORDER_STATUS_CANCELLED
        ? "Cancelado"
        : "Enviado";

  return {
    id: order?.id,
    mesa: order?.id_mesa ?? order?.mesa?.id ?? "-",
    pedido: getOrderItems(order),
    hora: formatTime(getOrderTime(order)),
    estadoId: statusId,
    estadoLabel,
  };
}

function normalizeTableStatus(table) {
  return Number(
    table?.status ?? table?.id_status ?? table?.id_table_status ?? 0,
  );
}

export default function Barra() {
  const [vista, setVista] = useState("barra");
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tablesById = useMemo(() => {
    return tables.reduce((acc, table) => {
      const id = Number(table?.id);
      if (Number.isFinite(id)) {
        acc[id] = {
          ...table,
          statusId: normalizeTableStatus(table),
        };
      }
      return acc;
    }, {});
  }, [tables]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersData, tablesData] = await Promise.all([
        getOrders(),
        getDrinkTables().catch(() => []),
      ]);

      setTables(Array.isArray(tablesData) ? tablesData : []);
      const data = ordersData;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, [
          "order",
          "orders",
          "table",
          "tables",
          "payment",
          "payments",
        ])
      ) {
        loadOrders();
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadOrders]);

  const pedidosPendientes = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            ![ORDER_STATUS_CANCELLED, ORDER_STATUS_PAID].includes(
              Number(order?.id_order_status),
            ),
        )
        .map((order) => {
          const card = mapOrderToCard(order);
          const mesaStatusId = tablesById[Number(card.mesa)]?.statusId ?? 0;

          return {
            ...card,
            mesaStatusId,
            mesaStatusLabel:
              mesaStatusId === TABLE_STATUS_SERVED
                ? "Servida"
                : mesaStatusId === 2
                  ? "Ocupada"
                  : "Pendiente",
          };
        })
        .sort((a, b) => Number(a.mesa) - Number(b.mesa)),
    [orders, tablesById],
  );

  const historial = useMemo(
    () =>
      orders
        .filter((order) =>
          [ORDER_STATUS_CANCELLED, ORDER_STATUS_PAID].includes(
            Number(order?.id_order_status),
          ),
        )
        .map((order) => {
          const card = mapOrderToCard(order);
          const mesaStatusId = tablesById[Number(card.mesa)]?.statusId ?? 0;

          return {
            ...card,
            mesaStatusId,
            mesaStatusLabel:
              mesaStatusId === TABLE_STATUS_SERVED
                ? "Servida"
                : card.estadoLabel,
          };
        })
        .sort((a, b) => b.id - a.id),
    [orders, tablesById],
  );

  const marcarServida = useCallback(
    async (pedido) => {
      try {
        const tableId = Number(pedido?.mesa);
        if (!Number.isFinite(tableId)) {
          throw new Error("No se pudo identificar la mesa.");
        }

        await syncTableStatus(tableId, TABLE_STATUS_SERVED);
        await loadOrders();
      } catch (err) {
        setError(err?.message || "No se pudo marcar la mesa como servida.");
      }
    },
    [loadOrders],
  );

  return (
    <ProtectedRoute allowedRoles={["1", "3"]}>
      <div className="relative min-h-screen bg-[url('/img_fondo_bar.jpg')] bg-cover bg-center flex flex-col items-center px-3 sm:px-4 pt-2 pb-6">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="min-h-screen w-full max-w-6xl text-white py-6 sm:py-8 px-2 sm:px-4 z-10">
          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-10">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400">
                {vista === "barra" ? "Barra" : "Historial"}
              </h1>
              <p className="text-sm sm:text-base text-gray-300 max-w-xl">
                Órdenes en tiempo real enviadas por el mesero
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm">
                Tiempo real activo
              </span>

              <button
                onClick={loadOrders}
                className="px-4 sm:px-5 py-2 rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.6)] transition duration-300 text-sm sm:text-base"
              >
                Actualizar
              </button>

              <button
                onClick={() =>
                  setVista(vista === "barra" ? "historial" : "barra")
                }
                className="px-4 sm:px-5 py-2 rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.6)] transition duration-300 text-sm sm:text-base"
              >
                {vista === "barra" ? "Ver Historial" : "Volver"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center text-gray-300 mb-6 text-sm sm:text-base">
              Cargando órdenes...
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-300 mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {vista === "barra" ? (
            <VistaPedidos
              pedidos={pedidosPendientes}
              onMarcarServida={marcarServida}
            />
          ) : (
            <HistorialPedidos historial={historial} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
