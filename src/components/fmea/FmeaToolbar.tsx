"use client";

import { Plus, Trash2, Search, Link2, RefreshCw, CheckCircle2, HelpCircle } from "lucide-react";
import { FMEA_TYPE_CONFIG } from "@/lib/constants";
import type { FmeaType } from "@/lib/types";
import ExportMenu from "./ExportMenu";
import Link from "next/link";

interface FmeaToolbarProps {
  fmeaType: FmeaType;
  onAdd: () => void;
  onDelete: () => void;
  selectedCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTraceability?: () => void;
  hasSelectedRow?: boolean;
  entries?: Record<string, unknown>[];
  projectName?: string;
  onRefresh?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
}

export default function FmeaToolbar({
  fmeaType,
  onAdd,
  onDelete,
  selectedCount,
  searchQuery,
  onSearchChange,
  onTraceability,
  hasSelectedRow,
  entries = [],
  projectName,
  onRefresh,
  isSaving,
  lastSavedAt,
}: FmeaToolbarProps) {
  const typeConfig = FMEA_TYPE_CONFIG[fmeaType];

  const helpTopicMap: Record<string, string> = {
    sfmea: "sfmea",
    dfmea: "rpn",
    pfmea: "pfmea",
    "control-plan": "control-plan",
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold text-white ${typeConfig.color}`}
        >
          {typeConfig.label}
        </span>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </button>

        <button
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Delete{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </button>

        {/* Traceability button */}
        {onTraceability && (
          <button
            onClick={onTraceability}
            disabled={!hasSelectedRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Link2 className="h-4 w-4" />
            Traceability
          </button>
        )}

        {/* Refresh / Reload data */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            title="Refresh data from server"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Export menu */}
        <ExportMenu
          fmeaType={fmeaType}
          entries={entries}
          projectName={projectName}
        />

        {/* Help link */}
        <Link
          href={`/app/help?topic=${helpTopicMap[fmeaType] || "overview"}`}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title={`Help for ${typeConfig.label}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {isSaving ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Auto-saved</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>All changes auto-saved</span>
            </>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entries..."
            className="h-9 w-64 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>
    </div>
  );
}
