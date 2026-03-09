"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dfmea, pfmea, sfmea } from "@/lib/api";
import type { DfmeaEntry, PfmeaEntry, SfmeaEntry } from "@/lib/types";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import { AP_COLORS, STATUS_COLORS, FMEA_TYPE_CONFIG } from "@/lib/constants";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Badge from "@/components/ui/Badge";
import {
  ClipboardCheck,
  ListChecks,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  ArrowUpDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

type SourceType = "SFMEA" | "DFMEA" | "PFMEA";
type StatusFilter = "all" | "Open" | "In Progress" | "Completed" | "Overdue";
type TypeFilter = "all" | SourceType;
type PriorityFilter = "all" | "H" | "M" | "L";
type SortField = "status" | "target_date" | "rpn" | "step_id";
type SortDirection = "asc" | "desc";

interface ActionItem {
  id: number;
  source: SourceType;
  step_id: string;
  failure_mode: string;
  recommended_action: string;
  responsibility: string;
  target_date: string;
  action_status: string;
  action_priority: string;
  rpn: number;
  severity: number;
  occurrence: number;
  detection: number;
  isOverdue: boolean;
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function isOverdue(targetDate: string, actionStatus: string): boolean {
  if (!targetDate) return false;
  if (actionStatus === "Completed" || actionStatus === "Cancelled") return false;
  try {
    const target = new Date(targetDate);
    if (isNaN(target.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return target < today;
  } catch {
    return false;
  }
}

function getSourceBadgeVariant(source: SourceType): "info" | "success" | "danger" {
  switch (source) {
    case "DFMEA":
      return "info";
    case "PFMEA":
      return "success";
    case "SFMEA":
      return "danger";
  }
}

function getSourceColor(source: SourceType): { bg: string; text: string } {
  switch (source) {
    case "SFMEA":
      return { bg: FMEA_TYPE_CONFIG.sfmea.bgLight, text: FMEA_TYPE_CONFIG.sfmea.textColor };
    case "DFMEA":
      return { bg: FMEA_TYPE_CONFIG.dfmea.bgLight, text: FMEA_TYPE_CONFIG.dfmea.textColor };
    case "PFMEA":
      return { bg: FMEA_TYPE_CONFIG.pfmea.bgLight, text: FMEA_TYPE_CONFIG.pfmea.textColor };
  }
}

// Status sort order for default sorting
const STATUS_ORDER: Record<string, number> = {
  Open: 0,
  "In Progress": 1,
  Deferred: 2,
  Completed: 3,
  Cancelled: 4,
};

// ── Component ────────────────────────────────────────────────

export default function ActionsPage() {
  const currentProject = useProjects((s) => s.currentProject);
  const addToast = useUI((s) => s.addToast);

  const [allActions, setAllActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Fetch all FMEA entries ──────────────────────────────────

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = currentProject ? { project_id: currentProject.id } : undefined;
      const [dfmeaData, pfmeaData, sfmeaData] = await Promise.all([
        dfmea.list(params),
        pfmea.list(params),
        sfmea.list(params),
      ]);

      const mapEntry = <T extends DfmeaEntry | PfmeaEntry | SfmeaEntry>(
        entry: T,
        source: SourceType
      ): ActionItem => ({
        id: entry.id,
        source,
        step_id: entry.step_id,
        failure_mode: entry.failure_mode,
        recommended_action: entry.recommended_action,
        responsibility: entry.responsibility,
        target_date: entry.target_date,
        action_status: entry.action_status,
        action_priority: entry.action_priority,
        rpn: entry.rpn,
        severity: entry.severity,
        occurrence: entry.occurrence,
        detection: entry.detection,
        isOverdue: isOverdue(entry.target_date, entry.action_status),
      });

      const combined: ActionItem[] = [
        ...dfmeaData
          .filter((e) => e.recommended_action && e.recommended_action.trim() !== "")
          .map((e) => mapEntry(e, "DFMEA")),
        ...pfmeaData
          .filter((e) => e.recommended_action && e.recommended_action.trim() !== "")
          .map((e) => mapEntry(e, "PFMEA")),
        ...sfmeaData
          .filter((e) => e.recommended_action && e.recommended_action.trim() !== "")
          .map((e) => mapEntry(e, "SFMEA")),
      ];

      setAllActions(combined);
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load actions",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, addToast]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // ── Filtering ───────────────────────────────────────────────

  const filteredActions = useMemo(() => {
    let items = [...allActions];

    // Type filter
    if (typeFilter !== "all") {
      items = items.filter((a) => a.source === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      items = items.filter((a) => a.action_priority === priorityFilter);
    }

    // Status filter
    if (statusFilter === "Overdue") {
      items = items.filter((a) => a.isOverdue);
    } else if (statusFilter !== "all") {
      items = items.filter((a) => a.action_status === statusFilter);
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "status": {
          const aOrder = STATUS_ORDER[a.action_status] ?? 99;
          const bOrder = STATUS_ORDER[b.action_status] ?? 99;
          cmp = aOrder - bOrder;
          // Secondary sort: target date (soonest first)
          if (cmp === 0) {
            const aDate = a.target_date ? new Date(a.target_date).getTime() : Infinity;
            const bDate = b.target_date ? new Date(b.target_date).getTime() : Infinity;
            cmp = aDate - bDate;
          }
          break;
        }
        case "target_date": {
          const aDate = a.target_date ? new Date(a.target_date).getTime() : Infinity;
          const bDate = b.target_date ? new Date(b.target_date).getTime() : Infinity;
          cmp = aDate - bDate;
          break;
        }
        case "rpn":
          cmp = b.rpn - a.rpn;
          break;
        case "step_id":
          cmp = a.step_id.localeCompare(b.step_id);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return items;
  }, [allActions, statusFilter, typeFilter, priorityFilter, sortField, sortDir]);

  // ── Summary counts ──────────────────────────────────────────

  const summaryStats = useMemo(() => {
    const total = allActions.length;
    const open = allActions.filter((a) => a.action_status === "Open").length;
    const inProgress = allActions.filter((a) => a.action_status === "In Progress").length;
    const completed = allActions.filter((a) => a.action_status === "Completed").length;
    const overdue = allActions.filter((a) => a.isOverdue).length;
    return { total, open, inProgress, completed, overdue };
  }, [allActions]);

  // ── Column sort handler ─────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Filter option arrays ────────────────────────────────────

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Overdue", label: "Overdue" },
  ];

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "DFMEA", label: "DFMEA" },
    { value: "PFMEA", label: "PFMEA" },
    { value: "SFMEA", label: "SFMEA" },
  ];

  const priorityOptions: { value: PriorityFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "H", label: "High" },
    { value: "M", label: "Medium" },
    { value: "L", label: "Low" },
  ];

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
          <ClipboardCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Tracker</h1>
          <p className="text-sm text-gray-500">
            Track recommended actions across all FMEA types
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium text-blue-600">Open</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {summaryStats.open + summaryStats.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium text-green-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{summaryStats.completed}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium text-red-600">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{summaryStats.overdue}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Status:</span>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? opt.value === "Overdue"
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Type:</span>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Priority:</span>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriorityFilter(opt.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  priorityFilter === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="ml-auto text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredActions.length}</span> of{" "}
          {allActions.length}
        </div>
      </div>

      {/* Actions table */}
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoadingSkeleton lines={8} />
        </div>
      ) : allActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <Inbox className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No Actions Found</h3>
          <p className="text-sm text-gray-400">
            There are no recommended actions in any FMEA entries yet.
          </p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <Inbox className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No Matching Actions</h3>
          <p className="text-sm text-gray-400">
            Try adjusting the filters to see more results.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("step_id")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Step ID
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Failure Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 min-w-[200px]">
                    Recommended Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Responsibility
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("target_date")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Target Date
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("status")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    AP
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("rpn")}
                  >
                    <span className="inline-flex items-center gap-1">
                      RPN
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActions.map((action) => {
                  const apColor = AP_COLORS[action.action_priority];
                  const statusColor = STATUS_COLORS[action.action_status];
                  const sourceColor = getSourceColor(action.source);

                  return (
                    <tr
                      key={`${action.source}-${action.id}`}
                      className={`transition-colors hover:bg-gray-50 ${
                        action.isOverdue ? "bg-red-50/50" : ""
                      }`}
                    >
                      {/* Source Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${sourceColor.bg} ${sourceColor.text}`}
                        >
                          {action.source}
                        </span>
                      </td>

                      {/* Step ID */}
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {action.step_id}
                      </td>

                      {/* Failure Mode */}
                      <td className="px-4 py-3 max-w-[180px] truncate text-gray-900">
                        {action.failure_mode}
                      </td>

                      {/* Recommended Action */}
                      <td className="px-4 py-3 max-w-[250px] text-gray-700">
                        <span className="line-clamp-2">{action.recommended_action}</span>
                      </td>

                      {/* Responsibility */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {action.responsibility || "\u2014"}
                      </td>

                      {/* Target Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={action.isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                            {formatDate(action.target_date)}
                          </span>
                          {action.isOverdue && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {statusColor ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                          >
                            {action.action_status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {action.action_status || "\u2014"}
                          </span>
                        )}
                      </td>

                      {/* Action Priority */}
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

                      {/* RPN */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-800">{action.rpn}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
