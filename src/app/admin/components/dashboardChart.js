"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchSalesData } from "../hooks/sales";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseVentaDate(order) {
  const rawDate =
    order?.date_order || order?.created_at || order?.fecha || order?.date;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
}

function parseVentaTotal(order) {
  const total = order?.total ?? order?.total_price ?? order?.subtotal ?? 0;
  const parsedTotal = Number(total);

  return Number.isFinite(parsedTotal) ? parsedTotal : 0;
}

export default function DashboardChart() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const getSalesData = async () => {
      try {
        const data = await fetchSalesData();
        setSales(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    getSalesData();
  }, []);

  const weeklySales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);

    const dailyTotals = WEEKDAY_ORDER.map((dayNumber) => ({
      dayNumber,
      name: WEEKDAY_LABELS[dayNumber],
      ventas: 0,
    }));

    sales.forEach((order) => {
      const orderDate = parseVentaDate(order);
      if (!orderDate) return;

      orderDate.setHours(0, 0, 0, 0);
      if (orderDate < startDate || orderDate > today) return;

      const currentDay = dailyTotals.find(
        (item) => item.dayNumber === orderDate.getDay(),
      );

      if (currentDay) {
        currentDay.ventas += parseVentaTotal(order);
      }
    });

    return dailyTotals;
  }, [sales]);

  return (
    <div className="bg-zinc-900 border border-yellow-700 rounded-3xl p-8 mb-12 shadow-lg shadow-purple-900/30">
      <h3 className="text-yellow-500 text-lg font-semibold mb-6">
        Ventas Semanales
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklySales}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #eab308",
              borderRadius: "12px",
            }}
            labelStyle={{ color: "#eab308" }}
          />
          <Bar
            dataKey="ventas"
            fill="url(#colorGradient)"
            radius={[10, 10, 0, 0]}
          />

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
