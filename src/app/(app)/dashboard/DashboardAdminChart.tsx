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

export default function DashboardAdminChart({
  data,
}: {
  data: { className: string; total: number }[];
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 text-lg font-extrabold text-slate-800">
        Jumlah Siswa per Kelas
      </h2>

      <div className="h-[260px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 24 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="className"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,.08)",
              }}
            />

            <Bar
              dataKey="total"
              radius={[10, 10, 0, 0]}
              fill="url(#barGradient)"
            />

            {/* Gradient */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
