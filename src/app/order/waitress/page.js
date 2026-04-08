"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PedidoModal from "./components/modalAdd";
import ModalPago from "./components/modalPay";
import ModalEditPedidos from "./components/modalEditPedidos.js";
import { showModalConfirmation } from "./components/modalConfimation";
import ProtectedRoute from "../../../routes/protectedRoutes";

import { getDrinkTables } from "./hook/drinkTables";
import { getOrders } from "./hook/orders";
import { getDrinks } from "./hook/drinks";
import { useWaitressOrders } from "./hook/useWaitressOrders";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../../utils/realtime";

const ORDER_STATUS_CANCELLED = 5;
const ORDER_STATUS_PAID = 4;
const TABLE_STATUS_FREE = 1;
const TABLE_STATUS_OCCUPIED = 2;

const getTableStatusId = (mesa) =>
  Number(mesa?.status ?? mesa?.id_status ?? mesa?.id_table_status ?? 0);

export default function WaitressPage() {
  const [mesaActiva, setMesaActiva] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  const [tables, setTables] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [pendingNotices, setPendingNotices] = useState([]);
  const lastPendingIdsRef = useRef([]);
  const noticeTimeoutsRef = useRef({});

  const {
    agregarProductosAMesa: hookAgregarProductos,
    actualizarPedidoMesa: hookActualizarPedido,
    cancelarPedidoMesa: hookCancelarPedido,
    liberarMesa: hookLiberarMesa,
    confirmarPago: hookConfirmarPago,
    calcularTotal,
  } = useWaitressOrders(setTables, setMesaActiva, setOpenPago);

  const loadData = useCallback(async () => {
    try {
      const [tablesData, ordersData, drinksData] = await Promise.all([
        getDrinkTables().catch(() => []),
        getOrders().catch(() => []),
        getDrinks().catch(() => null),
      ]);

      if (Array.isArray(drinksData)) {
        setDrinks(drinksData);
      }

      const safeTables = Array.isArray(tablesData) ? tablesData : [];
      const safeOrders = Array.isArray(ordersData) ? ordersData : [];

      const tablesWithOrders = safeTables.map((mesa) => {
        const tableStatusId = getTableStatusId(mesa);
        const order = safeOrders.find(
          (o) =>
            o.id_mesa === mesa.id &&
            ![ORDER_STATUS_CANCELLED, ORDER_STATUS_PAID].includes(
              o.id_order_status,
            ),
        );

        return {
          ...mesa,
          orderId: order?.id,
          items: order
            ? Object.values(
                order.details.reduce((acc, detail) => {
                  const nombre = detail.drink.name;
                  const id = detail.drink.id;
                  const cantidad = Number(detail.amount || 1);
                  if (!acc[nombre]) {
                    acc[nombre] = {
                      id: id,
                      nombre,
                      precio: Number(detail.unit_price),
                      cantidad: 0,
                    };
                  }

                  acc[nombre].cantidad += cantidad;

                  return acc;
                }, {}),
              )
            : [],

          color:
            order && order.details.length > 0
              ? "yellow"
              : tableStatusId === TABLE_STATUS_FREE
                ? "green"
                : tableStatusId === TABLE_STATUS_OCCUPIED
                  ? "yellow"
                  : "red",
        };
      });

      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      await loadData();
    };

    initData();

    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, [
          "order",
          "orders",
          "table",
          "tables",
          "drink-table",
          "drinks",
          "inventory",
          "payment",
          "payments",
        ])
      ) {
        loadData();
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadData]);

  const estados = ["Todas", "Libre", "En consumo", "Pendiente"];

  const getBadgeStyles = (color) => {
    switch (color) {
      case "green":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "red":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "yellow":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const agregarProductosAMesa = async (mesaId, productos) => {
    await hookAgregarProductos(tables, mesaId, productos);
    await loadData();
  };

  const actualizarPedidoMesa = async (mesaId, nuevosProductos) => {
    await hookActualizarPedido(tables, mesaId, nuevosProductos);
    await loadData();
  };

  const cancelarPedidoMesa = async (mesaId) => {
    await hookCancelarPedido(tables, mesaId);
    await loadData();
  };

  const liberarMesa = async (id) => {
    await hookLiberarMesa(tables, id);
    dismissPendingNotice(id);
    await loadData();
  };

  const confirmarPago = async (metodoPago, liberarMesa = true) => {
    await hookConfirmarPago(tables, mesaActiva, metodoPago, liberarMesa);
    await loadData();
  };

  const abrirConfirmacionLiberar = (id) => {
    showModalConfirmation({
      title: `Liberar Mesa ${id}`,
      message: "¿Estás seguro?",
      onConfirm: () => liberarMesa(id),
    });
  };

  const cancelarPedidoConfirmacion = (id) => {
    showModalConfirmation({
      title: "Cancelar Pedido",
      message: "Se eliminarán todos los productos de esta mesa.",
      onConfirm: () => cancelarPedidoMesa(id),
    });
  };

  const calcularStockDisponible = () => {
    return drinks.map((drink) => {
      let totalEnConsumo = 0;

      tables.forEach((mesa) => {
        if (mesa.id !== mesaActiva && mesa.items.length > 0) {
          const item = mesa.items.find((i) => i.id === drink.id);
          if (item) {
            totalEnConsumo += item.cantidad;
          }
        }
      });

      return {
        ...drink,
        amount: drink.amount - totalEnConsumo,
      };
    });
  };

  const drinksDisponibles = calcularStockDisponible();

  const abrirEditarPedido = (mesa) => {
    setMesaEditando(mesa);
    setOpenEditar(true);
  };

  useEffect(() => {
    const pendingIds = tables.filter((t) => t.color === "red").map((t) => t.id);
    const newPendingIds = pendingIds.filter(
      (id) => !lastPendingIdsRef.current.includes(id),
    );
    const removedPendingIds = lastPendingIdsRef.current.filter(
      (id) => !pendingIds.includes(id),
    );

    newPendingIds.forEach((id) => {
      const notice = {
        tableId: id,
        message: `Mesa ${id} está llamando`,
      };
      setPendingNotices((prev) => [...prev, notice]);
      const timeoutId = setTimeout(
        () => {
          setPendingNotices((prev) =>
            prev.filter((n) => n.tableId !== id),
          );
        },
        120000,
      );
      noticeTimeoutsRef.current[id] = timeoutId;
    });

    removedPendingIds.forEach((id) => {
      if (noticeTimeoutsRef.current[id]) {
        clearTimeout(noticeTimeoutsRef.current[id]);
        delete noticeTimeoutsRef.current[id];
      }
      setPendingNotices((prev) =>
        prev.filter((n) => n.tableId !== id),
      );
    });

    lastPendingIdsRef.current = pendingIds;
  }, [tables]);

  const dismissPendingNotice = (tableId) => {
    if (noticeTimeoutsRef.current[tableId]) {
      clearTimeout(noticeTimeoutsRef.current[tableId]);
      delete noticeTimeoutsRef.current[tableId];
    }
    setPendingNotices((prev) =>
      prev.filter((n) => n.tableId !== tableId),
    );
  };

  const mesasFiltradas =
    filtro === "Todas"
      ? tables
      : tables.filter((m) =>
          filtro === "Libre"
            ? m.color === "green"
            : filtro === "En consumo"
              ? m.color === "yellow"
              : m.color === "red",
        );
  const mesaActual = tables.find((m) => m.id === mesaActiva);
  const mesaActualLibre =
    getTableStatusId(mesaActual) === TABLE_STATUS_FREE ||
    mesaActual?.color === "green";
  const mesaActualOcupada = getTableStatusId(mesaActual) === TABLE_STATUS_OCCUPIED;

  return (
    <ProtectedRoute allowedRoles={["1", "2"]}>
      <div className="min-h-screen bg-linear-to-br from-black via-[#0b0b0b] to-black text-white px-4 pt-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-center text-yellow-400">
            PANEL DE SERVICIO
          </h1>

          {/* FILTROS */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  filtro === estado
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "border-yellow-500/30 text-yellow-400"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          {/* MESAS */}
          {mesasFiltradas.map((mesa) => (
            <motion.div
              key={mesa.id}
              className="rounded-2xl border border-yellow-400/20 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden"
            >
              <div
                className="flex justify-between items-center px-4 py-5 cursor-pointer"
                onClick={() =>
                  setMesaActiva(mesaActiva === mesa.id ? null : mesa.id)
                }
              >
                <div>
                  <h2 className="text-lg font-bold">Mesa {mesa.id}</h2>
                  <p className="text-xs text-gray-400">Pedido: {mesa.name}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${getBadgeStyles(
                      mesa.color,
                    )}`}
                  >
                    {mesa.items.length > 0 || getTableStatusId(mesa) === TABLE_STATUS_OCCUPIED
                      ? "En consumo"
                      : getTableStatusId(mesa) === TABLE_STATUS_FREE
                        ? "Libre"
                        : "Pendiente"}
                  </span>

                  <motion.div
                    animate={{ rotate: mesaActiva === mesa.id ? 180 : 0 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {mesaActiva === mesa.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-yellow-400/20 px-4 py-4 space-y-3 text-sm">
                      {mesa.items.length === 0 ? (
                        <p className="text-gray-400">No hay consumos activos</p>
                      ) : (
                        <>
                          {mesa.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-gray-300"
                            >
                              <span>
                                {item.nombre}{" "}
                                {item.cantidad ? `x${item.cantidad}` : ""}
                              </span>

                              <span>
                                $
                                {(
                                  Number(item.precio) *
                                  (item.cantidad ? item.cantidad : 1)
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => abrirEditarPedido(mesa)}
                              className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 text-xs"
                            >
                              ✏️ Editar
                            </button>

                            <button
                              onClick={() =>
                                cancelarPedidoConfirmacion(mesa.id)
                              }
                              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/40 text-red-400 text-xs"
                            >
                              ❌ Cancelar Pedido
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* 🔥 BARRA INFERIOR */}
        {mesaActual && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 w-full bg-black/95 border-t border-yellow-400/20 px-4 py-5 z-40"
          >
            <div className="max-w-2xl mx-auto flex flex-wrap justify-between items-center gap-3">
              {mesaActual.items.length > 0 ? (
                <>
                  <div>
                    <p className="text-xs text-gray-400">
                      Total Mesa {mesaActual.id}
                    </p>
                    <p className="text-2xl font-extrabold text-yellow-400">
                      ${calcularTotal(mesaActual.items).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setOpenPago(true)}
                      className="px-6 py-3 rounded-2xl bg-yellow-500 text-black font-bold"
                    >
                      💳 Pagar
                    </button>

                    <button
                      onClick={() => setOpenModal(true)}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold"
                    >
                      ➕ Agregar
                    </button>

                    <button
                      onClick={() => abrirConfirmacionLiberar(mesaActual.id)}
                      className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold"
                    >
                      🗑 Liberar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p
                      className={`text-xl font-bold ${
                        mesaActualLibre
                          ? "text-green-400"
                          : mesaActualOcupada
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {mesaActualLibre
                        ? "Disponible"
                        : mesaActualOcupada
                          ? "En consumo"
                          : "Pendiente"}
                    </p>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setOpenModal(true)}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold w-full sm:w-auto"
                    >
                      ➕ Agregar
                    </button>

                    {!mesaActualLibre && (
                      <button
                        onClick={() => abrirConfirmacionLiberar(mesaActual.id)}
                        className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold w-full sm:w-auto"
                      >
                        🗑 Liberar Mesa
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* MODALES */}
        <PedidoModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          mesaId={mesaActual?.id}
          productosDB={drinksDisponibles}
          onAgregarProductos={agregarProductosAMesa}
        />

        <ModalPago
          abierto={openPago}
          onClose={() => setOpenPago(false)}
          total={calcularTotal(mesaActual?.items || [])}
          descripcion="Pedido completo"
          onConfirmarPago={confirmarPago}
        />

        <ModalEditPedidos
          isOpen={openEditar}
          onClose={() => setOpenEditar(false)}
          mesa={mesaEditando}
          productosDB={drinksDisponibles}
          onGuardarCambios={actualizarPedidoMesa}
        />

        {/* Notificacion Flotante */}
        <div className="fixed right-4 top-4 z-50 w-[min(92vw,22rem)] pointer-events-none">
          <AnimatePresence>
            {pendingNotices.map((notice) => (
              <motion.div
                key={notice.tableId}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="pointer-events-auto mb-3 rounded-2xl border border-red-500/40 bg-black/90 shadow-2xl backdrop-blur-md p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-200">
                      Llamada de mesero
                    </p>
                    <p className="mt-1 text-sm text-red-100 break-words">
                      {notice.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissPendingNotice(notice.tableId)}
                    className="shrink-0 p-1 text-red-100 hover:bg-red-500/20 rounded-full border border-red-400/30 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
