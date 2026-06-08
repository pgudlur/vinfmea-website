"use client";

import { useEffect, useState } from "react";
import { FileSearch, ArrowRight } from "lucide-react";
import { useProjects } from "@/stores/useProjects";
import { sfmea, dfmea, pfmea } from "@/lib/api";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface FunctionRow {
  type: string;
  step_id: string;
  element: string;
  function_desc: string;
  requirement: string;
  failure_mode: string;
  failure_effect: string;
  severity: number;
}

export default function FunctionAnalysisPage() {
  const { currentProject } = useProjects();
  const [rows, setRows] = useState<FunctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!currentProject) return;
    setLoading(true);
    const projectId = currentProject.id;

    Promise.all([
      sfmea.list({ project_id: projectId }).catch(() => []),
      dfmea.list({ project_id: projectId }).catch(() => []),
      pfmea.list({ project_id: projectId }).catch(() => []),
    ]).then(([sEntries, dEntries, pEntries]) => {
      const all: FunctionRow[] = [
        ...sEntries.map((e) => ({
          type: "SFMEA",
          step_id: e.step_id,
          element: e.system_element || "",
          function_desc: e.system_function || "",
          requirement: e.system_requirement || "",
          failure_mode: e.failure_mode,
          failure_effect: e.failure_effect,
          severity: e.severity,
        })),
        ...dEntries.map((e) => ({
          type: "DFMEA",
          step_id: e.step_id,
          element: e.part_name || "",
          function_desc: e.function || "",
          requirement: e.requirement || "",
          failure_mode: e.failure_mode,
          failure_effect: e.failure_effect,
          severity: e.severity,
        })),
        ...pEntries.map((e) => ({
          type: "PFMEA",
          step_id: e.step_id,
          element: e.process_step || "",
          function_desc: e.process_function || "",
          requirement: e.requirement || "",
          failure_mode: e.failure_mode,
          failure_effect: e.failure_effect,
          severity: e.severity,
        })),
      ];
      setRows(all);
      setLoading(false);
    });
  }, [currentProject]);

  const filtered = filterType === "all" ? rows : rows.filter((r) => r.type === filterType);

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      SFMEA: "bg-red-500",
      DFMEA: "bg-blue-500",
      PFMEA: "bg-green-500",
    };
    return (
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${colors[type] || "bg-gray-500"}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSearch size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Function Analysis</h1>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="SFMEA">SFMEA Only</option>
          <option value="DFMEA">DFMEA Only</option>
          <option value="PFMEA">PFMEA Only</option>
        </select>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Function Analysis maps system elements to their functions, requirements, and potential failure modes.
        This view aggregates data from SFMEA, DFMEA, and PFMEA entries to provide a unified function-to-failure mapping.
      </div>

      {loading ? (
        <LoadingSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <FileSearch size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No function data available</p>
          <p className="mt-1 text-xs text-gray-400">Create SFMEA, DFMEA, or PFMEA entries to populate this view</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
              {filtered.length} Functions
            </span>
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">
              {filtered.filter((r) => r.severity >= 9).length} Critical (S≥9)
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
              {filtered.filter((r) => r.severity >= 7 && r.severity < 9).length} High (S=7-8)
            </span>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Type</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Step ID</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Element</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Function</th>
                  <th className="px-3 py-2.5 text-center font-medium text-gray-600 w-8"></th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Requirement</th>
                  <th className="px-3 py-2.5 text-center font-medium text-gray-600 w-8"></th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Failure Mode</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Failure Effect</th>
                  <th className="px-3 py-2.5 text-center font-medium text-gray-600">S</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">{typeBadge(row.type)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{row.step_id}</td>
                    <td className="px-3 py-2 text-gray-700 max-w-[160px] truncate">{row.element || "—"}</td>
                    <td className="px-3 py-2 text-gray-700 max-w-[200px] truncate">{row.function_desc || "—"}</td>
                    <td className="text-center text-gray-300"><ArrowRight size={12} /></td>
                    <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate">{row.requirement || "—"}</td>
                    <td className="text-center text-gray-300"><ArrowRight size={12} /></td>
                    <td className="px-3 py-2 text-gray-700 max-w-[180px] truncate">{row.failure_mode || "—"}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate">{row.failure_effect || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                        row.severity >= 9 ? "bg-red-100 text-red-700" :
                        row.severity >= 7 ? "bg-amber-100 text-amber-700" :
                        row.severity >= 4 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
