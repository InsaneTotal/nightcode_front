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
      const itemsConvertidos = (mesa.items || []).map(item => ({
        id: item.id || 0,
        name: item.nombre || item.name || 'Producto desconocido',
        price: item.precio || item.price || 0,
        cantidad: item.cantidad || 1,
      }));
      setProductosSeleccionados(itemsConvertidos);
    }
  }, [isOpen, mesa]);

  const toggleProducto = (producto) => {
    const existe = productosSeleccionados.find((p) => p.id === producto.id);

    if (existe) {
      // Si existe, quitarlo
      setProductosSeleccionados((prev) =>
        prev.filter((p) => p.id !== producto.id),
      );
    } else {
      // Si no existe, agregarlo con cantidad 1
      setProductosSeleccionados((prev) => [...prev, {
        id: producto.id,
        name: producto.name,
        price: Number(producto.price),
        cantidad: 1,
      }]);
    }
  };

  const guardarCambios = () => {
    if (!mesa) return;

    // Convertir productosSeleccionados a la estructura que espera actualizarPedidoMesa
    const productosConvertidos = productosSeleccionados.map(item => ({
      id: item.id,
      nombre: item.name, // convertir 'name' a 'nombre'
      precio: item.price, // convertir 'price' a 'precio'
      cantidad: item.cantidad,
    }));

    onGuardarCambios(mesa.id, productosConvertidos);
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
              {productosDB.filter(producto => producto.amount > 0).map((producto) => {
                const seleccionado = productosSeleccionados.find(
                  (p) => p.id === producto.id,
                );

                return (
                  <div
                    key={producto.id}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg transition ${
                      seleccionado
                        ? "bg-yellow-500/20 border border-yellow-400/40"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex-1"> 
                      <span>{producto.name}</span>
                      <div className="text-xs text-gray-400">
                        ${Number(producto.price).toLocaleString()} - Stock: {producto.amount}
                      </div>
                    </div>

                    {seleccionado ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (seleccionado.cantidad > 1) {
                              setProductosSeleccionados((prev) =>
                                prev.map((p) =>
                                  p.id === producto.id
                                    ? { ...p, cantidad: p.cantidad - 1 }
                                    : p
                                )
                              );
                            } else {
                              // Si llega a 0, quitar el producto
                              setProductosSeleccionados((prev) =>
                                prev.filter((p) => p.id !== producto.id)
                              );
                            }
                          }}
                          className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-yellow-400 font-bold">
                          {seleccionado.cantidad}
                        </span>
                        <button
                          onClick={() => {
                            if (seleccionado.cantidad < producto.amount) { // No permitir aumentar más que el stock disponible
                              setProductosSeleccionados((prev) =>
                                prev.map((p) =>
                                  p.id === producto.id
                                    ? { ...p, cantidad: p.cantidad + 1 }
                                    : p
                                )
                              );
                            }
                          }}
                          disabled={seleccionado.cantidad >= producto.amount} // Deshabilitar si la cantidad es igual o mayor al stock disponible
                          className={`w-6 h-6 rounded flex items-center justify-center text-sm ${
                            seleccionado.cantidad >= producto.amount
                              ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleProducto(producto)}
                        className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 text-sm"
                      >
                        Agregar
                      </button>
                    )}
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
