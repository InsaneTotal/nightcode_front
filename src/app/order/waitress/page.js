"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PedidoModal from "./components/modalAdd";
import ModalPago from "./components/modalPay";
import ModalEditPedidos from "./components/modalEditPedidos.js";
import { showModalConfirmation } from "./components/modalConfimation";
import { mesasDB, productosDB } from "./data/dbfake";

export default function WaitressPage() {
  const [mesaActiva, setMesaActiva] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  const [mesas, setMesas] = useState(mesasDB);

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

  const calcularTotal = (items) =>
    items.reduce((acc, item) => acc + item.precio, 0);

  // 🔥 AGREGAR PRODUCTOS
  const agregarProductosAMesa = (mesaId, productos) => {
    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === mesaId
          ? {
              ...mesa,
              items: [...mesa.items, ...productos],
              estado: "En consumo",
              color: "yellow",
              pedido: "En consumo",
            }
          : mesa,
      ),
    );
  };

  // 🔥 ACTUALIZAR PEDIDO (desde editar)
  const actualizarPedidoMesa = (mesaId, nuevosProductos) => {
    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === mesaId
          ? {
              ...mesa,
              items: nuevosProductos,
              estado: nuevosProductos.length ? "En consumo" : "Libre",
              color: nuevosProductos.length ? "yellow" : "green",
              pedido: nuevosProductos.length
                ? "Pedido actualizado"
                : "Sin pedido",
            }
          : mesa,
      ),
    );
  };

  // 🔥 LIBERAR MESA
  const liberarMesa = (id) => {
    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
              estado: "Libre",
              color: "green",
              pedido: "Sin pedido",
              items: [],
            }
          : mesa,
      ),
    );
    setMesaActiva(null);
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
      onConfirm: () => actualizarPedidoMesa(id, []),
    });
  };

  // 🔥 OCUPAR
  const ocuparMesa = (id) => {
    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
              estado: "En consumo",
              color: "yellow",
              pedido: "Nuevo pedido",
            }
          : mesa,
      ),
    );

    setMesaActiva(id);
    setOpenModal(true);
  };

  // 🔥 EDITAR
  const abrirEditarPedido = (mesa) => {
    setMesaEditando(mesa);
    setOpenEditar(true);
  };

  const mesasFiltradas =
    filtro === "Todas" ? mesas : mesas.filter((m) => m.estado === filtro);

  const mesaActual = mesas.find((m) => m.id === mesaActiva);

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
                <p className="text-xs text-gray-400">Pedido: {mesa.pedido}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${getBadgeStyles(
                    mesa.color,
                  )}`}
                >
                  {mesa.estado}
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
                            <span>{item.nombre}</span>
                            <span>${item.precio.toLocaleString()}</span>
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
          <div className="max-w-2xl mx-auto flex justify-between items-center">
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
                  className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold"
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
        productosDB={productosDB}
        onAgregarProductos={agregarProductosAMesa}
      />

      <ModalPago
        abierto={openPago}
        onClose={() => setOpenPago(false)}
        total={calcularTotal(mesaActual?.items || [])}
        descripcion="Pedido completo"
        onConfirmarPago={() => {
          if (mesaActual) liberarMesa(mesaActual.id);
          setOpenPago(false);
        }}
      />

      <ModalEditPedidos
        isOpen={openEditar}
        onClose={() => setOpenEditar(false)}
        mesa={mesaEditando}
        productosDB={productosDB}
        onGuardarCambios={actualizarPedidoMesa}
      />
    </div>
  );
}
