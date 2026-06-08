"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Link2, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, ArrowRight, HelpCircle } from "lucide-react";
import NextLink from "next/link";
import { sync, sfmea, dfmea, pfmea, controlPlans } from "@/lib/api";
import { useProjects } from "@/stores/useProjects";
import type { SyncSummary, SfmeaEntry, DfmeaEntry, PfmeaEntry, ControlPlanEntry, FmeaLink } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

type PairStatus = "linked" | "out_of_sync" | "unlinked";

interface LinkPair {
  source: { type: string; step_id: string; failure_mode: string; rpn: number; action_priority: string };
  target: { type: string; step_id: string; failure_mode: string; rpn: number; action_priority: string } | null;
  status: PairStatus;
}

export default function SyncStatusPage() {
  const { currentProject } = useProjects();
  const [summary, setSummary] = useState<SyncSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Expandable sections
  const [sfmeaDfmeaOpen, setSfmeaDfmeaOpen] = useState(false);
  const [dfmeaPfmeaOpen, setDfmeaPfmeaOpen] = useState(false);
  const [pfmeaCpOpen, setPfmeaCpOpen] = useState(false);

  // Linked entry data
  const [sfmeaEntries, setSfmeaEntries] = useState<SfmeaEntry[]>([]);
  const [dfmeaEntries, setDfmeaEntries] = useState<DfmeaEntry[]>([]);
  const [pfmeaEntries, setPfmeaEntries] = useState<PfmeaEntry[]>([]);
  const [cpEntries, setCpEntries] = useState<ControlPlanEntry[]>([]);
  const [links, setLinks] = useState<FmeaLink[]>([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);

  // Load summary and all entries on mount for accurate counts
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const params = currentProject ? { project_id: currentProject.id } : {};
        const [summaryData, sf, df, pf, cp, lk] = await Promise.all([
          sync.summary(currentProject?.id),
          sfmea.list(params),
          dfmea.list(params),
          pfmea.list(params),
          controlPlans.list(params),
          sync.links(currentProject?.id).catch(() => [] as FmeaLink[]),
        ]);
        setSummary(summaryData);
        setSfmeaEntries(sf);
        setDfmeaEntries(df);
        setPfmeaEntries(pf);
        setCpEntries(cp);
        setLinks(lk);
        setEntriesLoaded(true);
      } catch {
        // silently fail — try at least summary
        try {
          const data = await sync.summary(currentProject?.id);
          setSummary(data);
        } catch {
          // both failed
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    setLoading(true);
    setEntriesLoaded(false);
    try {
      const data = await sync.summary(currentProject?.id);
      setSummary(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Match entries by step_id suffix (e.g., S-001 → D-001)
  function getStepSuffix(stepId: string): string {
    const match = stepId.match(/(\d+)$/);
    return match ? match[1] : stepId;
  }

  // Status for a matched pair: read the actual link's sync_status so an
  // out_of_sync chain is no longer mislabeled "Linked". Falls back to "linked"
  // when a suffix match exists but no explicit link row was found.
  function pairStatus(
    sourceId: number | undefined,
    targetId: number | undefined,
    sourceKey: keyof FmeaLink,
    targetKey: keyof FmeaLink
  ): PairStatus {
    if (!targetId) return "unlinked";
    const link = links.find((l) => l[sourceKey] === sourceId && l[targetKey] === targetId);
    if (link && link.sync_status === "out_of_sync") return "out_of_sync";
    return "linked";
  }

  // Compute real client-side link counts when entries are loaded
  const clientCounts = entriesLoaded ? (() => {
    // SFMEA→DFMEA: count SFMEA without matching DFMEA + DFMEA without matching SFMEA
    const sfmeaSuffixes = new Set(sfmeaEntries.map((e) => getStepSuffix(e.step_id)));
    const dfmeaSuffixes = new Set(dfmeaEntries.map((e) => getStepSuffix(e.step_id)));
    const pfmeaSuffixes = new Set(pfmeaEntries.map((e) => getStepSuffix(e.step_id)));
    const cpSuffixes = new Set(cpEntries.map((e) => getStepSuffix(e.step_id)));

    const sfmeaWithoutDfmea = sfmeaEntries.filter((sf) => !dfmeaSuffixes.has(getStepSuffix(sf.step_id))).length;
    const dfmeaWithoutSfmea = dfmeaEntries.filter((df) => !sfmeaSuffixes.has(getStepSuffix(df.step_id))).length;
    const dfmeaWithoutPfmea = dfmeaEntries.filter((df) => !pfmeaSuffixes.has(getStepSuffix(df.step_id))).length;
    const pfmeaWithoutDfmea = pfmeaEntries.filter((pf) => !dfmeaSuffixes.has(getStepSuffix(pf.step_id))).length;
    const pfmeaWithoutCp = pfmeaEntries.filter((pf) => !cpSuffixes.has(getStepSuffix(pf.step_id))).length;
    const cpWithoutPfmea = cpEntries.filter((cp) => !pfmeaSuffixes.has(getStepSuffix(cp.step_id))).length;

    const sfmeaDfmeaUnlinked = sfmeaWithoutDfmea + dfmeaWithoutSfmea;
    const dfmeaPfmeaUnlinked = dfmeaWithoutPfmea + pfmeaWithoutDfmea;
    const pfmeaCpUnlinked = pfmeaWithoutCp + cpWithoutPfmea;

    const sfmeaDfmeaLinked = Math.min(sfmeaEntries.length - sfmeaWithoutDfmea, dfmeaEntries.length - dfmeaWithoutSfmea);
    const dfmeaPfmeaLinked = Math.min(dfmeaEntries.length - dfmeaWithoutPfmea, pfmeaEntries.length - pfmeaWithoutDfmea);
    const pfmeaCpLinked = Math.min(pfmeaEntries.length - pfmeaWithoutCp, cpEntries.length - cpWithoutPfmea);

    const totalLinked = sfmeaDfmeaLinked + dfmeaPfmeaLinked + pfmeaCpLinked;
    const totalUnlinked = sfmeaDfmeaUnlinked + dfmeaPfmeaUnlinked + pfmeaCpUnlinked;
    const totalAll = totalLinked + totalUnlinked;

    return {
      totalLinks: totalAll,
      synced: totalLinked,
      unlinked: totalUnlinked,
      sfmeaDfmeaUnlinked,
      dfmeaPfmeaUnlinked,
      pfmeaCpUnlinked,
    };
  })() : null;

  // Use client counts when available, otherwise server summary
  const displayTotalLinks = clientCounts ? clientCounts.totalLinks : (summary?.total_links ?? 0);
  const displaySynced = clientCounts ? clientCounts.synced : (summary?.synced ?? 0);
  const displayUnlinked = clientCounts ? clientCounts.unlinked : ((summary?.dfmea_unlinked ?? 0) + (summary?.pfmea_unlinked ?? 0) + (summary?.sfmea_unlinked ?? 0));
  const displaySfmeaDfmeaUnlinked = clientCounts ? clientCounts.sfmeaDfmeaUnlinked : (summary?.sfmea_unlinked ?? 0);
  const displayDfmeaPfmeaUnlinked = clientCounts ? clientCounts.dfmeaPfmeaUnlinked : (summary?.dfmea_unlinked ?? 0);
  const displayPfmeaCpUnlinked = clientCounts ? clientCounts.pfmeaCpUnlinked : (summary?.pfmea_unlinked ?? 0);

  const syncPercent = displayTotalLinks > 0
    ? Math.round((displaySynced / displayTotalLinks) * 100)
    : (summary && summary.total_links > 0 ? Math.round((summary.synced / summary.total_links) * 100) : 0);

  function buildSfmeaDfmeaPairs(): LinkPair[] {
    const pairs: LinkPair[] = [];
    for (const sf of sfmeaEntries) {
      const suffix = getStepSuffix(sf.step_id);
      const matched = dfmeaEntries.find((d) => getStepSuffix(d.step_id) === suffix);
      pairs.push({
        source: {
          type: "SFMEA",
          step_id: sf.step_id,
          failure_mode: sf.failure_mode || "—",
          rpn: sf.rpn,
          action_priority: sf.action_priority,
        },
        target: matched
          ? {
              type: "DFMEA",
              step_id: matched.step_id,
              failure_mode: matched.failure_mode || "—",
              rpn: matched.rpn,
              action_priority: matched.action_priority,
            }
          : null,
        status: pairStatus(sf.id, matched?.id, "sfmea_id", "dfmea_id"),
      });
    }
    // Also add DFMEA entries with no matching SFMEA
    for (const df of dfmeaEntries) {
      const suffix = getStepSuffix(df.step_id);
      const hasMatch = sfmeaEntries.some((sf) => getStepSuffix(sf.step_id) === suffix);
      if (!hasMatch) {
        pairs.push({
          source: {
            type: "DFMEA",
            step_id: df.step_id,
            failure_mode: df.failure_mode || "—",
            rpn: df.rpn,
            action_priority: df.action_priority,
          },
          target: null,
          status: "unlinked",
        });
      }
    }
    return pairs;
  }

  function buildDfmeaPfmeaPairs(): LinkPair[] {
    const pairs: LinkPair[] = [];
    for (const df of dfmeaEntries) {
      const suffix = getStepSuffix(df.step_id);
      const matched = pfmeaEntries.find((p) => getStepSuffix(p.step_id) === suffix);
      pairs.push({
        source: {
          type: "DFMEA",
          step_id: df.step_id,
          failure_mode: df.failure_mode || "—",
          rpn: df.rpn,
          action_priority: df.action_priority,
        },
        target: matched
          ? {
              type: "PFMEA",
              step_id: matched.step_id,
              failure_mode: matched.failure_mode || "—",
              rpn: matched.rpn,
              action_priority: matched.action_priority,
            }
          : null,
        status: pairStatus(df.id, matched?.id, "dfmea_id", "pfmea_id"),
      });
    }
    return pairs;
  }

  function buildPfmeaCpPairs(): LinkPair[] {
    const pairs: LinkPair[] = [];
    for (const pf of pfmeaEntries) {
      const suffix = getStepSuffix(pf.step_id);
      const matched = cpEntries.find((c) => getStepSuffix(c.step_id) === suffix);
      pairs.push({
        source: {
          type: "PFMEA",
          step_id: pf.step_id,
          failure_mode: pf.failure_mode || "—",
          rpn: pf.rpn,
          action_priority: pf.action_priority,
        },
        target: matched
          ? {
              type: "CP",
              step_id: matched.step_id,
              failure_mode: matched.process_step || "—",
              rpn: 0,
              action_priority: "",
            }
          : null,
        status: pairStatus(pf.id, matched?.id, "pfmea_id", "control_plan_id"),
      });
    }
    return pairs;
  }

  const typeColors: Record<string, string> = {
    SFMEA: "bg-red-500",
    DFMEA: "bg-blue-500",
    PFMEA: "bg-green-500",
    CP: "bg-purple-500",
  };

  const apColors: Record<string, string> = {
    H: "bg-red-100 text-red-700",
    M: "bg-orange-100 text-orange-700",
    L: "bg-green-100 text-green-700",
  };

  function renderPairTable(pairs: LinkPair[]) {
    if (!entriesLoaded) {
      return (
        <div className="px-5 py-4 text-center text-sm text-gray-400">
          <RefreshCw size={14} className="inline-block animate-spin mr-2" />
          Loading entries...
        </div>
      );
    }

    if (pairs.length === 0) {
      return (
        <div className="px-5 py-6 text-center text-sm text-gray-400">
          No entries found for this link type.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Step ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Failure Mode</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">RPN</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">AP</th>
              <th className="px-2 py-2"></th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Target</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Step ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Failure Mode</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-2">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${typeColors[pair.source.type]}`}>
                    {pair.source.type}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-gray-700">{pair.source.step_id}</td>
                <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate">{pair.source.failure_mode}</td>
                <td className="px-4 py-2 text-center">
                  {pair.source.rpn > 0 && (
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      pair.source.rpn >= 200 ? "bg-red-100 text-red-700" : pair.source.rpn >= 100 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {pair.source.rpn}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {pair.source.action_priority && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${apColors[pair.source.action_priority] || "bg-gray-100 text-gray-600"}`}>
                      {pair.source.action_priority}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  <ArrowRight size={14} className={pair.target ? "text-green-400" : "text-gray-300"} />
                </td>
                <td className="px-4 py-2">
                  {pair.target ? (
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${typeColors[pair.target.type]}`}>
                      {pair.target.type}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-gray-700">
                  {pair.target?.step_id || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate">
                  {pair.target?.failure_mode || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-2 text-center">
                  {pair.status === "linked" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      <CheckCircle2 size={10} />
                      Linked
                    </span>
                  ) : pair.status === "out_of_sync" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      <AlertTriangle size={10} />
                      Out of sync
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      <XCircle size={10} />
                      Unlinked
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Sync Status</h1>
          <NextLink
            href="/app/help?topic=traceability"
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            title="Traceability Help"
          >
            <HelpCircle size={12} />
            <span>Help</span>
          </NextLink>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">Total Entries</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{displayTotalLinks}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs text-green-600">Linked</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{displaySynced}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-600">Unlinked</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{displayUnlinked}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-red-600">SFMEA↔DFMEA</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{displaySfmeaDfmeaUnlinked}</p>
              <p className="text-[10px] text-red-400 mt-0.5">unlinked</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs text-blue-600">DFMEA↔PFMEA</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{displayDfmeaPfmeaUnlinked}</p>
              <p className="text-[10px] text-blue-400 mt-0.5">unlinked</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">PFMEA↔CP</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{displayPfmeaCpUnlinked}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">unlinked</p>
            </div>
          </div>

          {!entriesLoaded && (
            <p className="text-xs text-gray-400 -mt-4">
              Expand a link section below for accurate client-side counts.
            </p>
          )}

          {/* Sync progress bar */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Traceability Sync Health</h3>
              <span className="text-2xl font-bold text-gray-900">{syncPercent}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${syncPercent}%`,
                  backgroundColor: syncPercent >= 80 ? "#22C55E" : syncPercent >= 50 ? "#F59E0B" : "#EF4444",
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Linked: {displaySynced}</span>
              <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-amber-500" /> Out of sync: {summary.out_of_sync}</span>
              <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Unlinked: {displayUnlinked}</span>
            </div>
          </div>

          {/* Status detail — clickable sections */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-800">Traceability Chain Status</h3>
              <p className="text-xs text-gray-400 mt-0.5">Click on a link type to view connected entries</p>
            </div>

            {/* SFMEA → DFMEA */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setSfmeaDfmeaOpen(!sfmeaDfmeaOpen)}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                {sfmeaDfmeaOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <Link2 size={16} className="text-red-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700">SFMEA → DFMEA Links</p>
                  <p className="text-xs text-gray-500">System-level to Design-level traceability</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                  displaySfmeaDfmeaUnlinked === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {displaySfmeaDfmeaUnlinked === 0 ? "All Linked" : `${displaySfmeaDfmeaUnlinked} Unlinked`}
                </span>
              </button>
              {sfmeaDfmeaOpen && renderPairTable(buildSfmeaDfmeaPairs())}
            </div>

            {/* DFMEA → PFMEA */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setDfmeaPfmeaOpen(!dfmeaPfmeaOpen)}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                {dfmeaPfmeaOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <Link2 size={16} className="text-blue-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700">DFMEA → PFMEA Links</p>
                  <p className="text-xs text-gray-500">Automatic link from DFMEA step IDs to PFMEA</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                  displayDfmeaPfmeaUnlinked === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {displayDfmeaPfmeaUnlinked === 0 ? "All Linked" : `${displayDfmeaPfmeaUnlinked} Unlinked`}
                </span>
              </button>
              {dfmeaPfmeaOpen && renderPairTable(buildDfmeaPfmeaPairs())}
            </div>

            {/* PFMEA → Control Plan */}
            <div>
              <button
                onClick={() => setPfmeaCpOpen(!pfmeaCpOpen)}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                {pfmeaCpOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <Link2 size={16} className="text-green-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700">PFMEA → Control Plan Links</p>
                  <p className="text-xs text-gray-500">Auto-sync on PFMEA create/update</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                  displayPfmeaCpUnlinked === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {displayPfmeaCpUnlinked === 0 ? "All Linked" : `${displayPfmeaCpUnlinked} Unlinked`}
                </span>
              </button>
              {pfmeaCpOpen && renderPairTable(buildPfmeaCpPairs())}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <RefreshCw size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Unable to fetch sync status</p>
        </div>
      )}
    </div>
  );
}
