"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generarPdfVentas } from "../utils/pdfVentas";
import { getOrders } from "../../order/waitress/hook/orders";
import { getPayments } from "../../order/waitress/hook/payOrder";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../../utils/realtime";

const ORDER_STATUS_PAID = 4;

// Nequi y Daviplata se muestran como Transferencia
const NORMALIZAR_METODO = {
  nequi: "Transferencia",
  daviplata: "Transferencia",
};

const normalizarMetodo = (nombre) => {
  if (!nombre) return "No definido";
  return NORMALIZAR_METODO[nombre.toLowerCase()] ?? nombre;
};

export default function VentasView() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metodosPago, setMetodosPago] = useState([]);

  const formatMoney = (num) => "$" + num.toLocaleString("es-CO");

  const calcularTotal = (productos, totalRespaldo = 0) => {
    if (!productos || productos.length === 0) {
      return Number(totalRespaldo || 0);
    }

    return productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
  };

  const getNombreEmpleado = (order) => {
    const nombreDesdeObjeto =
      order?.user?.first_name || order?.id_users_data?.first_name;
    const apellidoDesdeObjeto =
      order?.user?.last_name || order?.id_users_data?.last_name;
    const nombreCompleto = [nombreDesdeObjeto, apellidoDesdeObjeto]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (nombreCompleto) return nombreCompleto;
    return order?.employee_name || order?.mesero || "Sin empleado";
  };

  const getMetodoPago = (order, metodosLista) => {
    // Intenta nombre desde objeto anidado
    const nombreAnidado =
      order?.payment_method?.name ||
      order?.id_payment?.name ||
      order?.id_payment_data?.name ||
      order?.metodo ||
      null;

    if (nombreAnidado) return normalizarMetodo(nombreAnidado);

    // Fallback: buscar por ID en la lista de métodos de pago
    const id = order?.id_payment;
    if (id && metodosLista?.length > 0) {
      const encontrado = metodosLista.find((m) => m.id === id);
      if (encontrado) return normalizarMetodo(encontrado.name);
    }

    return "No definido";
  };

  const loadVentas = useCallback(async () => {
    try {
      const [orders, metodos] = await Promise.all([getOrders(), getPayments()]);

      if (metodos?.length > 0) setMetodosPago(metodos);

      const paidOrders = Array.isArray(orders)
        ? orders.filter(
            (order) => Number(order.id_order_status) === ORDER_STATUS_PAID,
          )
        : [];

      const ventasMapeadas = paidOrders.map((order) => ({
        id: order.id,
        fecha:
          order.date_order ||
          order.updated_at ||
          order.created_at ||
          new Date().toISOString(),
        metodo: getMetodoPago(order, metodos),
        empleado: order.full_name || "Sin Empleado",
        total: Number(order.total || 0),
        productos: (order.details || []).map((detail) => ({
          nombre: detail?.drink?.name || "Producto desconocido",
          cantidad: Number(detail?.amount || 0),
          precio: Number(detail?.unit_price || 0),
        })),
      }));

      setVentas(ventasMapeadas);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas();

    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, ["order", "orders", "payment", "payments"])
      ) {
        loadVentas();
      }
    });

    return () => unsubscribe();
  }, [loadVentas]);

  const ventasFiltradas = useMemo(() => {
    if (!fechaInicio || !fechaFin) return ventas;

    return ventas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59);

      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  }, [fechaInicio, fechaFin, ventas]);

  const totalGeneral = ventasFiltradas.reduce(
    (acc, v) => acc + calcularTotal(v.productos, v.total),
    0,
  );

  const totalEfectivo = ventasFiltradas
    .filter((v) => v.metodo.toLowerCase().includes("efectivo"))
    .reduce((acc, v) => acc + calcularTotal(v.productos, v.total), 0);

  const totalTransferencia = ventasFiltradas
    .filter((v) => !v.metodo.toLowerCase().includes("efectivo"))
    .reduce((acc, v) => acc + calcularTotal(v.productos, v.total), 0);

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
        <div className="bg-linear-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
          <p className="text-gray-400 text-sm">Total General</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {formatMoney(totalGeneral)}
          </h2>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
          <p className="text-gray-400 text-sm">Total Efectivo</p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {formatMoney(totalEfectivo)}
          </h2>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition">
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
      {loading && <div className="text-gray-400">Cargando ventas...</div>}

      {!loading && ventasFiltradas.length === 0 && (
        <div className="text-gray-400">No hay ventas para mostrar.</div>
      )}

      {ventasFiltradas.map((venta) => (
        <motion.div
          key={venta.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="bg-linear-to-br from-black to-gray-900 border border-yellow-500/30 rounded-2xl p-6 mb-8 shadow-md hover:shadow-yellow-500/20 transition-all"
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
                  venta.metodo.toLowerCase().includes("efectivo")
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-purple-500/20 text-purple-400"
                }`}
              >
                {venta.metodo}
              </span>
            </div>

            <h3 className="text-green-400 text-xl font-bold">
              {formatMoney(calcularTotal(venta.productos, venta.total))}
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
