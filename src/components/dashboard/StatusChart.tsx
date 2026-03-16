"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatusChartProps {
  distribution: Record<string, number> | null | undefined;
}

const STATUS_CHART_COLORS: Record<string, string> = {
  Open: "#f87171",
  "In Progress": "#facc15",
  Completed: "#4ade80",
  Deferred: "#94a3b8",
  Cancelled: "#d1d5db",
};

export default function StatusChart({ distribution }: StatusChartProps) {
  const data = Object.entries(distribution ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">No data available</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 20, bottom: 0, left: 80 }}
      >
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_CHART_COLORS[entry.name] || "#94a3b8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
