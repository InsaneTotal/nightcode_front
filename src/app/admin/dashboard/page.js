"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, DollarSign, Beer, Menu, Download } from "lucide-react";
import DashboardChart from "../components/dashboardChart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportExcelReport } from "@/utils/exportExcel.js";

function Counter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState("Semana");

  /* ================= DATOS ================= */

  const stats = [
    { title: "Ventas", value: 15555, icon: <DollarSign /> },
    { title: "Bebida Popular", value: "Poker", icon: <Beer /> },
    { title: "Alertas", value: 5, icon: <AlertCircle /> },
  ];

  const orders = [
    {
      mesa: 1,
      mesero: "William",
      metodo: "Transferencia",
      total: 15555,
      status: "aumentar",
    },
    {
      mesa: 4,
      mesero: "Laura",
      metodo: "Efectivo",
      total: 9000,
      status: "disminuir",
    },
    {
      mesa: 2,
      mesero: "Carlos",
      metodo: "Tarjeta",
      total: 12000,
      status: "cancelar",
    },
  ];

  /* ================= PDF ================= */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte - Apu's Bar", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Mesa", "Mesero", "Método", "Total", "Estado"]],
      body: orders.map((o) => [
        o.mesa,
        o.mesero,
        o.metodo,
        `$${o.total.toLocaleString()}`,
        o.status,
      ]),
    });

    doc.save(`Reporte-ApusBar-${filter}.pdf`);
  };

  /* ================= EXCEL (IMPORTADO) ================= */

  const exportExcel = async () => {
    await exportExcelReport({
      orders,
      filter,
    });
  };

  const cardStyle =
    "relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/40 rounded-3xl p-7 transition-all duration-300";

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* ================= SIDEBAR ================= */}
      <motion.aside
        animate={{ width: collapsed ? 85 : 250 }}
        className="bg-gradient-to-b from-black via-zinc-950 to-black border-r border-yellow-600/30 p-6 flex flex-col justify-between"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-10 text-yellow-500 hover:scale-110 transition"
          >
            <Menu />
          </button>

          {!collapsed && (
            <h1 className="text-yellow-500 text-2xl font-bold mb-8 tracking-wide">
              Apu's Bar
            </h1>
          )}
        </div>
      </motion.aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-12">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-14">
          <h2 className="text-4xl font-bold text-yellow-500 tracking-wide">
            Dashboard
          </h2>

          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-yellow-600/40 rounded-xl px-4 py-2 text-sm"
            >
              <option>Hoy</option>
              <option>Semana</option>
              <option>Mes</option>
            </select>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-semibold transition"
            >
              <Download size={16} />
              PDF
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-5 py-2 rounded-xl font-semibold transition shadow-lg shadow-purple-600/30"
            >
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {stats.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={cardStyle}
            >
              <p className="text-gray-400 text-sm">{card.title}</p>

              <p className="text-3xl font-bold text-yellow-500 mt-2">
                {typeof card.value === "number" ? (
                  <>
                    $<Counter value={card.value} />
                  </>
                ) : (
                  card.value
                )}
              </p>

              <div className="absolute top-6 right-6 text-purple-500 opacity-60">
                {card.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHART */}
        <div className={`${cardStyle} mb-16`}>
          <h3 className="text-yellow-500 text-lg font-semibold mb-6">
            Ventas {filter}
          </h3>
          <DashboardChart />
        </div>
      </main>
    </div>
  );
}
