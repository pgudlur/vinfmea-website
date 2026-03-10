"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  User,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  History,
} from "lucide-react";
import { audit } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface RevisionHistoryProps {
  tableName: string;
  recordId: number;
  title?: string;
}

const ACTION_CONFIG = {
  CREATE: {
    icon: PlusCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Created",
  },
  UPDATE: {
    icon: Pencil,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Updated",
  },
  DELETE: {
    icon: Trash2,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Deleted",
  },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Less than 1 minute
  if (diff < 60000) return "Just now";
  // Less than 1 hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  // Less than 24 hours
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  // Less than 7 days
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RevisionHistory({
  tableName,
  recordId,
  title,
}: RevisionHistoryProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await audit.list({
        table_name: tableName,
        record_id: recordId,
        limit: 50,
      });
      setEntries(data);
    } catch {
      // Empty state will show
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSkeleton lines={4} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            {title || "Revision History"}
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {entries.length}
          </span>
        </div>
        <button
          onClick={fetchHistory}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Timeline */}
      <div className="max-h-96 overflow-auto">
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No revision history available.
          </div>
        ) : (
          <div className="relative px-4 py-3">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[1.65rem] top-0 w-px bg-gray-200" />

            <div className="space-y-3">
              {entries.map((entry) => {
                const config =
                  ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
                const Icon = config.icon;
                const hasChanges =
                  entry.field_changes &&
                  Object.keys(entry.field_changes).length > 0;
                const isExpanded = expanded.has(entry.id);

                return (
                  <div key={entry.id} className="relative flex gap-3 pl-2">
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
                    >
                      <Icon size={12} className={config.color} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`flex items-center gap-2 ${hasChanges ? "cursor-pointer" : ""}`}
                        onClick={() => hasChanges && toggleExpand(entry.id)}
                      >
                        <span
                          className={`text-xs font-semibold ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <User size={10} />
                          {entry.username || "System"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={10} />
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        {hasChanges && (
                          <span className="ml-auto text-gray-400">
                            {isExpanded ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Field changes (expandable) */}
                      {isExpanded && entry.field_changes && (
                        <div className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                          {Object.entries(entry.field_changes).map(
                            ([field, change]) => (
                              <div
                                key={field}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="w-32 flex-shrink-0 font-medium text-gray-600">
                                  {formatFieldName(field)}
                                </span>
                                <span className="rounded bg-red-100 px-1 py-0.5 text-red-700 line-through">
                                  {String(change.old || "—").substring(0, 80)}
                                </span>
                                <span className="text-gray-400">&rarr;</span>
                                <span className="rounded bg-green-100 px-1 py-0.5 text-green-700">
                                  {String(change.new || "—").substring(0, 80)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
