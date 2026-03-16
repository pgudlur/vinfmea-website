"use client";

import type { ProjectStats } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ApPieChart from "./ApPieChart";
import StatusChart from "./StatusChart";
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

/** Merge multiple Record<string, number> dictionaries by summing values. */
function mergeDistributions(...dists: (Record<string, number> | null | undefined)[]): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const dist of dists) {
    for (const [key, val] of Object.entries(dist ?? {})) {
      merged[key] = (merged[key] ?? 0) + val;
    }
  }
  return merged;
}

export default function RiskSummary({ stats }: RiskSummaryProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  // Merge per-type distributions into combined views
  const critDist = mergeDistributions(
    stats.sfmea_by_criticality,
    stats.dfmea_by_criticality,
    stats.pfmea_by_criticality
  );
  const apDist = mergeDistributions(
    stats.sfmea_by_ap,
    stats.dfmea_by_ap,
    stats.pfmea_by_ap
  );
  const statusDist = mergeDistributions(
    stats.sfmea_by_status,
    stats.dfmea_by_status,
    stats.pfmea_by_status
  );

  const criticalityData = Object.entries(critDist).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {/* Action Priority Donut */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Action Priority
        </h3>
        <ApPieChart distribution={apDist} />
      </div>

      {/* Action Status Distribution */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Action Status
        </h3>
        <StatusChart distribution={statusDist} />
      </div>
    </div>
  );
}
