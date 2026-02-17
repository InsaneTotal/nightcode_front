"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function PedidoModal({
  isOpen,
  onClose,
  mesaId,
  productosDB,
  onAgregarProductos,
}) {
  const [search, setSearch] = useState("");
  const [cantidades, setCantidades] = useState({});

  if (!isOpen) return null;

  // 🔥 FILTRO EN TIEMPO REAL
  const productosFiltrados = productosDB.filter((producto) =>
    producto.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  // 🔥 FUNCIONES DE CANTIDAD
  const aumentar = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const disminuir = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const cancelar = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  // 🔥 CONFIRMAR PEDIDO
  const realizarPedido = () => {
    const productosSeleccionados = [];

    Object.entries(cantidades).forEach(([id, cantidad]) => {
      if (cantidad > 0) {
        const producto = productosDB.find((p) => p.id === Number(id));

        for (let i = 0; i < cantidad; i++) {
          productosSeleccionados.push({
            nombre: producto.nombre,
            precio: producto.precio,
          });
        }
      }
    });

    if (productosSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin productos",
        text: "Selecciona al menos un producto",
        background: "#0f0f0f",
        color: "#fff",
        confirmButtonColor: "#eab308",
      });
      return;
    }

    // 🔥 ENVIAR PRODUCTOS A LA MESA
    onAgregarProductos(mesaId, productosSeleccionados);

    // 🔥 ALERTA DE ÉXITO
    Swal.fire({
      icon: "success",
      title: "Pedido enviado",
      text: "Productos agregados correctamente",
      background: "#0f0f0f",
      color: "#facc15",
      confirmButtonColor: "#22c55e",
      timer: 1500,
      showConfirmButton: false,
    });

    // 🔥 LIMPIAR ESTADO
    setCantidades({});
    setSearch("");

    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black border border-yellow-500 w-[520px] rounded-3xl p-6 text-white shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-yellow-500 text-xl font-semibold">
              Mesa {mesaId} - Pedido
            </h2>
            <X
              className="cursor-pointer hover:text-red-500 transition"
              onClick={onClose}
            />
          </div>

          {/* BUSCADOR */}
          <div className="relative mb-6 group">
            <Search className="absolute left-3 top-3 text-yellow-500 w-5 h-5 group-focus-within:text-purple-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-yellow-600 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/60"
            />
          </div>

          {/* LISTA PRODUCTOS */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="flex justify-between items-center border-b border-yellow-700 pb-3"
              >
                <div>
                  <p>{producto.nombre}</p>
                  <p className="text-xs text-gray-400">
                    ${producto.precio.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => disminuir(producto.id)}
                    className="bg-yellow-600 hover:bg-yellow-500 w-8 h-8 rounded-lg"
                  >
                    -
                  </button>

                  <span className="w-8 text-center font-semibold">
                    {cantidades[producto.id] || 0}
                  </span>

                  <button
                    onClick={() => aumentar(producto.id)}
                    className="bg-green-600 hover:bg-green-500 w-8 h-8 rounded-lg"
                  >
                    +
                  </button>

                  <button
                    onClick={() => cancelar(producto.id)}
                    className="bg-red-600 hover:bg-red-500 w-8 h-8 rounded-lg"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <p className="text-center text-gray-400">
                No se encontraron productos
              </p>
            )}
          </div>

          {/* BOTÓN CONFIRMAR */}
          <div className="flex justify-end mt-6">
            <button
              onClick={realizarPedido}
              className="bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-xl font-semibold transition shadow-lg"
            >
              Confirmar Pedido
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
