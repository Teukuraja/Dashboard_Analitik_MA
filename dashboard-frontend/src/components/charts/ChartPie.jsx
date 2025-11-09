
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3182CE", "#63B3ED", "#90CDF4", "#4299E1", "#2B6CB0",
  "#7F9CF5", "#805AD5", "#9F7AEA", "#B794F4", "#D53F8C"
];

// === Komponen ChartPie untuk menampilkan grafik pie/donut ===
export default function ChartPie({ title, data }) {
  return (
    <div className="w-full h-[420px] px-2">
      <h2 className="text-lg font-semibold mb-4 text-center dark:text-white">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 40, right: 100, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="40%"
            cy="50%"
            innerRadius={60}   // Donut style
            outerRadius={100}
            label={false}      // Tidak tampil label di atas pie
            isAnimationActive={true}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              fontSize: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              position: "absolute",
              right: 10,
              lineHeight: "22px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
