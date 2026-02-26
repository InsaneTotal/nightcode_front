"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Menu,
  Settings,
} from "lucide-react";

import DashboardChart from "../components/dashboardChart";
import InventarioView from "../components/inventarioView";
import VentasDetalle from "../components/ventasView";
import EmpleadosView from "../components/empleadosView";
import ConfiguracionView from "../components/configuracionView";

/* ================= COUNTER ================= */

function Counter({ value }) {
  return <span>{Math.floor(value).toLocaleString("es-CO")}</span>;
}

/* ================= DASHBOARD ================= */

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sales, setSales] = useState(15555);
  const [currentAlert, setCurrentAlert] = useState(0);

  /* ================= SIMULACIÓN ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setSales((prev) => prev + Math.floor(Math.random() * 500));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const lowStockProducts = [
    { name: "Cerveza Poker", stock: 2 },
    { name: "Ron Medellín", stock: 1 },
    { name: "Tequila José Cuervo", stock: 3 },
  ];

  const currentProduct =
    lowStockProducts[currentAlert % lowStockProducts.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlert((prev) =>
        prev >= lowStockProducts.length - 1 ? 0 : prev + 1,
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverity = (stock) => {
    if (stock === 1) return "text-red-500";
    if (stock <= 3) return "text-orange-400";
    return "text-yellow-400";
  };

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

  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "inventario", label: "Inventario" },
    { key: "ventas", label: "Ventas" },
    { key: "empleados", label: "Empleados" },
    { key: "configuracion", label: "Configuración" },
  ];

  const cardStyle =
    "relative bg-gradient-to-br from-[#050816] via-[#0a0f2a] to-black border border-yellow-500/20 rounded-2xl p-6 shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050816] to-[#0a0f2a] text-white flex">
      {/* ================= SIDEBAR ================= */}

      <motion.aside
        animate={{ width: collapsed ? 80 : 250 }}
        className="bg-gradient-to-b from-black via-[#050816] to-[#0a0f2a] border-r border-yellow-500/20 p-6 flex flex-col justify-between"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-10 text-yellow-500 hover:text-yellow-400 transition"
          >
            <Menu />
          </button>

          {!collapsed && (
            <nav className="space-y-4 text-gray-400">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-lg transition-all ${
                    activeView === item.key
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      : "hover:text-yellow-400 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {!collapsed && (
          <div className="border-t border-yellow-500/20 pt-6">
            <button
              onClick={() => setActiveView("configuracion")}
              className="w-full flex items-center gap-3 bg-[#0a0f2a] p-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-400">Nicolás</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </button>
          </div>
        )}
      </motion.aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 p-12 space-y-12">
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-yellow-500 tracking-wide mb-12">
                Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
                <div
                  className={cardStyle}
                  onClick={() => setActiveView("ventas")}
                >
                  <p className="text-gray-400 flex items-center gap-2">
                    Ventas en Vivo
                    <Activity className="text-green-400" size={16} />
                  </p>
                  <p className="text-3xl font-bold text-green-400 mt-3">
                    $<Counter value={sales} />
                  </p>
                </div>

                <div className={cardStyle}>
                  <p className="text-gray-400 mb-4">Top Bebidas</p>
                  {topDrinks.map((drink, index) => (
                    <div
                      key={drink.name}
                      className="flex justify-between text-sm mb-2"
                    >
                      <span className="text-purple-400">
                        {index + 1}. {drink.name}
                      </span>
                      <span className="text-yellow-400">{drink.sold}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={cardStyle}
                  onClick={() => setActiveView("inventario")}
                >
                  <p className="text-gray-400">Alertas</p>
                  <p className="text-3xl font-bold text-yellow-500 mt-3">
                    {lowStockProducts.length}
                  </p>

                  <motion.div
                    key={currentAlert}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 text-sm ${getSeverity(
                      currentProduct.stock,
                    )}`}
                  >
                    {currentProduct.name} ({currentProduct.stock})
                  </motion.div>
                </div>
              </div>

              <div className={`${cardStyle} mb-14`}>
                <h3 className="text-yellow-500 text-lg mb-6">
                  Rendimiento de Ventas
                </h3>
                <DashboardChart />
              </div>

              <div className={cardStyle}>
                <h3 className="text-yellow-500 text-lg mb-8">
                  Órdenes Activas
                </h3>

                {orders.map((order, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3 border-b border-yellow-500/10 text-sm"
                  >
                    <span>Mesa {order.mesa}</span>
                    <span>{order.mesero}</span>
                    <span>{order.metodo}</span>
                    <span className="text-green-400 font-semibold">
                      ${order.total.toLocaleString("es-CO")}
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
            </motion.div>
          )}

          {activeView === "inventario" && <InventarioView />}
          {activeView === "ventas" && <VentasDetalle />}
          {activeView === "empleados" && <EmpleadosView />}
          {activeView === "configuracion" && <ConfiguracionView />}
        </AnimatePresence>
      </main>
    </div>
  );
}
