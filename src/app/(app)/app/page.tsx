"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analytics, sync } from "@/lib/api";
import type { DashboardSummary, TopRisk, ProjectStats, FailureCause } from "@/lib/types";
import CountCards from "@/components/dashboard/CountCards";
import TopRisks from "@/components/dashboard/TopRisks";
import RiskSummary from "@/components/dashboard/RiskSummary";
import FailureCausesChart from "@/components/dashboard/FailureCausesChart";
import ParetoChart from "@/components/dashboard/ParetoChart";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { LayoutDashboard, FolderPlus, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [risks, setRisks] = useState<TopRisk[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [dfmeaCauses, setDfmeaCauses] = useState<FailureCause[]>([]);
  const [pfmeaCauses, setPfmeaCauses] = useState<FailureCause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashboardData, topRisks, statsData, dfmeaFC, pfmeaFC] =
          await Promise.all([
            analytics.dashboardSummary(),
            sync.topRisks({ limit: 10 }),
            sync.stats(),
            analytics.failureCauses({ limit: 10, fmea_type: "dfmea" }),
            analytics.failureCauses({ limit: 10, fmea_type: "pfmea" }),
          ]);
        setSummary(dashboardData);
        setRisks(topRisks);
        setStats(statsData);
        setDfmeaCauses(dfmeaFC ?? []);
        setPfmeaCauses(pfmeaFC ?? []);
      } catch {
        // Data will remain null/empty — components handle empty states
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <LoadingSkeleton lines={2} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <LoadingSkeleton lines={5} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <LoadingSkeleton lines={6} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <LoadingSkeleton lines={6} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  const counts = summary?.counts ?? {
    projects: 0,
    assemblies: 0,
    parts: 0,
    sfmea: 0,
    dfmea: 0,
    pfmea: 0,
    control_plan: 0,
  };

  const allZero = Object.values(counts).every((v) => v === 0);

  if (allZero) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<FolderPlus size={28} />}
          title="Welcome to vinFMEA"
          description="Get started by creating your first project. Projects organize your assemblies, parts, and FMEA analyses."
          action={{
            label: "Create your first project",
            onClick: () => router.push("/app/projects"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard size={22} className="text-gray-500" />
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/app/help?topic=dashboard"
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          title="Dashboard Help"
        >
          <HelpCircle size={12} />
          <span>Help</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <CountCards counts={counts} />

      {/* Risk Summary Charts (Criticality + AP Donut + Status) */}
      <RiskSummary stats={stats} />

      {/* Failure Causes Charts (DFMEA + PFMEA side by side) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FailureCausesChart
          data={dfmeaCauses}
          title="DFMEA — Top Failure Causes"
        />
        <FailureCausesChart
          data={pfmeaCauses}
          title="PFMEA — Top Failure Causes"
        />
      </div>

      {/* Pareto Charts (DFMEA + PFMEA side by side) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ParetoChart data={dfmeaCauses} title="DFMEA — Pareto Analysis" />
        <ParetoChart data={pfmeaCauses} title="PFMEA — Pareto Analysis" />
      </div>

      {/* Top Risks Table */}
      <TopRisks risks={risks} />
    </div>
  );
}
