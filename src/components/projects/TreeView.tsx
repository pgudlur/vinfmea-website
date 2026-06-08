"use client";

import { useState, useMemo } from "react";
import type { Assembly, Part, DfmeaEntry, PfmeaEntry, SfmeaEntry, ControlPlanEntry } from "@/lib/types";
import { CRITICALITY_ROW_COLORS } from "@/lib/constants";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Package,
  Plus,
  ChevronsUpDown,
  ChevronsDownUp,
  Filter,
} from "lucide-react";

// Union type for any FMEA entry shown in the tree
export type TreeFmeaEntry = (SfmeaEntry | DfmeaEntry | PfmeaEntry | ControlPlanEntry) & {
  _fmea_type: string;
};

interface TreeViewProps {
  assemblies: Assembly[];
  parts: Part[];
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  onAddAssembly: () => void;
  onAddPart: (assemblyId: number) => void;
  fmeaEntries?: TreeFmeaEntry[];
}

const FMEA_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  sfmea: { label: "S", color: "#EF4444" },
  dfmea: { label: "D", color: "#3B82F6" },
  pfmea: { label: "P", color: "#22C55E" },
  "control-plan": { label: "CP", color: "#A855F7" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "sfmea", label: "SFMEA Only" },
  { value: "dfmea", label: "DFMEA Only" },
  { value: "pfmea", label: "PFMEA Only" },
  { value: "control-plan", label: "Control Plan Only" },
  { value: "high-priority", label: "High Priority" },
  { value: "critical", label: "Critical Only" },
];

