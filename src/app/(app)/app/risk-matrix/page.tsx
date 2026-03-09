"use client";

import { useCallback, useEffect, useState } from "react";
import { analytics } from "@/lib/api";
import type { RiskMatrixData } from "@/lib/types";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import { AP_COLORS, STATUS_COLORS, FMEA_TYPE_CONFIG, getRpnColor } from "@/lib/constants";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Badge from "@/components/ui/Badge";
import { Grid3X3, X, AlertTriangle, Info } from "lucide-react";

// ── Types ────────────────────────────────────────────────────

type FmeaTypeFilter = "all" | "sfmea" | "dfmea" | "pfmea";
type ViewMode = "initial" | "revised";

interface CellEntry {
  type: string;
  step_id: string;
  failure_mode: string;
  rpn: number;
  action_priority: string;
  action_status: string;
  severity: number;
  occurrence: number;
  detection: number;
}

interface SelectedCell {
  severity: number;
  occurrence: number;
}

// ── Helpers ──────────────────────────────────────────────────

function getCellBg(severity: number, occurrence: number, count: number): string {
  if (count === 0) return "bg-gray-50";
  const product = severity * occurrence;
  if (product >= 50) return "bg-red-500";
  if (product >= 25) return "bg-orange-400";
  if (product >= 10) return "bg-yellow-300";
  return "bg-green-300";
}

function getCellText(severity: number, occurrence: number, count: number): string {
  if (count === 0) return "text-gray-300";
  const product = severity * occurrence;
  if (product >= 25) return "text-white";
  return "text-gray-800";
}

function getSourceBadgeVariant(type: string): "info" | "success" | "danger" | "purple" {
  switch (type.toLowerCase()) {
    case "dfmea":
      return "info";
    case "pfmea":
      return "success";
    case "sfmea":
      return "danger";
    default:
      return "purple";
  }
}

// ── Component ────────────────────────────────────────────────

