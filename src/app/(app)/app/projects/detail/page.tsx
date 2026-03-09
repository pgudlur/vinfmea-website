"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import TreeView from "@/components/projects/TreeView";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  ArrowLeft,
  FileSpreadsheet,
  ClipboardList,
  Check,
} from "lucide-react";

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = Number(searchParams.get("id"));

  const {
    currentProject,
    assemblies,
    parts,
    selectedPartId,
    isLoading,
    selectProject,
    selectPart,
    createAssembly,
    createPart,
  } = useProjects();
  const addToast = useUI((s) => s.addToast);

  const [addingAssembly, setAddingAssembly] = useState(false);
  const [newAssemblyName, setNewAssemblyName] = useState("");
  const [addingPartFor, setAddingPartFor] = useState<number | null>(null);
  const [newPartName, setNewPartName] = useState("");

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  const handleAddAssembly = useCallback(async () => {
    if (!newAssemblyName.trim()) return;
    try {
      await createAssembly({
        project_id: projectId,
        name: newAssemblyName.trim(),
      });
      addToast({ type: "success", message: "Assembly created" });
      setNewAssemblyName("");
      setAddingAssembly(false);
    } catch {
      addToast({ type: "error", message: "Failed to create assembly" });
    }
  }, [newAssemblyName, projectId, createAssembly, addToast]);

  const handleAddPart = useCallback(
    async (assemblyId: number) => {
      if (!newPartName.trim()) return;
      try {
        await createPart({
          assembly_id: assemblyId,
          name: newPartName.trim(),
        });
        addToast({ type: "success", message: "Part created" });
        setNewPartName("");
        setAddingPartFor(null);
      } catch {
        addToast({ type: "error", message: "Failed to create part" });
      }
    },
    [newPartName, createPart, addToast]
  );

  if (!projectId) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No project selected.</p>
        <button
          onClick={() => router.push("/app/projects")}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (isLoading && !currentProject) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-1">
            <LoadingSkeleton lines={8} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <LoadingSkeleton lines={6} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  const STATUS_STYLES: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    "On Hold": "bg-yellow-100 text-yellow-800",
    Completed: "bg-blue-100 text-blue-800",
    Archived: "bg-gray-100 text-gray-500",
  };

  const statusStyle =
    STATUS_STYLES[currentProject.status] || "bg-gray-100 text-gray-600";

  const selectedPart = parts.find((p) => p.id === selectedPartId);

  return (
    <div className="space-y-6 p-6">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => router.push("/app/projects")}
          className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {currentProject.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {currentProject.customer && (
                <span>{currentProject.customer}</span>
              )}
              {currentProject.customer && currentProject.project_number && (
                <span className="text-gray-300">/</span>
              )}
              {currentProject.project_number && (
                <span className="font-mono text-xs text-gray-400">
                  {currentProject.project_number}
                </span>
              )}
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle}`}
          >
            {currentProject.status}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Tree view */}
        <div className="lg:col-span-1">
          <TreeView
            assemblies={assemblies}
            parts={parts}
            selectedPartId={selectedPartId}
            onSelectPart={(id) => selectPart(id)}
            onAddAssembly={() => {
              setAddingAssembly(true);
              setNewAssemblyName("");
            }}
            onAddPart={(assemblyId) => {
              setAddingPartFor(assemblyId);
              setNewPartName("");
            }}
          />

          {/* Inline assembly form */}
          {addingAssembly && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
              <input
                autoFocus
                value={newAssemblyName}
                onChange={(e) => setNewAssemblyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddAssembly();
                  if (e.key === "Escape") setAddingAssembly(false);
                }}
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Assembly name"
              />
              <button
                onClick={handleAddAssembly}
                className="rounded bg-blue-600 p-1 text-white hover:bg-blue-700"
              >
                <Check size={14} />
              </button>
            </div>
          )}

          {/* Inline part form */}
          {addingPartFor !== null && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-2">
              <input
                autoFocus
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPart(addingPartFor);
                  if (e.key === "Escape") setAddingPartFor(null);
                }}
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Part name"
              />
              <button
                onClick={() => handleAddPart(addingPartFor)}
                className="rounded bg-teal-600 p-1 text-white hover:bg-teal-700"
              >
                <Check size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Part detail / actions */}
        <div className="lg:col-span-2">
          {selectedPart ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">
                {selectedPart.name}
              </h2>
              {selectedPart.part_number && (
                <p className="mb-4 font-mono text-sm text-gray-400">
                  {selectedPart.part_number}
                </p>
              )}

              {/* Part metadata */}
              <div className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {selectedPart.material && (
                  <div>
                    <span className="text-xs text-gray-400">Material</span>
                    <p className="text-gray-700">{selectedPart.material}</p>
                  </div>
                )}
                {selectedPart.supplier && (
                  <div>
                    <span className="text-xs text-gray-400">Supplier</span>
                    <p className="text-gray-700">{selectedPart.supplier}</p>
                  </div>
                )}
                {selectedPart.drawing_number && (
                  <div>
                    <span className="text-xs text-gray-400">Drawing #</span>
                    <p className="text-gray-700">
                      {selectedPart.drawing_number}
                    </p>
                  </div>
                )}
              </div>

              {/* FMEA navigation buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    router.push(`/app/sfmea?part_id=${selectedPart.id}`)
                  }
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                >
                  <FileSpreadsheet size={16} />
                  View SFMEA
                </button>
                <button
                  onClick={() =>
                    router.push(`/app/dfmea?part_id=${selectedPart.id}`)
                  }
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <FileSpreadsheet size={16} />
                  View DFMEA
                </button>
                <button
                  onClick={() =>
                    router.push(`/app/pfmea?part_id=${selectedPart.id}`)
                  }
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <FileSpreadsheet size={16} />
                  View PFMEA
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/app/control-plan?part_id=${selectedPart.id}`
                    )
                  }
                  className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <ClipboardList size={16} />
                  View Control Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <FileSpreadsheet
                size={36}
                className="mb-3 text-gray-300"
              />
              <p className="text-sm text-gray-500">
                Select a part from the tree to view its FMEA analyses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-6">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
          <LoadingSkeleton lines={8} />
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
