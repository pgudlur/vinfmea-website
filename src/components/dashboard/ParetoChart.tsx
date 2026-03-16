"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import type { FailureCause } from "@/lib/types";

interface ParetoChartProps {
  data: FailureCause[];
  title: string;
}

function getRpnBarColor(rpn: number): string {
  if (rpn >= 200) return "#f87171"; // Red – Critical
  if (rpn >= 100) return "#fb923c"; // Orange – High
  if (rpn >= 50) return "#facc15";  // Yellow – Medium
  return "#4ade80";                  // Green – Low
}

export default function ParetoChart({ data, title }: ParetoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
        <p className="py-6 text-center text-sm text-gray-400">
          No data available
        </p>
      </div>
    );
  }

  // Take top 7, compute cumulative %
  const top = data.slice(0, 7);
  const totalRpn = top.reduce((sum, d) => sum + (d.initial_rpn ?? 0), 0);
  let cumulative = 0;
  const chartData = top.map((d) => {
    cumulative += d.initial_rpn ?? 0;
    return {
      name:
        d.failure_cause.length > 15
          ? d.failure_cause.slice(0, 13) + "…"
          : d.failure_cause,
      rpn: d.initial_rpn ?? 0,
      cumulative_pct: totalRpn > 0 ? Math.round((cumulative / totalRpn) * 100) : 0,
    };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, bottom: 40, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            label={{
              value: "RPN",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            label={{
              value: "%",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconSize={10}
          />
          <Bar
            yAxisId="left"
            dataKey="rpn"
            name="RPN"
            radius={[4, 4, 0, 0]}
            barSize={32}
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={getRpnBarColor(entry.rpn)} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative_pct"
            name="Cumulative %"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: "#ef4444" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
