"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 text-lg font-extrabold text-slate-800">
        Kehadiran Hari Ini
      </h2>

      <div className="h-[260px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="_id"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
            >
              {data.map((d) => (
                <Cell
                  key={d._id}
                  fill={COLORS[d._id as keyof typeof COLORS] || "#94a3b8"}
                />
              ))}
            </Pie>

            {/* Center Text */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-800 text-xl font-extrabold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-sm"
            >
              Total
            </text>

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,.08)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-slate-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
