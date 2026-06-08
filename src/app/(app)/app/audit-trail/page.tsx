"use client";

import { useEffect, useState, useCallback } from "react";
import { History, Shield, RefreshCw, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { audit } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "bg-green-50", text: "text-green-700" },
  UPDATE: { bg: "bg-blue-50", text: "text-blue-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
};

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    total_entries: number;
    broken_at: number | null;
    message: string;
  } | null>(null);
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
      if (filterTable) params.table_name = filterTable;
      const data = await audit.list(params as Parameters<typeof audit.list>[0]);
      setEntries(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, filterTable]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await audit.verify();
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false, total_entries: 0, broken_at: null, message: "Failed to verify chain" });
    } finally {
      setVerifying(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterAction && e.action !== filterAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.table_name.toLowerCase().includes(q) ||
        (e.username?.toLowerCase().includes(q) ?? false) ||
        String(e.record_id).includes(q)
      );
    }
    return true;
  });

  const tables = ["sfmea", "dfmea", "pfmea", "control_plans", "projects", "assemblies", "parts"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Audit Trail</h1>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <Shield size={16} />
          {verifying ? "Verifying..." : "Verify Hash Chain"}
        </button>
      </div>

      {/* Verify result banner */}
      {verifyResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            verifyResult.valid
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {verifyResult.valid ? (
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          ) : (
            <XCircle size={20} className="text-red-600 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${verifyResult.valid ? "text-green-800" : "text-red-800"}`}>
              {verifyResult.message}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {verifyResult.total_entries} entries checked
              {verifyResult.broken_at !== null && ` — chain broken at entry #${verifyResult.broken_at}`}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table, user, record ID..."
            className="h-9 w-64 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterTable}
          onChange={(e) => { setFilterTable(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Tables</option>
          {tables.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button
          onClick={() => { fetchEntries(); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton lines={10} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Table</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Record ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No audit entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const colors = ACTION_COLORS[entry.action] || { bg: "bg-gray-50", text: "text-gray-700" };
                  const isExpanded = expandedId === entry.id;
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {entry.username || "System"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {entry.table_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.record_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${colors.bg} ${colors.text}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate" title={entry.entry_hash}>
                        {entry.entry_hash.slice(0, 16)}...
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing {filteredEntries.length} entries (page {page + 1})
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={entries.length < PAGE_SIZE}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
