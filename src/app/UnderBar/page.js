"use client";
import React, { useState } from "react";
import VistaPedidos from "./components/VistaPedidos";
import HistorialPedidos from "./components/HistorialPedidos";
import ProtectedRoute from "../../routes/protectedRoutes";

export default function Barra() {
  const [vista, setVista] = useState("barra");

  const [pedidosPendientes, setPedidosPendientes] = useState([
    {
      id: 1,
      mesa: 1,
      pedido: [
        { cantidad: 3, nombre: "Poker" },
        { cantidad: 2, nombre: "Águilas" },
        { cantidad: 3, nombre: "Club Colombia" },
      ],
    },
    {
      id: 2,
      mesa: 2,
      pedido: [{ cantidad: 2, nombre: "Águilas" }],
    },
    {
      id: 3,
      mesa: 3,
      pedido: [{ cantidad: 1, nombre: "Aguardiente" }],
    },
  ]);

  const [historial, setHistorial] = useState([]);

  const marcarListo = (pedido) => {
    // 1️⃣ eliminar de pendientes
    setPedidosPendientes((prev) => prev.filter((p) => p.id !== pedido.id));

    // 2️⃣ agregar a historial
    setHistorial((prev) => [
      ...prev,
      { ...pedido, hora: new Date().toLocaleTimeString() },
    ]);
  };

  return (
    <ProtectedRoute allowedRoles={["1", "3"]}>
      <div className="relative min-h-screen bg-[url('/img_fondo_bar.jpg')] bg-cover bg-center flex flex-col items-center pt-2 px-4 pb-6">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="min-h-screen  text-white p-8 z-10">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-yellow-400">
              {vista === "barra" ? "Barra" : "Historial"}
            </h1>

            <button
              onClick={() =>
                setVista(vista === "barra" ? "historial" : "barra")
              }
              className="px-5 py-2 rounded-lg
          border border-yellow-500/40
          text-yellow-400
          hover:bg-yellow-500
          hover:text-black
          hover:shadow-[0_0_15px_rgba(234,179,8,0.6)]
          transition duration-300"
            >
              {vista === "barra" ? "Ver Historial" : "Volver"}
            </button>
          </div>

          {vista === "barra" ? (
            <VistaPedidos
              pedidos={pedidosPendientes}
              marcarListo={marcarListo}
            />
          ) : (
            <HistorialPedidos historial={historial} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
