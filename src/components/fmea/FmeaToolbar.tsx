"use client";

import { Plus, Trash2, Search } from "lucide-react";
import { FMEA_TYPE_CONFIG } from "@/lib/constants";
import type { FmeaType } from "@/lib/types";

interface FmeaToolbarProps {
  fmeaType: FmeaType;
  onAdd: () => void;
  onDelete: () => void;
  selectedCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function FmeaToolbar({
  fmeaType,
  onAdd,
  onDelete,
  selectedCount,
  searchQuery,
  onSearchChange,
}: FmeaToolbarProps) {
  const typeConfig = FMEA_TYPE_CONFIG[fmeaType];

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
      </div>

      {/* Right side */}
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
  );
}