export default function RiskMatrixPage() {
  const currentProject = useProjects((s) => s.currentProject);
  const addToast = useUI((s) => s.addToast);

  const [matrixData, setMatrixData] = useState<RiskMatrixData>({});
  const [fmeaType, setFmeaType] = useState<FmeaTypeFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("initial");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [cellEntries, setCellEntries] = useState<CellEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // ── Fetch risk matrix data ──────────────────────────────────

  const fetchMatrix = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await analytics.riskMatrix({
        project_id: currentProject?.id,
        fmea_type: fmeaType === "all" ? undefined : fmeaType,
        use_revised: viewMode === "revised",
      });
      setMatrixData(data);
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load risk matrix",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, fmeaType, viewMode, addToast]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // ── Cell click handler ──────────────────────────────────────

  const handleCellClick = async (severity: number, occurrence: number) => {
    const count = getCount(severity, occurrence);
    if (count === 0) return;

    // Toggle off if same cell
    if (selectedCell?.severity === severity && selectedCell?.occurrence === occurrence) {
      setSelectedCell(null);
      setCellEntries([]);
      return;
    }

    setSelectedCell({ severity, occurrence });
    setIsLoadingEntries(true);

    try {
      const entries = await analytics.entriesBySO({
        severity,
        occurrence,
        project_id: currentProject?.id,
        fmea_type: fmeaType === "all" ? undefined : fmeaType,
        use_revised: viewMode === "revised",
      });

      // Map to our simpler shape
      const mapped: CellEntry[] = entries.map((e) => {
        // Determine the source type from step_id prefix
        let type = "FMEA";
        if (e.step_id.startsWith("S-")) type = "SFMEA";
        else if (e.step_id.startsWith("D-")) type = "DFMEA";
        else if (e.step_id.startsWith("P-")) type = "PFMEA";

        return {
          type,
          step_id: e.step_id,
          failure_mode: e.failure_mode,
          rpn: e.rpn,
          action_priority: e.action_priority,
          action_status: e.action_status,
          severity: e.severity,
          occurrence: e.occurrence,
          detection: e.detection,
        };
      });

      setCellEntries(mapped);
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load cell entries",
      });
      setCellEntries([]);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // ── Grid helpers ────────────────────────────────────────────

  const getCount = (severity: number, occurrence: number): number => {
    return matrixData[`${severity},${occurrence}`] || 0;
  };

  const totalEntries = Object.values(matrixData).reduce((sum, c) => sum + c, 0);

  // Severity rows: 10 at top, 1 at bottom
  const severityRows = Array.from({ length: 10 }, (_, i) => 10 - i);
  const occurrenceCols = Array.from({ length: 10 }, (_, i) => i + 1);

  const fmeaTypeOptions: { value: FmeaTypeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "sfmea", label: "SFMEA" },
    { value: "dfmea", label: "DFMEA" },
    { value: "pfmea", label: "PFMEA" },
  ];

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
            <Grid3X3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Risk Matrix</h1>
            <p className="text-sm text-gray-500">Severity &times; Occurrence heatmap</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* Project indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Project:</span>
          <span className="text-gray-900">
            {currentProject ? currentProject.name : "All Projects"}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* FMEA Type toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
          {fmeaTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setFmeaType(opt.value);
                setSelectedCell(null);
                setCellEntries([]);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                fmeaType === opt.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => {
              setViewMode("initial");
              setSelectedCell(null);
              setCellEntries([]);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "initial"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Initial
          </button>
          <button
            onClick={() => {
              setViewMode("revised");
              setSelectedCell(null);
              setCellEntries([]);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "revised"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Revised
          </button>
        </div>

        {/* Total count */}
        <div className="ml-auto text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{totalEntries}</span> entries
        </div>
      </div>

      {/* Risk Matrix Grid */}
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoadingSkeleton lines={10} />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <div className="flex">
              {/* Y-axis label */}
              <div className="flex items-center justify-center pr-2">
                <span className="text-xs font-semibold text-gray-500 [writing-mode:vertical-lr] rotate-180">
                  Severity
                </span>
              </div>

              <div>
                {/* Grid */}
                <table className="border-collapse">
                  <tbody>
                    {severityRows.map((sev) => (
                      <tr key={sev}>
                        {/* Row label */}
                        <td className="w-8 pr-2 text-right text-xs font-medium text-gray-500 align-middle">
                          {sev}
                        </td>
                        {occurrenceCols.map((occ) => {
                          const count = getCount(sev, occ);
                          const isSelected =
                            selectedCell?.severity === sev && selectedCell?.occurrence === occ;
                          return (
                            <td
                              key={occ}
                              onClick={() => handleCellClick(sev, occ)}
                              className={`
                                h-10 w-10 min-w-[2.5rem] border border-gray-200 text-center text-xs font-semibold
                                transition-all duration-150
                                ${getCellBg(sev, occ, count)}
                                ${getCellText(sev, occ, count)}
                                ${count > 0 ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset" : ""}
                                ${isSelected ? "ring-2 ring-blue-600 ring-inset" : ""}
                              `}
                              title={`S=${sev}, O=${occ}, Product=${sev * occ}${count > 0 ? `, Count=${count}` : ""}`}
                            >
                              {count > 0 ? count : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* X-axis labels row */}
                    <tr>
                      <td />
                      {occurrenceCols.map((occ) => (
                        <td
                          key={occ}
                          className="pt-2 text-center text-xs font-medium text-gray-500"
                        >
                          {occ}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* X-axis label */}
                <div className="mt-1 text-center">
                  <span className="text-xs font-semibold text-gray-500">Occurrence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
            <span className="text-xs font-medium text-gray-500">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-red-500" />
              <span className="text-xs text-gray-600">Critical (&ge;50)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-orange-400" />
              <span className="text-xs text-gray-600">High (25-49)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-yellow-300" />
              <span className="text-xs text-gray-600">Medium (10-24)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-green-300" />
              <span className="text-xs text-gray-600">Low (&lt;10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-gray-50 border border-gray-200" />
              <span className="text-xs text-gray-600">No entries</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected cell detail panel */}
      {selectedCell && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Detail header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Entries at S={selectedCell.severity}, O={selectedCell.occurrence}
                </h3>
                <p className="text-xs text-gray-500">
                  Risk Product: {selectedCell.severity * selectedCell.occurrence} &mdash;{" "}
                  {cellEntries.length} {cellEntries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCell(null);
                setCellEntries([]);
              }}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Detail table */}
          <div className="overflow-x-auto">
            {isLoadingEntries ? (
              <div className="p-6">
                <LoadingSkeleton lines={4} />
              </div>
            ) : cellEntries.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-400">
                <Info className="h-4 w-4" />
                No entries found for this cell.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Step ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Failure Mode
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      S
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      O
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      RPN
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      AP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cellEntries.map((entry, idx) => {
                    const apColor = AP_COLORS[entry.action_priority];
                    const statusColor = STATUS_COLORS[entry.action_status];
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant={getSourceBadgeVariant(entry.type)} size="sm">
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {entry.step_id}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-gray-900">
                          {entry.failure_mode}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700">
                          {entry.severity}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700">
                          {entry.occurrence}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700">
                          {entry.detection}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getRpnColor(entry.rpn)}`}
                          >
                            {entry.rpn}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {apColor ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${apColor.bg} ${apColor.text}`}
                            >
                              {apColor.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {statusColor ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                            >
                              {entry.action_status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {entry.action_status || "\u2014"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
