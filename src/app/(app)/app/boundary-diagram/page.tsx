"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sfmea, dfmea } from "@/lib/api";
import { useProjects } from "@/stores/useProjects";
import type { SfmeaEntry, DfmeaEntry } from "@/lib/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Network, ArrowRight } from "lucide-react";

interface BoundaryElement {
  id: number;
  type: "sfmea" | "dfmea";
  typeBadge: { label: string; color: string };
  stepId: string;
  element: string;
  scope: string;
  connectedTo: string;
  interfaceType: string;
  failureMode: string;
  severity: number;
  rpn: number;
  ap: string;
}

export default function BoundaryDiagramPage() {
  const router = useRouter();
  const { currentProject, projects } = useProjects();
  const [elements, setElements] = useState<BoundaryElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (currentProject) {
      setProjectId(currentProject.id);
    } else if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [currentProject, projects]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);

    Promise.all([
      sfmea.list({ project_id: projectId }).catch(() => []),
      dfmea.list({ project_id: projectId }).catch(() => []),
    ])
      .then(([sEntries, dEntries]) => {
        const mapped: BoundaryElement[] = [];

        (sEntries as SfmeaEntry[]).forEach((e) => {
          mapped.push({
            id: e.id,
            type: "sfmea",
            typeBadge: { label: "S", color: "#EF4444" },
            stepId: e.step_id,
            element: e.system_element || e.focus_element || "System Element",
            scope: e.system_function || "",
            connectedTo: e.system_requirement || "",
            interfaceType: "System",
            failureMode: e.failure_mode || "",
            severity: e.severity || 0,
            rpn: e.rpn || 0,
            ap: e.action_priority || "",
          });
        });

        (dEntries as DfmeaEntry[]).forEach((e) => {
          mapped.push({
            id: e.id,
            type: "dfmea",
            typeBadge: { label: "D", color: "#3B82F6" },
            stepId: e.step_id,
            element: e.part_name || "Component",
            scope: (e as DfmeaEntry).function || "",
            connectedTo: (e as DfmeaEntry).requirement || "",
            interfaceType: "Component",
            failureMode: e.failure_mode || "",
            severity: e.severity || 0,
            rpn: e.rpn || 0,
            ap: e.action_priority || "",
          });
        });

        setElements(mapped);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Network size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Boundary Diagram</h1>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Boundary Diagram</h1>
        </div>

        {projects.length > 1 && (
          <select
            value={projectId ?? ""}
            onChange={(e) => setProjectId(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{elements.length}</p>
          <p className="text-xs text-gray-500">Total Elements</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-red-600">
            {elements.filter((e) => e.type === "sfmea").length}
          </p>
          <p className="text-xs text-gray-500">System (SFMEA)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-blue-600">
            {elements.filter((e) => e.type === "dfmea").length}
          </p>
          <p className="text-xs text-gray-500">Component (DFMEA)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-orange-600">
            {elements.filter((e) => e.severity >= 9).length}
          </p>
          <p className="text-xs text-gray-500">Safety Critical (S\u22659)</p>
        </div>
      </div>

      {elements.length === 0 ? (
        <EmptyState
          icon={<Network size={28} />}
          title="No Boundary Elements Found"
          description="Boundary diagram is derived from SFMEA and DFMEA entries. Create entries to see the system boundary analysis."
          action={{
            label: "Go to SFMEA",
            onClick: () => router.push("/app/sfmea"),
          }}
        />
      ) : (
        <>
          {/* Visual boundary diagram */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">System Boundary Map</h3>
            <div className="flex flex-wrap gap-3">
              {elements.map((el, index) => (
                <div key={`${el.type}-${el.id}`} className="flex items-center gap-2">
                  <div
                    className="rounded-lg border-2 px-3 py-2 min-w-[120px] cursor-pointer transition-shadow hover:shadow-md"
                    style={{
                      borderColor: el.typeBadge.color + "80",
                      backgroundColor: el.typeBadge.color + "10",
                    }}
                    onClick={() =>
                      router.push(`/app/${el.type}?highlight=${el.id}`)
                    }
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="rounded px-1 py-0.5 text-[9px] font-bold text-white"
                        style={{ backgroundColor: el.typeBadge.color }}
                      >
                        {el.typeBadge.label}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {el.stepId}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">
                      {el.element}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                      {el.interfaceType}
                    </p>
                  </div>
                  {index < elements.length - 1 && (
                    <ArrowRight size={14} className="text-gray-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table view */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-12">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-20">Step ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Element</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Function/Scope</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Interface</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Failure Mode</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-12">S</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-16">RPN</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-12">AP</th>
                  </tr>
                </thead>
                <tbody>
                  {elements.map((el) => (
                    <tr
                      key={`${el.type}-${el.id}`}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/30 cursor-pointer"
                      onClick={() =>
                        router.push(`/app/${el.type}?highlight=${el.id}`)
                      }
                    >
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: el.typeBadge.color }}
                        >
                          {el.typeBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                        {el.stepId}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">
                        {el.element}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">
                        {el.scope || "\u2014"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {el.interfaceType}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">
                        {el.failureMode || "\u2014"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${
                            el.severity >= 9
                              ? "bg-red-100 text-red-700"
                              : el.severity >= 7
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {el.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            el.rpn >= 200
                              ? "bg-red-100 text-red-700"
                              : el.rpn >= 100
                              ? "bg-orange-100 text-orange-700"
                              : el.rpn >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {el.rpn}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${
                            el.ap === "H"
                              ? "bg-red-100 text-red-700"
                              : el.ap === "M"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {el.ap || "\u2014"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
