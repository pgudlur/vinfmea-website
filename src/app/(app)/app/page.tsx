"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analytics, sync } from "@/lib/api";
import type { DashboardSummary, TopRisk, ProjectStats } from "@/lib/types";
import CountCards from "@/components/dashboard/CountCards";
import TopRisks from "@/components/dashboard/TopRisks";
import RiskSummary from "@/components/dashboard/RiskSummary";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { LayoutDashboard, FolderPlus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [risks, setRisks] = useState<TopRisk[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashboardData, topRisks, statsData] = await Promise.all([
          analytics.dashboardSummary(),
          sync.topRisks({ limit: 10 }),
          sync.stats(),
        ]);
        setSummary(dashboardData);
        setRisks(topRisks);
        setStats(statsData);
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <LoadingSkeleton lines={2} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <LoadingSkeleton lines={5} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <LoadingSkeleton lines={5} />
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
      </div>

      {/* KPI Cards */}
      <CountCards counts={counts} />

      {/* Risk Summary Charts */}
      <RiskSummary stats={stats} />

      {/* Top Risks Table */}
      <TopRisks risks={risks} />
    </div>
  );
}
