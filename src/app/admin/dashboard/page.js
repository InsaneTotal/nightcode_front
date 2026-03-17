"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, Menu } from "lucide-react";

import DashboardChart from "../components/dashboardChart";
import InventarioView from "../components/inventarioView";
import VentasDetalle from "../components/ventasView";
import EmpleadosView from "../components/empleadosView";
import ConfiguracionView from "../components/configuracionView";
import ProtectedRoute from "../../../routes/protectedRoutes";
import { getOrders, getSoldDrinks } from "../../order/waitress/hook/orders";
import { getDrinks } from "../../order/waitress/hook/drinks";
import { useApp } from "../../../context/AppContext";

/* ================= COUNTER ================= */

function Counter({ value }) {
  if (typeof value !== "number" || isNaN(value) || value <= 0)
    return <span>0</span>;
  // Asegura que value sea un número entero y lo formatea correctamente para Colombia
  return (
    <span>
      {Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
    </span>
  );
}

/* ================= DASHBOARD ================= */

export default function DashboardPage() {
  const { usuario } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sales, setSales] = useState(0);
  const [bestSales, setBestSales] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(0);
  const [lowStockDrinks, setLowStockDrinks] = useState([]);

  useEffect(() => {
    const getDailySales = async () => {
      try {
        const dailySales = await getOrders();

        // Filtrar solo las ventas del día actual
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0,
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999,
        );
        const dailySalesToday = dailySales.filter((order) => {
          if (!order.date_order) return false;
          const orderDate = new Date(order.date_order);
          return orderDate >= startOfDay && orderDate <= endOfDay;
        });
        let totalSales = 0;
        if (dailySalesToday.length > 0) {
          totalSales = dailySalesToday.reduce(
            (sum, order) => sum + order.total,
            0,
          );
        }
        setSales(totalSales);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };
    getDailySales();
    const interval = setInterval(getDailySales, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, [sales]);

  useEffect(() => {
    const getSoldDrinksData = async () => {
      try {
        const soldDrinks = await getSoldDrinks();

        if (!soldDrinks || soldDrinks.length === 0) {
          console.warn("No sold drinks data available");
          return;
        }

        setBestSales(soldDrinks);
        console.log(soldDrinks);
        // Procesar los datos de bebidas vendidas
      } catch (error) {
        console.error("Error fetching sold drinks:", error);
      }
    };
    getSoldDrinksData();
  }, []);

  useEffect(() => {
    const getLowStockDrink = async () => {
      try {
        const drinks = await getDrinks();

        if (drinks instanceof Error) {
          return "Error al cargar las bebidas";
        }

        const lowStock = drinks.filter((drink) => drink.amount <= 30);

        setLowStockDrinks(lowStock);
        console.log(lowStock);
      } catch (error) {}
    };

    getLowStockDrink();
  }, []);

  const currentProduct = lowStockDrinks[currentAlert % lowStockDrinks.length];

  // console.log(currentProduct);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlert((prev) =>
        prev >= lowStockDrinks.length - 1 ? 0 : prev + 1,
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [lowStockDrinks.length]);

  const getSeverity = (stock) => {
    if (stock <= 10) return "text-red-500";
    if (stock <= 20) return "text-orange-400";
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
    <ProtectedRoute allowedRoles={["1"]}>
      <div className="min-h-screen bg-linear-to-br from-black via-[#050816] to-[#0a0f2a] text-white flex">
        {/* ================= SIDEBAR ================= */}

        <motion.aside
          animate={{ width: collapsed ? 80 : 250 }}
          className="bg-linear-to-b from-black via-[#050816] to-[#0a0f2a] border-r border-yellow-500/20 p-6 flex flex-col justify-between"
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
                  {(usuario?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-400">
                    {usuario?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {usuario?.role?.name || "Sin rol"}
                  </p>
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
                      <Counter value={sales} />
                    </p>
                  </div>

                  <div className={cardStyle}>
                    <p className="text-gray-400 mb-4">Top Bebidas</p>
                    {bestSales.map((drink, index) => (
                      <div
                        key={drink.drink_1}
                        className="flex justify-between text-sm mb-2"
                      >
                        <span className="text-purple-400">
                          {index + 1}. {drink.drink_name}
                        </span>
                        <span className="text-yellow-400">
                          {drink.total_units_sold}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={cardStyle}
                    onClick={() => setActiveView("inventario")}
                  >
                    <p className="text-gray-400">Alertas</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-3">
                      {lowStockDrinks.length}
                    </p>

                    <motion.div
                      key={currentAlert}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-4 text-sm ${getSeverity(currentProduct?.amount ?? 0)}`}
                    >
                      {currentProduct
                        ? `${currentProduct.name} (${currentProduct.amount})`
                        : "Sin alertas de inventario"}
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
    </ProtectedRoute>
  );
}
