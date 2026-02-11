"use client";

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  HADIR: "#10b981",
  SAKIT: "#f59e0b",
  IZIN: "#0ea5e9",
  ALPA: "#ef4444",
};

export default function DashboardWaliChart({
  data,
}: {
  data: { _id: string; total: number }[];
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 text-lg font-extrabold">Kehadiran Hari Ini</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="_id"
            outerRadius={110}
            label
          >
            {data.map((d) => (
              <Cell key={d._id} fill={COLORS[d._id as keyof typeof COLORS] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}