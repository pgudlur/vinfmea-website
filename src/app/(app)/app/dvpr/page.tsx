"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Search, RefreshCw, Loader2 } from "lucide-react";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import { toolsDvpr } from "@/lib/api";
import type { DvprEntry, DvprCreate, DvprUpdate } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

const STATUS_OPTIONS = ["Planned", "In Progress", "Pass", "Fail", "Conditional Pass"];
const TEST_TYPE_OPTIONS = ["DV", "PV", "OTS", "PPAP", "Endurance", "Environmental"];

const STATUS_COLORS: Record<string, string> = {
  Planned: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pass: "bg-green-100 text-green-700",
  Fail: "bg-red-100 text-red-700",
  "Conditional Pass": "bg-amber-100 text-amber-700",
};

export default function DvprPage() {
  const { currentProject } = useProjects();
  const addToast = useUI((s) => s.addToast);
  const [entries, setEntries] = useState<DvprEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchEntries = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const data = await toolsDvpr.list({ project_id: currentProject.id });
      setEntries(data);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load DVP&R entries" });
    } finally {
      setLoading(false);
    }
  }, [currentProject, addToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async () => {
    if (!currentProject) return;
    const stepNum = String(entries.length + 1).padStart(3, "0");
    try {
      const payload: DvprCreate = {
        project_id: currentProject.id,
        test_number: `DVP-${stepNum}`,
        test_description: "",
      };
      const created = await toolsDvpr.create(payload);
      setEntries((prev) => [...prev, created]);
      addToast({ type: "success", message: "DVP&R test added" });
    } catch (err) {
      addToast({ type: "error", message: "Failed to add DVP&R test" });
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    let deleted = 0;
    for (const id of ids) {
      try {
        await toolsDvpr.delete(id);
        deleted++;
      } catch {
        /* skip */
      }
    }
    setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    setSelectedIds(new Set());
    addToast({ type: "success", message: `Deleted ${deleted} test(s)` });
  };

  const handleCellChange = async (
    entry: DvprEntry,
    field: keyof DvprUpdate,
    value: string
  ) => {
    // Optimistic update
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, [field]: value } : e))
    );

    setSaving(entry.id);
    try {
      const payload: DvprUpdate = {
        [field]: value,
        version: entry.version,
      };
      const updated = await toolsDvpr.update(entry.id, payload);
      setEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    } catch (err: unknown) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, [field]: entry[field as keyof DvprEntry] }
            : e
        )
      );
      const msg =
        err instanceof Error && err.message.includes("409")
          ? "Version conflict — please refresh"
          : "Failed to save change";
      addToast({ type: "error", message: msg });
    } finally {
      setSaving(null);
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredEntries = searchQuery
    ? entries.filter((e) =>
        Object.values(e).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      )
    : entries;

  // Summary stats
  const statusCounts = entries.reduce(
    (acc, e) => {
      const s = e.status ?? "Planned";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const columns: {
    key: keyof DvprEntry;
    label: string;
    width: string;
    type?: "select" | "date";
    options?: string[];
  }[] = [
    { key: "test_number", label: "Test #", width: "w-20" },
    { key: "test_description", label: "Test Description", width: "w-40" },
    {
      key: "test_type",
      label: "Type",
      width: "w-24",
      type: "select",
      options: TEST_TYPE_OPTIONS,
    },
    { key: "test_method", label: "Test Method", width: "w-32" },
    { key: "acceptance_criteria", label: "Acceptance Criteria", width: "w-36" },
    { key: "sample_size", label: "Sample", width: "w-20" },
    { key: "test_environment", label: "Environment", width: "w-28" },
    { key: "responsibility", label: "Resp.", width: "w-24" },
    { key: "target_date", label: "Target Date", width: "w-28", type: "date" },
    { key: "test_results", label: "Results", width: "w-32" },
    {
      key: "status",
      label: "Status",
      width: "w-28",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "dfmea_reference", label: "DFMEA Ref", width: "w-20" },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-teal-500 px-2.5 py-1 text-xs font-bold text-white">
            DVP&R
          </span>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Test
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
          >
            <Trash2 size={16} /> Delete
            {selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </button>
          <button
            onClick={fetchEntries}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {saving !== null && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" /> Saving...
            </span>
          )}

          {/* Status summary badges */}
          <div className="ml-3 flex gap-1.5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span
                key={status}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}
              >
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Info */}
      <div className="border-b border-teal-200 bg-teal-50 px-4 py-2 text-xs text-teal-700">
        DVP&R (Design Verification Plan & Report) — Links DFMEA failure modes to
        verification tests. Track test status from planning through completion.
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gray-300 bg-gray-100">
              <th className="w-8 border-r border-gray-300 px-2 py-2">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === entries.length && entries.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedIds(new Set(entries.map((r) => r.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="rounded"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.width} whitespace-nowrap border-r border-gray-300 px-2 py-2 text-left font-semibold text-gray-700`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  {entries.length === 0
                    ? 'No DVP&R entries yet. Click "Add Test" to begin.'
                    : "No matching entries"}
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="border-r border-gray-200 px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      className="rounded"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="border-r border-gray-200 px-1 py-1"
                    >
                      {col.type === "select" ? (
                        <select
                          value={String(entry[col.key] ?? "")}
                          onChange={(e) =>
                            handleCellChange(
                              entry,
                              col.key as keyof DvprUpdate,
                              e.target.value
                            )
                          }
                          className={`w-full rounded border-0 px-1 py-0.5 text-xs font-medium ${
                            col.key === "status"
                              ? STATUS_COLORS[String(entry[col.key] ?? "")] ??
                                ""
                              : ""
                          }`}
                        >
                          <option value="">—</option>
                          {(col.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : col.type === "date" ? (
                        <input
                          type="date"
                          value={String(entry[col.key] ?? "")}
                          onChange={(e) =>
                            handleCellChange(
                              entry,
                              col.key as keyof DvprUpdate,
                              e.target.value
                            )
                          }
                          className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(entry[col.key] ?? "")}
                          onBlur={(e) => {
                            if (
                              e.target.value !==
                              String(entry[col.key] ?? "")
                            ) {
                              handleCellChange(
                                entry,
                                col.key as keyof DvprUpdate,
                                e.target.value
                              );
                            }
                          }}
                          onChange={(e) => {
                            setEntries((prev) =>
                              prev.map((en) =>
                                en.id === entry.id
                                  ? { ...en, [col.key]: e.target.value }
                                  : en
                              )
                            );
                          }}
                          className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        {entries.length} tests | {selectedIds.size} selected
      </div>
    </div>
  );
}
