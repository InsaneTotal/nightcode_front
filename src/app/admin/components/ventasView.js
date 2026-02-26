"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generarPdfVentas } from "../utils/pdfVentas";

export default function VentasView() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const ventas = [
    {
      id: 1,
      fecha: "2026-02-19T12:30:00",
      metodo: "Efectivo",
      empleado: "Carlos",
      productos: [
        { nombre: "Ron Medellín", cantidad: 2, precio: 18000 },
        { nombre: "Cerveza Poker", cantidad: 3, precio: 6000 },
      ],
    },
    {
      id: 2,
      fecha: "2026-02-19T14:10:00",
      metodo: "Nequi",
      empleado: "Laura",
      productos: [{ nombre: "Whisky Old Parr", cantidad: 1, precio: 75000 }],
    },
    {
      id: 3,
      fecha: "2026-02-18T22:45:00",
      metodo: "Transferencia",
      empleado: "Andrés",
      productos: [
        { nombre: "Tequila José Cuervo", cantidad: 2, precio: 85000 },
      ],
    },
    {
      id: 4,
      fecha: "2026-02-17T20:15:00",
      metodo: "Efectivo",
      empleado: "Sofía",
      productos: [{ nombre: "Red Bull", cantidad: 4, precio: 9000 }],
    },
  ];

  const formatMoney = (num) => "$" + num.toLocaleString("es-CO");

  const calcularTotal = (productos) =>
    productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

  const ventasFiltradas = useMemo(() => {
    if (!fechaInicio || !fechaFin) return ventas;

    return ventas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59);

      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  }, [fechaInicio, fechaFin]);

  const totalGeneral = ventasFiltradas.reduce(
    (acc, v) => acc + calcularTotal(v.productos),
    0,
  );

  const totalEfectivo = ventasFiltradas
    .filter((v) => v.metodo === "Efectivo")
    .reduce((acc, v) => acc + calcularTotal(v.productos), 0);

  const totalTransferencia = ventasFiltradas
    .filter((v) => v.metodo !== "Efectivo")
    .reduce((acc, v) => acc + calcularTotal(v.productos), 0);

  const exportarExcel = () => {
    window.open("/api/export-excel");
  };

  const exportarPDF = () => {
    generarPdfVentas({
      ventas: ventasFiltradas,
      fechaInicio,
      fechaFin,
      totalGeneral,
      formatMoney,
      calcularTotal,
    });
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h2 className="text-3xl font-bold text-yellow-500 mb-8">
        Detalle de Ventas
      </h2>

      {/* ================= RESUMEN FINANCIERO ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
          <p className="text-gray-400 text-sm">Total General</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {formatMoney(totalGeneral)}
          </h2>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
          <p className="text-gray-400 text-sm">Total Efectivo</p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {formatMoney(totalEfectivo)}
          </h2>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
          <p className="text-gray-400 text-sm">Total Transferencias</p>
          <h2 className="text-3xl font-bold text-purple-400 mt-2">
            {formatMoney(totalTransferencia)}
          </h2>
        </div>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="bg-gray-900/60 border border-yellow-500/30 rounded-2xl p-6 mb-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-black border border-yellow-500/40 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-black border border-yellow-500/40 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <button
            onClick={exportarExcel}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            Exportar Excel
          </button>

          <button
            onClick={exportarPDF}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ================= VENTAS ================= */}
      {ventasFiltradas.map((venta) => (
        <motion.div
          key={venta.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-black to-gray-900 border border-yellow-500/30 rounded-2xl p-6 mb-8 shadow-md hover:shadow-yellow-500/20 transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">
                {new Date(venta.fecha).toLocaleString()}
              </p>

              <p className="mt-1">
                <span className="text-gray-400">Empleado:</span>{" "}
                <span className="text-white font-semibold">
                  {venta.empleado}
                </span>
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                  venta.metodo === "Efectivo"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-purple-500/20 text-purple-400"
                }`}
              >
                {venta.metodo === "Efectivo" ? "Efectivo" : "Transferencia"}
              </span>
            </div>

            <h3 className="text-green-400 text-xl font-bold">
              {formatMoney(calcularTotal(venta.productos))}
            </h3>
          </div>

          <hr className="border-yellow-500/20 mb-4" />

          <div className="space-y-2">
            {venta.productos.map((p, i) => (
              <div key={i} className="flex justify-between text-gray-300">
                <span>{p.nombre}</span>
                <span>
                  {p.cantidad} x {formatMoney(p.precio)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
