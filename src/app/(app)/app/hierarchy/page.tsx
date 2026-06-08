"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useProjects } from "@/stores/useProjects";
import { sfmea, dfmea, pfmea, controlPlans } from "@/lib/api";
import { CRITICALITY_ROW_COLORS } from "@/lib/constants";
import type {
  SfmeaEntry,
  DfmeaEntry,
  PfmeaEntry,
  ControlPlanEntry,
} from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  ChevronRight,
  ChevronDown,
  Filter,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

// ── Unified row type ──────────────────────────────────────────
type RowKind = "project" | "assembly" | "part" | "sfmea" | "dfmea" | "pfmea" | "control-plan";

interface TreeRow {
  key: string;
  kind: RowKind;
  depth: number;
  label: string;
  type: string;
  details: string;
  severity?: number;
  occurrence?: number;
  detection?: number;
  rpn?: number;
  actionPriority?: string;
  status?: string;
  criticality?: string;
  newSeverity?: number;
  newOccurrence?: number;
  newDetection?: number;
  newRpn?: number;
  newActionPriority?: string;
  specialCharClass?: string;
  hasChildren: boolean;
}

type AnyFmeaEntry = (SfmeaEntry | DfmeaEntry | PfmeaEntry | ControlPlanEntry) & {
  _fmea_type: string;
};

const AP_BADGE: Record<string, string> = {
  H: "bg-red-100 text-red-700",
  M: "bg-amber-100 text-amber-700",
  L: "bg-green-100 text-green-700",
};

const STATUS_BADGE: Record<string, string> = {
  Open: "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Deferred: "bg-yellow-100 text-yellow-700",
};

const SPECIAL_CHAR_COLORS: Record<string, string> = {
  CC: "#FADBD8",
  SC: "#D5F5E3",
  HI: "#FEF9E7",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "sfmea", label: "SFMEA Only" },
  { value: "dfmea", label: "DFMEA Only" },
  { value: "pfmea", label: "PFMEA Only" },
  { value: "control-plan", label: "Control Plan Only" },
  { value: "high-priority", label: "High Priority (AP=H)" },
  { value: "critical", label: "Critical Only" },
];

function getEntryDetails(entry: AnyFmeaEntry): string {
  switch (entry._fmea_type) {
    case "sfmea":
      return (entry as SfmeaEntry).system_function || (entry as SfmeaEntry).system_element || "";
    case "dfmea":
      return (entry as DfmeaEntry).part_name || (entry as DfmeaEntry).function || "";
    case "pfmea":
      return (entry as PfmeaEntry).process_function || (entry as PfmeaEntry).process_step || "";
    case "control-plan":
      return (entry as ControlPlanEntry).product_characteristic || (entry as ControlPlanEntry).process_step || "";
    default:
      return "";
  }
}

function getEntryLabel(entry: AnyFmeaEntry): string {
  const stepId = entry.step_id;
  if ("failure_mode" in entry && (entry as { failure_mode: string }).failure_mode) {
    return `${stepId}: ${(entry as { failure_mode: string }).failure_mode}`;
  }
  if ("product_characteristic" in entry) {
    return `${stepId}: ${(entry as ControlPlanEntry).product_characteristic || (entry as ControlPlanEntry).process_step || ""}`;
  }
  return stepId;
}

function getTypeLabel(kind: RowKind): string {
  switch (kind) {
    case "project": return "Project";
    case "assembly": return "Assem...";
    case "part": return "Part";
    case "sfmea": return "SFMEA";
    case "dfmea": return "DFMEA";
    case "pfmea": return "PFMEA";
    case "control-plan": return "Control...";
    default: return "";
  }
}

function getTypeBadgeClasses(kind: RowKind): string {
  switch (kind) {
    case "project": return "bg-slate-100 text-slate-700";
    case "assembly": return "bg-sky-50 text-sky-700";
    case "part": return "bg-teal-50 text-teal-700";
    case "sfmea": return "bg-red-50 text-red-700";
    case "dfmea": return "bg-blue-50 text-blue-700";
    case "pfmea": return "bg-green-50 text-green-700";
    case "control-plan": return "bg-purple-50 text-purple-700";
    default: return "bg-gray-50 text-gray-600";
  }
}