export default function TreeView({
  assemblies,
  parts,
  selectedPartId,
  onSelectPart,
  onAddAssembly,
  onAddPart,
  fmeaEntries = [],
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    assemblies.forEach((a) => ids.add(`asm-${a.id}`));
    return ids;
  });
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function expandAll() {
    const all = new Set<string>();
    assemblies.forEach((a) => all.add(`asm-${a.id}`));
    parts.forEach((p) => all.add(`part-${p.id}`));
    setExpanded(all);
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  function getPartsForAssembly(assemblyId: number): Part[] {
    return parts.filter((p) => p.assembly_id === assemblyId);
  }

  // Filter FMEA entries for a specific part
  const getFilteredEntries = useMemo(() => {
    return (partId: number): TreeFmeaEntry[] => {
      let entries = fmeaEntries.filter((e) => {
        if ("part_id" in e) return (e as { part_id: number | null }).part_id === partId;
        return false;
      });

      if (filter === "all") return entries;
      if (filter === "high-priority") {
        return entries.filter(
          (e) => "action_priority" in e && (e as { action_priority: string }).action_priority === "H"
        );
      }
      if (filter === "critical") {
        return entries.filter(
          (e) => "criticality" in e && (e as { criticality: string }).criticality === "Critical"
        );
      }
      return entries.filter((e) => e._fmea_type === filter);
    };
  }, [fmeaEntries, filter]);

  const allExpanded =
    assemblies.every((a) => expanded.has(`asm-${a.id}`)) &&
    parts.every((p) => expanded.has(`part-${p.id}`));

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Project Structure
        </h3>
        <div className="flex items-center gap-1">
          {/* Expand/Collapse all */}
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title={allExpanded ? "Collapse All" : "Expand All"}
          >
            {allExpanded ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
          </button>

          {/* Filter toggle */}
          {fmeaEntries.length > 0 && (
            <button
              onClick={() => setShowFilter((p) => !p)}
              className={`rounded p-1.5 transition-colors ${
                showFilter || filter !== "all"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
              title="Filter FMEA entries"
            >
              <Filter size={14} />
            </button>
          )}

          <button
            onClick={onAddAssembly}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Plus size={14} />
            Add Assembly
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && fmeaEntries.length > 0 && (
        <div className="border-b border-gray-100 px-4 py-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tree content */}
      <div className="p-2 max-h-[70vh] overflow-y-auto">
        {assemblies.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No assemblies yet. Add one to get started.
          </div>
        ) : (
          <div className="space-y-0.5">
            {assemblies.map((assembly) => {
              const asmKey = `asm-${assembly.id}`;
              const isAsmExpanded = expanded.has(asmKey);
              const assemblyParts = getPartsForAssembly(assembly.id);

              return (
                <div key={assembly.id}>
                  {/* Assembly node */}
                  <div className="group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
                    <button
                      onClick={() => toggleExpand(asmKey)}
                      className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      {isAsmExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <Layers size={16} className="flex-shrink-0 text-blue-500" />
                    <span className="flex-1 truncate text-sm font-medium text-gray-800">
                      {assembly.name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {assemblyParts.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddPart(assembly.id);
                      }}
                      className="rounded p-0.5 text-gray-300 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-500 group-hover:opacity-100"
                      title="Add part"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Part children */}
                  {isAsmExpanded && (
                    <div className="ml-6 space-y-0.5">
                      {assemblyParts.length === 0 ? (
                        <div className="py-1 pl-6 text-xs text-gray-300">
                          No parts
                        </div>
                      ) : (
                        assemblyParts.map((part) => {
                          const isSelected = selectedPartId === part.id;
                          const partKey = `part-${part.id}`;
                          const isPartExpanded = expanded.has(partKey);
                          const partEntries = getFilteredEntries(part.id);
                          const hasEntries = partEntries.length > 0;

                          return (
                            <div key={part.id}>
                              {/* Part node */}
                              <div
                                className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-teal-50 text-teal-800"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                {/* Expand toggle for FMEA entries */}
                                {hasEntries ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(partKey);
                                    }}
                                    className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                                  >
                                    {isPartExpanded ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronRight size={14} />
                                    )}
                                  </button>
                                ) : (
                                  <span className="w-5" />
                                )}
                                <button
                                  onClick={() => onSelectPart(part.id)}
                                  className="flex flex-1 items-center gap-2 min-w-0"
                                >
                                  <Package
                                    size={14}
                                    className={
                                      isSelected
                                        ? "flex-shrink-0 text-teal-500"
                                        : "flex-shrink-0 text-gray-400"
                                    }
                                  />
                                  <span className="flex-1 truncate text-sm">
                                    {part.name}
                                  </span>
                                </button>
                                {part.part_number && (
                                  <span className="text-xs text-gray-400 shrink-0">
                                    {part.part_number}
                                  </span>
                                )}
                                {hasEntries && (
                                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 shrink-0">
                                    {partEntries.length}
                                  </span>
                                )}
                              </div>

                              {/* FMEA entry children */}
                              {isPartExpanded && hasEntries && (
                                <div className="ml-7 space-y-0.5 py-0.5">
                                  {partEntries.map((entry) => {
                                    const badge =
                                      FMEA_TYPE_BADGES[entry._fmea_type] ?? {
                                        label: "?",
                                        color: "#6B7280",
                                      };
                                    const crit =
                                      "criticality" in entry
                                        ? (entry as { criticality: string }).criticality
                                        : "";
                                    const critBg = CRITICALITY_ROW_COLORS[crit];

                                    return (
                                      <div
                                        key={`${entry._fmea_type}-${entry.id}`}
                                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-gray-50"
                                        style={
                                          critBg
                                            ? { backgroundColor: critBg + "66" }
                                            : undefined
                                        }
                                      >
                                        <span
                                          className="inline-flex shrink-0 items-center justify-center rounded px-1 py-0.5 text-[9px] font-bold text-white"
                                          style={{
                                            backgroundColor: badge.color,
                                            minWidth: "18px",
                                          }}
                                        >
                                          {badge.label}
                                        </span>
                                        <span className="font-mono text-gray-500 shrink-0">
                                          {entry.step_id}
                                        </span>
                                        <span className="truncate text-gray-700">
                                          {"failure_mode" in entry
                                            ? (entry as { failure_mode: string }).failure_mode
                                            : "—"}
                                        </span>
                                        <span className="ml-auto flex items-center gap-1 shrink-0">
                                          {"rpn" in entry && (
                                            <span className="rounded bg-gray-100 px-1 py-0.5 text-[9px] font-medium text-gray-500">
                                              RPN:
                                              {(entry as { rpn: number }).rpn}
                                            </span>
                                          )}
                                          {"action_priority" in entry && (
                                            <span
                                              className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                                                (entry as { action_priority: string })
                                                  .action_priority === "H"
                                                  ? "bg-red-100 text-red-700"
                                                  : (entry as { action_priority: string })
                                                      .action_priority === "M"
                                                  ? "bg-orange-100 text-orange-700"
                                                  : "bg-green-100 text-green-700"
                                              }`}
                                            >
                                              {
                                                (entry as { action_priority: string })
                                                  .action_priority
                                              }
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
