"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Menu,
  X,
} from "lucide-react";

import DashboardChart from "../components/dashboardChart";
import InventarioView from "../components/inventarioView";
import VentasDetalle from "../components/ventasView";
import EmpleadosView from "../components/empleadosView";
import ConfiguracionView from "../components/configuracionView";
import MesasQrView from "../components/mesasQrView";
import ProtectedRoute from "../../../routes/protectedRoutes";
import { getOrders, getSoldDrinks } from "../../order/waitress/hook/orders";
import { getDrinks } from "../../order/waitress/hook/drinks";
import { useApp } from "../../../context/AppContext";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../../utils/realtime";

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
  const { usuario, authLoading } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sales, setSales] = useState(0);
  const [bestSales, setBestSales] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(0);
  const [lowStockDrinks, setLowStockDrinks] = useState([]);
  const canFetchDashboardData =
    !authLoading &&
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("accessToken")) &&
    String(usuario?.role?.id || "") === "1";

  const loadDailySales = useCallback(async () => {
    if (!canFetchDashboardData) return;

    try {
      const dailySales = await getOrders();

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
  }, [canFetchDashboardData]);

  const loadSoldDrinksData = useCallback(async () => {
    if (!canFetchDashboardData) return;

    try {
      const soldDrinks = await getSoldDrinks();

      if (!soldDrinks || soldDrinks.length === 0) {
        console.warn("No sold drinks data available");
        setBestSales([]);
        return;
      }

      setBestSales(soldDrinks);
    } catch (error) {
      console.error("Error fetching sold drinks:", error);
    }
  }, [canFetchDashboardData]);

  const loadLowStockDrink = useCallback(async () => {
    if (!canFetchDashboardData) return;

    try {
      const drinks = await getDrinks();

      if (drinks instanceof Error) {
        return "Error al cargar las bebidas";
      }

      const lowStock = drinks.filter((drink) => drink.amount <= 30);

      setLowStockDrinks(lowStock);
    } catch (error) {
      console.error("Error fetching low stock drinks:", error);
    }
  }, [canFetchDashboardData]);

  const loadDashboardData = useCallback(async () => {
    await Promise.all([
      loadDailySales(),
      loadSoldDrinksData(),
      loadLowStockDrink(),
    ]);
  }, [loadDailySales, loadSoldDrinksData, loadLowStockDrink]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboardData]);

  useEffect(() => {
    if (!canFetchDashboardData) return;

    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, [
          "order",
          "orders",
          "payment",
          "payments",
          "inventory",
          "drinks",
          "categories",
          "table",
          "tables",
        ])
      ) {
        loadDashboardData();
      }
    });

    return () => unsubscribe();
  }, [canFetchDashboardData, loadDashboardData]);

  const currentProduct = lowStockDrinks[currentAlert % lowStockDrinks.length];

  // console.log(currentProduct);
  useEffect(() => {
    if (!canFetchDashboardData) return;

    const interval = setInterval(() => {
      setCurrentAlert((prev) =>
        prev >= lowStockDrinks.length - 1 ? 0 : prev + 1,
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [canFetchDashboardData, lowStockDrinks.length]);

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
    { key: "mesasQr", label: "Mesas QR" },
    { key: "configuracion", label: "Configuración" },
  ];

  const cardStyle =
    "relative bg-gradient-to-br from-[#050816] via-[#0a0f2a] to-black border border-yellow-500/20 rounded-2xl p-6 shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 backdrop-blur-sm";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const previous = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previous || "";
    }

    return () => {
      document.body.style.overflow = previous || "";
    };
  }, [mobileMenuOpen]);

  const drawerVariants = {
    closed: {
      x: "-105%",
      opacity: 0.96,
      transition: {
        type: "spring",
        stiffness: 420,
        damping: 42,
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 360,
        damping: 34,
      },
    },
  };

  const listVariants = {
    closed: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 },
  };

  const handleSelectView = (viewKey) => {
    setActiveView(viewKey);
    setMobileMenuOpen(false);
  };

  return (
    <ProtectedRoute allowedRoles={["1"]}>
      <div className="min-h-screen w-full overflow-x-hidden bg-linear-to-br from-black via-[#050816] to-[#0a0f2a] text-white flex">
        {/* ================= SIDEBAR ================= */}

        <motion.aside
          animate={{ width: collapsed ? 80 : 250 }}
          className="hidden md:flex bg-linear-to-b from-black via-[#050816] to-[#0a0f2a] border-r border-yellow-500/20 p-6 flex-col justify-between"
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
                    onClick={() => handleSelectView(item.key)}
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
                onClick={() => handleSelectView("configuracion")}
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

        {/* ================= SIDEBAR MÓVIL OVERLAY ================= */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed left-0 top-0 z-50 h-full w-[84vw] max-w-[320px] border-r border-yellow-500/20 bg-linear-to-b from-black via-[#050816] to-[#0a0f2a] p-5 md:hidden shadow-[12px_0_40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-yellow-400">Menú</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-yellow-400 hover:text-yellow-300"
                  aria-label="Cerrar menú lateral"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.nav
                variants={listVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="space-y-2 text-gray-300"
              >
                {menuItems.map((item) => (
                  <motion.button
                    variants={itemVariants}
                    key={item.key}
                    onClick={() => handleSelectView(item.key)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base transition-all ${
                      activeView === item.key
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                        : "hover:text-yellow-400 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </motion.nav>

              <motion.div
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="mt-8 border-t border-yellow-500/20 pt-5"
              >
                <button
                  onClick={() => handleSelectView("configuracion")}
                  className="w-full flex items-center gap-3 bg-[#0a0f2a] p-3 rounded-xl border border-yellow-500/20"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                    {(usuario?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-yellow-400 truncate">
                      {usuario?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {usuario?.role?.name || "Sin rol"}
                    </p>
                  </div>
                </button>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ================= MAIN ================= */}

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 lg:p-12 space-y-8 md:space-y-12">
          <div className="md:hidden mb-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-black/30 px-3 py-2 text-yellow-400"
              aria-label="Abrir menú lateral"
            >
              <Menu size={18} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500 tracking-wide mb-6 sm:mb-8 md:mb-12">
                  Dashboard
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-14">
                  <div
                    className={cardStyle}
                    onClick={() => handleSelectView("ventas")}
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
                        key={drink.drink_id ?? drink.drink_name ?? index}
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
                    onClick={() => handleSelectView("inventario")}
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

                <div className={`${cardStyle} mb-8 md:mb-14`}>
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
                      className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-3 border-b border-yellow-500/10 text-sm"
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
            {activeView === "mesasQr" && <MesasQrView />}
            {activeView === "configuracion" && <ConfiguracionView />}
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