// ── Default column widths ─────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  hierarchy: 340,
  type: 72,
  details: 180,
  s: 36,
  o: 36,
  d: 36,
  rpn: 48,
  ap: 36,
  status: 82,
  revS: 36,
  revO: 36,
  revD: 36,
  revRpn: 48,
  revAp: 36,
};

const COL_KEYS = Object.keys(DEFAULT_COL_WIDTHS);
const COL_LABELS: Record<string, string> = {
  hierarchy: "Hierarchy",
  type: "Type",
  details: "Details",
  s: "S",
  o: "O",
  d: "D",
  rpn: "RPN",
  ap: "AP",
  status: "Status",
  revS: "Rev S",
  revO: "Rev O",
  revD: "Rev D",
  revRpn: "Rev RP",
  revAp: "Rev AP",
};

export default function HierarchyPage() {
  const {
    projects,
    currentProject,
    assemblies,
    parts,
    isLoading,
    selectProject,
  } = useProjects();

  const [fmeaEntries, setFmeaEntries] = useState<AnyFmeaEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(100);
  const [colWidths, setColWidths] = useState<Record<string, number>>({ ...DEFAULT_COL_WIDTHS });
  const resizingCol = useRef<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // Select first project if none selected
  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      selectProject(projects[0].id);
    }
  }, [currentProject, projects, selectProject]);

  // Fetch all FMEA entries
  const fetchEntries = useCallback(async () => {
    const projectId = currentProject?.id;
    if (!projectId) return;
    setLoadingEntries(true);
    try {
      const [sEntries, dEntries, pEntries, cpEntries] = await Promise.all([
        sfmea.list({ project_id: projectId }).catch(() => []),
        dfmea.list({ project_id: projectId }).catch(() => []),
        pfmea.list({ project_id: projectId }).catch(() => []),
        controlPlans.list({ project_id: projectId }).catch(() => []),
      ]);
      const all: AnyFmeaEntry[] = [
        ...sEntries.map((e) => ({ ...e, _fmea_type: "sfmea" })),
        ...dEntries.map((e) => ({ ...e, _fmea_type: "dfmea" })),
        ...pEntries.map((e) => ({ ...e, _fmea_type: "pfmea" })),
        ...cpEntries.map((e) => ({ ...e, _fmea_type: "control-plan" })),
      ] as AnyFmeaEntry[];
      setFmeaEntries(all);
    } catch {
      // silently fail
    } finally {
      setLoadingEntries(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Auto-expand all on first load
  useEffect(() => {
    if (assemblies.length > 0 && expanded.size === 0) {
      const all = new Set<string>();
      all.add("project");
      assemblies.forEach((a) => all.add(`asm-${a.id}`));
      parts.forEach((p) => all.add(`part-${p.id}`));
      setExpanded(all);
    }
  }, [assemblies, parts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build flat row list from hierarchy ────────────────────
  const rows = useMemo(() => {
    const result: TreeRow[] = [];
    if (!currentProject) return result;

    const filterEntry = (entry: AnyFmeaEntry): boolean => {
      if (filter === "all") return true;
      if (filter === "high-priority") {
        return "action_priority" in entry && (entry as { action_priority: string }).action_priority === "H";
      }
      if (filter === "critical") {
        return "criticality" in entry && (entry as { criticality: string }).criticality === "Critical";
      }
      return entry._fmea_type === filter;
    };

    // Project row
    const projectKey = "project";
    result.push({
      key: projectKey,
      kind: "project",
      depth: 0,
      label: `[Project] ${currentProject.name}`,
      type: "Project",
      details: currentProject.description || `Automotive ${currentProject.name}...`,
      status: "Active",
      hasChildren: assemblies.length > 0,
    });

    if (!expanded.has(projectKey)) return result;

    for (const assembly of assemblies) {
      const asmKey = `asm-${assembly.id}`;
      const asmParts = parts.filter((p) => p.assembly_id === assembly.id);

      result.push({
        key: asmKey,
        kind: "assembly",
        depth: 1,
        label: `[Assembly] ${assembly.name}`,
        type: "Assem...",
        details: assembly.assembly_number || "",
        hasChildren: asmParts.length > 0,
      });

      if (!expanded.has(asmKey)) continue;

      for (const part of asmParts) {
        const partKey = `part-${part.id}`;
        const partEntries = fmeaEntries
          .filter((e) => {
            if ("part_id" in e) return (e as { part_id: number | null }).part_id === part.id;
            return false;
          })
          .filter(filterEntry);

        result.push({
          key: partKey,
          kind: "part",
          depth: 2,
          label: `[Part] ${part.name}`,
          type: "Part",
          details: part.part_number || "",
          hasChildren: partEntries.length > 0,
        });

        if (!expanded.has(partKey)) continue;

        for (const entry of partEntries) {
          const entryKey = `${entry._fmea_type}-${entry.id}`;
          const isCP = entry._fmea_type === "control-plan";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = entry as any;
          const cpEntry = isCP ? (entry as unknown as ControlPlanEntry) : null;

          result.push({
            key: entryKey,
            kind: entry._fmea_type as RowKind,
            depth: 3,
            label: getEntryLabel(entry),
            type: getTypeLabel(entry._fmea_type as RowKind),
            details: getEntryDetails(entry),
            severity: e.severity,
            occurrence: e.occurrence,
            detection: e.detection,
            rpn: e.rpn,
            actionPriority: e.action_priority,
            status: e.action_status,
            criticality: e.criticality,
            newSeverity: e.new_severity,
            newOccurrence: e.new_occurrence,
            newDetection: e.new_detection,
            newRpn: e.new_rpn,
            newActionPriority: e.new_action_priority,
            specialCharClass: cpEntry?.special_char_class || undefined,
            hasChildren: false,
          });
        }
      }
    }
    return result;
  }, [currentProject, assemblies, parts, fmeaEntries, expanded, filter]);

  // ── Expand / Collapse ──────────────────────────────────────
  const expandAll = useCallback(() => {
    const all = new Set<string>();
    all.add("project");
    assemblies.forEach((a) => all.add(`asm-${a.id}`));
    parts.forEach((p) => all.add(`part-${p.id}`));
    setExpanded(all);
  }, [assemblies, parts]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  const toggleExpand = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Column resize handlers ──────────────────────────────────
  const handleResizeMouseDown = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    resizingCol.current = colKey;
    resizeStartX.current = e.clientX;
    resizeStartW.current = colWidths[colKey];

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingCol.current) return;
      const delta = ev.clientX - resizeStartX.current;
      const newWidth = Math.max(30, resizeStartW.current + delta);
      setColWidths((prev) => ({ ...prev, [resizingCol.current!]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingCol.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [colWidths]);

  const totalTableWidth = useMemo(() => {
    return COL_KEYS.reduce((sum, key) => sum + colWidths[key], 0);
  }, [colWidths]);

  // ── Row background color ───────────────────────────────────
  function getRowBg(row: TreeRow): string | undefined {
    if (row.specialCharClass && SPECIAL_CHAR_COLORS[row.specialCharClass]) {
      return SPECIAL_CHAR_COLORS[row.specialCharClass];
    }
    if (row.criticality && CRITICALITY_ROW_COLORS[row.criticality]) {
      return CRITICALITY_ROW_COLORS[row.criticality];
    }
    return undefined;
  }

  // ── Summary counts ─────────────────────────────────────────
  const counts = useMemo(() => {
    const s = fmeaEntries.filter((e) => e._fmea_type === "sfmea").length;
    const d = fmeaEntries.filter((e) => e._fmea_type === "dfmea").length;
    const p = fmeaEntries.filter((e) => e._fmea_type === "pfmea").length;
    const cp = fmeaEntries.filter((e) => e._fmea_type === "control-plan").length;
    return { assemblies: assemblies.length, parts: parts.length, sfmea: s, dfmea: d, pfmea: p, cp };
  }, [assemblies.length, parts.length, fmeaEntries]);

  if (isLoading && !currentProject) {
    return (
      <div className="p-6">
        <LoadingSkeleton lines={12} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col -m-6">
      {/* Header toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Hierarchical View</h1>
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-600">
              {counts.assemblies} Assemblies
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-600">
              {counts.parts} Parts
            </span>
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] text-red-700">
              {counts.sfmea} SFMEA
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
              {counts.dfmea} DFMEA
            </span>
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
              {counts.pfmea} PFMEA
            </span>
            <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] text-purple-700">
              {counts.cp} Control Plans
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-7 rounded border border-gray-300 bg-white px-2 pr-6 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={expandAll} className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Expand All
          </button>
          <button onClick={collapseAll} className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Collapse All
          </button>
          <button onClick={fetchEntries} disabled={loadingEntries} className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Refresh
          </button>
          <Link
            href="/app/help?topic=bom"
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            title="Hierarchy Help"
          >
            <HelpCircle size={12} />
          </Link>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <button
          onClick={() => setZoom((z) => Math.max(50, z - 10))}
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-medium text-gray-500 w-8 text-center">{zoom}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(150, z + 10))}
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        {zoom !== 100 && (
          <button
            onClick={() => setZoom(100)}
            className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw size={12} />
          </button>
        )}
        <span className="ml-2 text-[10px] text-gray-400">Drag column borders to resize</span>
      </div>

      {/* Full-width tree table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table
          className="border-collapse"
          style={{
            fontSize: `${zoom / 100 * 12}px`,
            width: totalTableWidth,
            minWidth: totalTableWidth,
          }}
        >
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-600 text-white">
              {COL_KEYS.map((colKey) => {
                const isRevised = colKey.startsWith("rev");
                const isCenter = !["hierarchy", "type", "details", "status"].includes(colKey);
                return (
                  <th
                    key={colKey}
                    className={`relative px-2 py-2 font-semibold select-none ${
                      colKey === "hierarchy" ? "sticky left-0 z-30 bg-slate-600" : ""
                    } ${isCenter ? "text-center" : "text-left"} ${isRevised ? "text-blue-200" : ""}`}
                    style={{
                      width: colWidths[colKey],
                      minWidth: 30,
                      fontSize: `${Math.max(9, zoom / 100 * 11)}px`,
                    }}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {COL_LABELS[colKey]}
                    </span>
                    {/* Resize handle */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(colKey, e)}
                      className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-blue-400 active:bg-blue-500 ${
                        resizingCol.current === colKey ? "bg-blue-500" : "bg-transparent"
                      }`}
                      style={{ userSelect: "none" }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loadingEntries && rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-gray-400">
                  Loading hierarchy...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-gray-400">
                  No data. Select a project or create assemblies and parts.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const bgColor = getRowBg(row);
                const isStructural = ["project", "assembly", "part"].includes(row.kind);
                const indent = row.depth * 24;

                const cellStyle = (colKey: string, extra?: React.CSSProperties): React.CSSProperties => ({
                  width: colWidths[colKey],
                  maxWidth: colWidths[colKey],
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  ...extra,
                });

                return (
                  <tr
                    key={row.key}
                    className={`border-b border-gray-200 transition-colors hover:brightness-95 ${
                      isStructural ? "font-medium" : ""
                    }`}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {/* Hierarchy — tree column */}
                    <td
                      className="sticky left-0 z-10 px-2 py-1.5"
                      style={{
                        ...cellStyle("hierarchy"),
                        paddingLeft: `${indent + 8}px`,
                        backgroundColor: bgColor || (isStructural ? "#F8FAFC" : "white"),
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {row.hasChildren ? (
                          <button
                            onClick={() => toggleExpand(row.key)}
                            className="shrink-0 rounded p-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                          >
                            {expanded.has(row.key) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        ) : (
                          <span className="w-[18px] shrink-0" />
                        )}
                        {!isStructural && (
                          <span className={`inline-flex items-center justify-center rounded mr-1 px-1 py-0 text-[9px] font-bold text-white shrink-0 ${
                            row.kind === "sfmea" ? "bg-red-500" :
                            row.kind === "dfmea" ? "bg-blue-500" :
                            row.kind === "pfmea" ? "bg-green-500" :
                            "bg-purple-500"
                          }`}>
                            {row.kind === "sfmea" ? "S" : row.kind === "dfmea" ? "D" : row.kind === "pfmea" ? "P" : "CP"}
                          </span>
                        )}
                        <span
                          className={`${
                            row.kind === "project" ? "text-gray-900 font-bold" :
                            row.kind === "assembly" ? "text-gray-800 font-semibold" :
                            row.kind === "part" ? "text-gray-700 font-medium" :
                            "text-gray-700"
                          }`}
                          title={row.label}
                          style={{ wordBreak: "break-word" }}
                        >
                          {row.label}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-2 py-1.5" style={cellStyle("type")}>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${getTypeBadgeClasses(row.kind)}`}>
                        {row.type}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="px-2 py-1.5 text-gray-600" style={cellStyle("details")} title={row.details}>
                      {row.details || ""}
                    </td>

                    {/* S */}
                    <td className="px-1 py-1.5 text-center text-gray-700" style={cellStyle("s")}>
                      {row.severity ?? (isStructural ? "" : "-")}
                    </td>
                    {/* O */}
                    <td className="px-1 py-1.5 text-center text-gray-700" style={cellStyle("o")}>
                      {row.occurrence ?? (isStructural ? "" : "-")}
                    </td>
                    {/* D */}
                    <td className="px-1 py-1.5 text-center text-gray-700" style={cellStyle("d")}>
                      {row.detection ?? (isStructural ? "" : "-")}
                    </td>
                    {/* RPN */}
                    <td className="px-1 py-1.5 text-center font-medium" style={cellStyle("rpn")}>
                      {row.rpn != null ? (
                        <span className={
                          row.rpn >= 200 ? "text-red-700 font-bold" :
                          row.rpn >= 100 ? "text-amber-700 font-bold" :
                          "text-gray-700"
                        }>{row.rpn}</span>
                      ) : ""}
                    </td>
                    {/* AP */}
                    <td className="px-1 py-1.5 text-center" style={cellStyle("ap")}>
                      {row.actionPriority ? (
                        <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold ${AP_BADGE[row.actionPriority] || ""}`}>
                          {row.actionPriority}
                        </span>
                      ) : row.specialCharClass ? (
                        <span className="text-[10px] font-medium text-gray-500">{row.specialCharClass}</span>
                      ) : ""}
                    </td>
                    {/* Status */}
                    <td className="px-2 py-1.5" style={cellStyle("status")}>
                      {row.status ? (
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[row.status] || "bg-gray-100 text-gray-600"}`}>
                          {row.status}
                        </span>
                      ) : ""}
                    </td>
                    {/* Rev S */}
                    <td className="px-1 py-1.5 text-center text-blue-600" style={cellStyle("revS")}>
                      {row.newSeverity && row.newSeverity > 0 ? row.newSeverity : (isStructural ? "" : "-")}
                    </td>
                    {/* Rev O */}
                    <td className="px-1 py-1.5 text-center text-blue-600" style={cellStyle("revO")}>
                      {row.newOccurrence && row.newOccurrence > 0 ? row.newOccurrence : (isStructural ? "" : "-")}
                    </td>
                    {/* Rev D */}
                    <td className="px-1 py-1.5 text-center text-blue-600" style={cellStyle("revD")}>
                      {row.newDetection && row.newDetection > 0 ? row.newDetection : (isStructural ? "" : "-")}
                    </td>
                    {/* Rev RPN */}
                    <td className="px-1 py-1.5 text-center font-medium text-blue-600" style={cellStyle("revRpn")}>
                      {row.newRpn && row.newRpn > 0 ? row.newRpn : (isStructural ? "" : "-")}
                    </td>
                    {/* Rev AP */}
                    <td className="px-1 py-1.5 text-center" style={cellStyle("revAp")}>
                      {row.newActionPriority ? (
                        <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold ${AP_BADGE[row.newActionPriority] || ""}`}>
                          {row.newActionPriority}
                        </span>
                      ) : (isStructural ? "" : "-")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer status bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-1.5 text-[10px] text-gray-500 flex items-center justify-between shrink-0">
        <span>{rows.length} rows displayed</span>
        <span>
          {filter !== "all" && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-600 font-medium mr-2">
              Filter: {FILTER_OPTIONS.find((o) => o.value === filter)?.label}
            </span>
          )}
          {currentProject?.name}
        </span>
      </div>
    </div>
  );
}
