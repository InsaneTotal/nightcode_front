"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function ModalEditPedidos({
  isOpen,
  onClose,
  mesa,
  productosDB,
  onGuardarCambios,
}) {
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  useEffect(() => {
    if (isOpen && mesa) {
      setProductosSeleccionados(mesa.items || []);
    }
  }, [isOpen, mesa]);

  const toggleProducto = (producto) => {
    const existe = productosSeleccionados.find((p) => p.id === producto.id);

    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.filter((p) => p.id !== producto.id),
      );
    } else {
      setProductosSeleccionados((prev) => [...prev, producto]);
    }
  };

  const guardarCambios = () => {
    if (!mesa) return;

    onGuardarCambios(mesa.id, productosSeleccionados);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && mesa && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-[#111] p-6 rounded-2xl w-full max-w-md border border-yellow-400/20"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Editar Pedido - Mesa {mesa.id}
            </h2>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {productosDB.map((producto) => {
                const activo = productosSeleccionados.find(
                  (p) => p.id === producto.id,
                );

                return (
                  <div
                    key={producto.id}
                    onClick={() => toggleProducto(producto)}
                    className={`flex justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                      activo
                        ? "bg-yellow-500/20 border border-yellow-400/40"
                        : "bg-white/5"
                    }`}
                  >
                    <span>{producto.nombre}</span>
                    <span>${producto.precio.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-600 text-white text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={guardarCambios}
                className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold text-sm"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
