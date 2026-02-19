"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, Menu } from "lucide-react";

import DashboardChart from "../components/dashboardChart";
import InventarioView from "../components/inventarioView";

/* ================= COUNTER ================= */

function Counter({ value }) {
  return <span>{Math.floor(value).toLocaleString()}</span>;
}

/* ================= DASHBOARD ================= */

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const [sales, setSales] = useState(15555);
  const [currentAlert, setCurrentAlert] = useState(0);

  /* ================= SIMULACIÓN VENTAS ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setSales((prev) => prev + Math.floor(Math.random() * 500));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* ================= BEBIDAS ================= */

  const [drinks, setDrinks] = useState([
    { name: "Cerveza Poker", sold: 120 },
    { name: "Ron Medellín", sold: 95 },
    { name: "Tequila José Cuervo", sold: 80 },
    { name: "Whisky Old Parr", sold: 70 },
    { name: "Red Bull", sold: 60 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDrinks((prev) =>
        prev.map((drink) => ({
          ...drink,
          sold: drink.sold + Math.floor(Math.random() * 10),
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const topDrinks = useMemo(() => {
    return [...drinks].sort((a, b) => b.sold - a.sold).slice(0, 3);
  }, [drinks]);

  /* ================= ALERTAS ================= */

  const lowStockProducts = [
    { name: "Cerveza Poker", stock: 2 },
    { name: "Ron Medellín", stock: 1 },
    { name: "Tequila José Cuervo", stock: 3 },
  ];

  useEffect(() => {
    if (!lowStockProducts.length) return;

    const interval = setInterval(() => {
      setCurrentAlert((prev) =>
        prev >= lowStockProducts.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [lowStockProducts.length]);

  const currentProduct =
    lowStockProducts[currentAlert % lowStockProducts.length];

  const getSeverity = (stock) => {
    if (stock === 1) return "text-red-500";
    if (stock <= 3) return "text-orange-400";
    return "text-yellow-400";
  };

  /* ================= ÓRDENES ================= */

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

  const statusColor = {
    aumentar: "text-green-400",
    disminuir: "text-yellow-400",
    cancelar: "text-red-500",
  };

  const statusIcon = {
    aumentar: <TrendingUp size={16} />,
    disminuir: <TrendingDown size={16} />,
    cancelar: <Minus size={16} />,
  };

  const cardStyle =
    "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/20 rounded-2xl p-4 sm:p-5 md:p-6";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        className="w-full md:w-auto bg-zinc-950 border-b md:border-b-0 md:border-r border-yellow-600/20 p-4 md:p-6 flex md:flex-col justify-between"
      >
        <div className="w-full">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-4 md:mb-10 text-yellow-500"
          >
            <Menu />
          </button>

          {!collapsed && (
            <>
              <h1 className="text-yellow-500 text-lg md:text-xl font-bold mb-6 tracking-widest">
                APU'S BAR
              </h1>

              <nav className="flex md:flex-col gap-4 md:space-y-4 text-gray-400 text-sm md:text-base">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className="text-left px-3 py-2 rounded-xl hover:text-yellow-400 transition-colors"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveView("inventario")}
                  className="text-left px-3 py-2 rounded-xl hover:text-yellow-400 transition-colors"
                >
                  Inventario
                </button>

                <button className="text-left px-3 py-2 rounded-xl hover:text-yellow-400 transition-colors">
                  Ventas
                </button>

                <button className="text-left px-3 py-2 rounded-xl hover:text-yellow-400 transition-colors">
                  Empleados
                </button>
              </nav>
            </>
          )}
        </div>
      </motion.aside>

      {/* MAIN */}
      <main className="flex-1 p-4 sm:p-6 md:p-12">
        {activeView === "dashboard" && (
          <>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-yellow-500 mb-8 md:mb-14">
              Dashboard
            </h2>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* VENTAS */}
              <div className={cardStyle}>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  Ventas en Vivo
                  <Activity className="text-green-400" size={16} />
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mt-2">
                  $<Counter value={sales} />
                </p>
              </div>

              {/* TOP BEBIDAS */}
              <div className={cardStyle}>
                <p className="text-gray-400 text-sm mb-3">
                  Bebidas Más Vendidas
                </p>
                <div className="space-y-2 text-sm">
                  {topDrinks.map((drink, index) => (
                    <div key={drink.name} className="flex justify-between">
                      <span className="text-yellow-400 truncate">
                        {index + 1}. {drink.name}
                      </span>
                      <span className="text-purple-400">
                        {drink.sold} ventas
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALERTAS */}
              <div className={cardStyle}>
                <p className="text-gray-400 text-sm">Alertas</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-500 mt-2">
                  {lowStockProducts.length}
                </p>

                <div className="mt-4 h-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentAlert}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`text-sm font-medium ${getSeverity(
                        currentProduct.stock,
                      )}`}
                    >
                      {currentProduct.name} ({currentProduct.stock} en stock)
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className={`${cardStyle} mb-12`}>
              <h3 className="text-yellow-500 text-lg font-semibold mb-6">
                Ventas
              </h3>
              <DashboardChart />
            </div>

            {/* TABLA ÓRDENES */}
            <div className={cardStyle}>
              <h3 className="text-yellow-500 text-lg font-semibold mb-8">
                Órdenes Activas
              </h3>

              <div className="grid grid-cols-5 text-gray-500 border-b border-yellow-600/20 pb-4 mb-4 text-sm">
                <span>Mesa</span>
                <span>Mesero</span>
                <span>Método</span>
                <span>Total</span>
                <span>Estado</span>
              </div>

              {orders.map((order, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 py-4 border-b border-white/5 text-sm"
                >
                  <span>{order.mesa}</span>
                  <span>{order.mesero}</span>
                  <span>{order.metodo}</span>
                  <span className="text-green-400 font-semibold">
                    ${order.total.toLocaleString()}
                  </span>
                  <span
                    className={`flex items-center gap-2 ${statusColor[order.status]}`}
                  >
                    {statusIcon[order.status]}
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeView === "inventario" && <InventarioView />}
      </main>
    </div>
  );
}
