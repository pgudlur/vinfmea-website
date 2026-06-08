"use client";

import { useState } from "react";
import { Link2, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { sync } from "@/lib/api";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";

export default function RebuildLinksPage() {
  const { currentProject } = useProjects();
  const addToast = useUI((s) => s.addToast);
  const [rebuilding, setRebuilding] = useState(false);
  const [result, setResult] = useState<{ links_created: number } | null>(null);

  const handleRebuild = async () => {
    setRebuilding(true);
    setResult(null);
    try {
      const data = await sync.rebuildLinks(currentProject?.id);
      setResult(data);
      addToast({ type: "success", message: `Rebuilt ${data.links_created} traceability links` });
    } catch {
      addToast({ type: "error", message: "Failed to rebuild links" });
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link2 size={22} className="text-gray-500" />
        <h1 className="text-xl font-bold text-gray-900">Rebuild Traceability Links</h1>
      </div>

      {/* Explanation card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-gray-800">How It Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Traceability links connect FMEA entries across the analysis chain:
            <span className="font-medium text-gray-800"> SFMEA → DFMEA → PFMEA → Control Plan</span>
          </p>
          <p>Links are matched by step ID suffix convention:</p>
          <div className="flex flex-wrap gap-3 py-2">
            <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 font-mono text-xs text-red-700">S-001</span>
            <span className="text-gray-400">→</span>
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 font-mono text-xs text-blue-700">D-001</span>
            <span className="text-gray-400">→</span>
            <span className="rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 font-mono text-xs text-green-700">P-001</span>
            <span className="text-gray-400">→</span>
            <span className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 font-mono text-xs text-purple-700">CP-001</span>
          </div>
          <p>
            Rebuilding links will scan all entries and re-create traceability links based on matching step ID suffixes.
            Existing links will not be duplicated.
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">Before You Rebuild</p>
          <p className="mt-1 text-xs text-amber-700">
            Ensure your step IDs follow the convention (D-001, P-001, CP-001) with matching suffixes.
            This operation is safe — it only creates new links and does not modify or delete existing ones.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleRebuild}
          disabled={rebuilding}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={rebuilding ? "animate-spin" : ""} />
          {rebuilding ? "Rebuilding..." : "Rebuild Links"}
        </button>
        {currentProject && (
          <p className="text-xs text-gray-500">
            Scope: <span className="font-medium text-gray-700">{currentProject.name}</span>
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 size={20} className="shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Links Rebuilt Successfully</p>
            <p className="text-xs text-green-700 mt-0.5">
              {result.links_created} new traceability link{result.links_created !== 1 ? "s" : ""} created
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
