"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PedidoModal from "./components/modalAdd";
import ModalPago from "./components/modalPay";
import ModalEditPedidos from "./components/modalEditPedidos.js";
import { showModalConfirmation } from "./components/modalConfimation";

//---------------------------------------------------//
import { getDrinkTables } from "./hook/drinkTables";
import { getOrders } from "./hook/orders";
import { getDrinks } from "./hook/drinks";
import { useWaitressOrders } from "./hook/useWaitressOrders";

export default function WaitressPage() {
  const [mesaActiva, setMesaActiva] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  //---------------------------------------------------//
  const [tables, setTables] = useState([]);
  const [drinks, setDrinks] = useState([]);

  const {
    agregarProductosAMesa: hookAgregarProductos,
    actualizarPedidoMesa: hookActualizarPedido,
    liberarMesa: hookLiberarMesa,
    confirmarPago: hookConfirmarPago,
    ocuparMesa: hookOcuparMesa,
    calcularTotal,
  } = useWaitressOrders(setTables, setMesaActiva, setOpenPago);

  useEffect(() => {
  const loadData = async () => {
    try {
      const tablesData = await getDrinkTables();
      const ordersData = await getOrders();
      const drinksData = await getDrinks();

      setDrinks(drinksData);

      const tablesWithOrders = tablesData.map((mesa) => {
        const order = ordersData.find(
          (o) => o.id_mesa === mesa.id && o.id_order_status !== 4
        );

        return {
          ...mesa,
          orderId: order?.id,
          items: order // esto funciona para transformar los detalles del pedido en el formato que espera la UI
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
            : mesa.status === 1
            ? "green"
            : "red",
        };
      });

      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  loadData();
}, []);

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

  const getPingColor = (color) => {
    switch (color) {
      case "green":
        return "bg-green-400";
      case "red":
        return "bg-red-400";
      case "yellow":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  // 🔥 WRAPPERS PARA FUNCIONES DEL HOOK
  const agregarProductosAMesa = (mesaId, productos) => 
    hookAgregarProductos(tables, mesaId, productos);

  const actualizarPedidoMesa = (mesaId, nuevosProductos) => 
    hookActualizarPedido(tables, mesaId, nuevosProductos);

  const liberarMesa = (id) => hookLiberarMesa(tables, id);

  const confirmarPago = (metodoPago) =>
    hookConfirmarPago(tables, mesaActiva, metodoPago);

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
      onConfirm: () => actualizarPedidoMesa(id, []),
    });
  };

  const ocuparMesa = (id) => {
    setMesaActiva(id);
    setOpenModal(true);
  };

  // me ayuda a (restando lo que está en consumo en otras mesas)
  const calcularStockDisponible = () => {
    return drinks.map((drink) => {
      let totalEnConsumo = 0;

      // Suma cantidades en consumo de todas las mesas menos la mesa actual
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
        amount: drink.amount - totalEnConsumo, // Stock disponible
      };
    });
  };

  const drinksDisponibles = calcularStockDisponible();

  // 🔥 EDITAR
  const abrirEditarPedido = (mesa) => {
    setMesaEditando(mesa);
    setOpenEditar(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-black text-white px-4 pt-8 pb-32">
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
                    {mesa.items.length > 0
                      ? "En consumo"
                      : mesa.status === 1
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
                              {item.nombre} {item.cantidad ? `x${item.cantidad}` : ""}
                            </span>

                            <span>
                              $
                              {(
                              Number(item.precio) * (item.cantidad ? item.cantidad : 1)
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
                            onClick={() => cancelarPedidoConfirmacion(mesa.id)}
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
                  <p className="text-xl font-bold text-green-400">Disponible</p>
                </div>

                <button
                  onClick={() => ocuparMesa(mesaActual.id)}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold w-full sm:w-auto"
                >
                  ➕ Ocupar Mesa
                </button>
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
    </div>
  );
}
