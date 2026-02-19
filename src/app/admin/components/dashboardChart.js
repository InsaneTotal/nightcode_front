"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Lun", ventas: 12000 },
  { name: "Mar", ventas: 18000 },
  { name: "Mié", ventas: 9000 },
  { name: "Jue", ventas: 22000 },
  { name: "Vie", ventas: 30000 },
  { name: "Sáb", ventas: 45000 },
  { name: "Dom", ventas: 28000 },
];

export default function DashboardChart() {
  return (
    <div className="bg-zinc-900 border border-yellow-700 rounded-3xl p-8 mb-12 shadow-lg shadow-purple-900/30">
      <h3 className="text-yellow-500 text-lg font-semibold mb-6">
        Ventas Semanales
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
