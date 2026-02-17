"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ModalPay({
  abierto,
  onClose,
  total = 0,
  descripcion = "Consumo de la mesa",
  onConfirmarPago,
}) {
  const [metodoPago, setMetodoPago] = useState("");

  if (!abierto) return null;

  const confirmar = () => {
    if (!metodoPago) return;

    onConfirmarPago(metodoPago);
    setMetodoPago("");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black border border-yellow-600 w-[430px] rounded-3xl p-6 shadow-2xl text-white"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-yellow-500 text-2xl font-semibold">
              Confirmar Pago
            </h2>
            <X
              className="cursor-pointer hover:text-red-500 transition"
              onClick={() => {
                setMetodoPago("");
                onClose();
              }}
            />
          </div>

          {/* TOTAL */}
          <div className="rounded-2xl p-4 mb-5 bg-zinc-900 border border-yellow-700">
            <p className="text-yellow-400 text-sm mb-1">Total a pagar</p>
            <p className="text-4xl font-bold text-purple-500 pt-2">
              ${Number(total).toLocaleString()}
            </p>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mb-6">
            <p className="text-yellow-400 text-sm mb-2">Descripción</p>
            <div className="bg-zinc-900 border border-yellow-700 rounded-2xl p-3 text-gray-300 text-sm">
              {descripcion}
            </div>
          </div>

          {/* MÉTODOS DE PAGO */}
          <div className="mb-6">
            <p className="text-yellow-400 text-sm mb-3">Método de pago</p>

            <div className="space-y-3">
              {["Efectivo", "Tarjeta", "Transferencia"].map((metodo) => (
                <button
                  key={metodo}
                  onClick={() => setMetodoPago(metodo)}
                  className={`
                    w-full py-3 rounded-2xl border transition-all duration-300
                    ${
                      metodoPago === metodo
                        ? "bg-purple-700 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                        : "bg-zinc-900 border-yellow-700 hover:border-purple-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    }
                  `}
                >
                  {metodo}
                </button>
              ))}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex justify-between gap-4">
            <button
              onClick={() => {
                setMetodoPago("");
                onClose();
              }}
              className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              onClick={confirmar}
              disabled={!metodoPago}
              className={`
                flex-1 py-2 rounded-xl font-semibold transition
                ${
                  metodoPago
                    ? "bg-yellow-600 hover:bg-yellow-500 shadow-lg"
                    : "bg-gray-700 cursor-not-allowed"
                }
              `}
            >
              Confirmar Pago
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
