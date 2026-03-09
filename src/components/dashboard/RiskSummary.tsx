"use client";

import type { ProjectStats } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RiskSummaryProps {
  stats: ProjectStats | null;
}

const CRITICALITY_CHART_COLORS: Record<string, string> = {
  Low: "#4ade80",
  Medium: "#facc15",
  High: "#fb923c",
  Critical: "#f87171",
};

const AP_CHART_COLORS: Record<string, string> = {
  H: "#f87171",
  M: "#fb923c",
  L: "#4ade80",
};

export default function RiskSummary({ stats }: RiskSummaryProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  const criticalityData = Object.entries(stats.criticality_distribution).map(
    ([name, value]) => ({ name, value })
  );

  const apData = Object.entries(stats.ap_distribution).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Criticality Distribution */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Criticality Distribution
        </h3>
        {criticalityData.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={criticalityData}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 60 }}
            >
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {criticalityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CRITICALITY_CHART_COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Action Priority Distribution */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Action Priority
        </h3>
        {apData.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={apData}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 30 }}
            >
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {apData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={AP_CHART_COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
