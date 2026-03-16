"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, type PieLabelRenderProps } from "recharts";

interface ApPieChartProps {
  distribution: Record<string, number> | null | undefined;
}

const AP_PIE_COLORS: Record<string, string> = {
  H: "#f87171",
  M: "#fb923c",
  L: "#4ade80",
};

const AP_LABELS: Record<string, string> = {
  H: "High",
  M: "Medium",
  L: "Low",
};

export default function ApPieChart({ distribution }: ApPieChartProps) {
  const data = Object.entries(distribution ?? {}).map(([key, value]) => ({
    name: AP_LABELS[key] || key,
    value,
    key,
  }));

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">No data available</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          label={(props: PieLabelRenderProps) => {
            const n = String(props.name ?? "");
            const p = Number(props.percent ?? 0);
            const RADIAN = Math.PI / 180;
            const midAngle = Number(props.midAngle ?? 0);
            const outerR = Number(props.outerRadius ?? 80);
            const cx2 = Number(props.cx ?? 0);
            const cy2 = Number(props.cy ?? 0);
            const radius = outerR + 25;
            const x = cx2 + radius * Math.cos(-midAngle * RADIAN);
            const y = cy2 + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text
                x={x}
                y={y}
                fill="#374151"
                textAnchor={x > cx2 ? "start" : "end"}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={500}
              >
                {`${n} ${(p * 100).toFixed(0)}%`}
              </text>
            );
          }}
          labelLine={true}
        >
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={AP_PIE_COLORS[entry.key] || "#94a3b8"}
              strokeWidth={1}
              stroke="#fff"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
          formatter={(value, name) => [`${value} entries`, String(name)]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
