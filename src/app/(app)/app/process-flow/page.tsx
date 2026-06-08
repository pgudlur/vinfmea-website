"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pfmea } from "@/lib/api";
import { useProjects } from "@/stores/useProjects";
import type { PfmeaEntry } from "@/lib/types";
import { PROCESS_SYMBOLS } from "@/lib/processFlowSymbols";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Workflow, ArrowDown } from "lucide-react";

interface ProcessStep {
  stepNumber: number;
  stepId: string;
  processStep: string;
  processFunction: string;
  symbolKey: string;
  failureMode: string;
  rpn: number;
  ap: string;
  criticality: string;
  pfmeaId: number;
}

function guessSymbol(processStep: string): string {
  const lower = processStep.toLowerCase();
  if (lower.includes("inspect") || lower.includes("check") || lower.includes("test") || lower.includes("verify")) return "inspection";
  if (lower.includes("transport") || lower.includes("move") || lower.includes("transfer")) return "transport";
  if (lower.includes("store") || lower.includes("storage") || lower.includes("warehouse")) return "storage";
  if (lower.includes("wait") || lower.includes("delay") || lower.includes("hold")) return "delay";
  if (lower.includes("decision") || lower.includes("sort") || lower.includes("select")) return "decision";
  if (lower.includes("rework") || lower.includes("repair") || lower.includes("redo")) return "rework";
  return "operation";
}

export default function ProcessFlowPage() {
  const router = useRouter();
  const { currentProject, projects } = useProjects();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
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
    pfmea
      .list({ project_id: projectId })
      .then((entries: PfmeaEntry[]) => {
        const mapped: ProcessStep[] = entries.map((e, idx) => ({
          stepNumber: idx + 1,
          stepId: e.step_id,
          processStep: e.process_step || `Step ${idx + 1}`,
          processFunction: e.process_function || "",
          symbolKey: guessSymbol(e.process_step || ""),
          failureMode: e.failure_mode || "",
          rpn: e.rpn || 0,
          ap: e.action_priority || "",
          criticality: e.criticality || "",
          pfmeaId: e.id,
        }));
        setSteps(mapped);
      })
      .catch(() => setSteps([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Workflow size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Process Flow Diagram</h1>
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
          <Workflow size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Process Flow Diagram</h1>
        </div>

        {/* Project filter */}
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

      {/* Symbol Legend */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Symbol Legend</h3>
        <div className="flex flex-wrap gap-3">
          {PROCESS_SYMBOLS.map((sym) => (
            <div key={sym.key} className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-white text-sm font-bold"
                style={{ backgroundColor: sym.color }}
              >
                {sym.symbol}
              </span>
              <span className="text-xs text-gray-600">{sym.name}</span>
            </div>
          ))}
        </div>
      </div>

      {steps.length === 0 ? (
        <EmptyState
          icon={<Workflow size={28} />}
          title="No Process Steps Found"
          description="Process flow is generated from PFMEA entries. Create PFMEA entries with process steps to see the flow diagram."
          action={{
            label: "Go to PFMEA",
            onClick: () => router.push("/app/pfmea"),
          }}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-12">Sym</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-20">Step ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Process Step</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Failure Mode</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-16">RPN</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-12">AP</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, index) => {
                  const sym = PROCESS_SYMBOLS.find((s) => s.key === step.symbolKey);
                  return (
                    <tr
                      key={step.pfmeaId}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/30 cursor-pointer"
                      onClick={() => router.push(`/app/pfmea?highlight=${step.pfmeaId}`)}
                    >
                      <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">
                        {step.stepNumber}
                      </td>
                      <td className="px-4 py-2.5">
                        {sym && (
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded text-white text-sm font-bold"
                            style={{ backgroundColor: sym.color }}
                            title={sym.name}
                          >
                            {sym.symbol}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                        {step.stepId}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">
                        {step.processStep}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">
                        {step.processFunction || "\u2014"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">
                        {step.failureMode || "\u2014"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            step.rpn >= 200
                              ? "bg-red-100 text-red-700"
                              : step.rpn >= 100
                              ? "bg-orange-100 text-orange-700"
                              : step.rpn >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {step.rpn}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${
                            step.ap === "H"
                              ? "bg-red-100 text-red-700"
                              : step.ap === "M"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {step.ap || "\u2014"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Flow visualization */}
          <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Flow Sequence</h3>
            <div className="flex flex-wrap items-center gap-1">
              {steps.map((step, index) => {
                const sym = PROCESS_SYMBOLS.find((s) => s.key === step.symbolKey);
                return (
                  <div key={step.pfmeaId} className="flex items-center gap-1">
                    <div
                      className="flex items-center gap-1 rounded-lg px-2 py-1"
                      style={{ backgroundColor: sym ? sym.color + "15" : "#F3F4F6" }}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded text-white text-[10px] font-bold"
                        style={{ backgroundColor: sym?.color ?? "#6B7280" }}
                      >
                        {sym?.symbol ?? "?"}
                      </span>
                      <span className="text-[10px] font-medium text-gray-700 max-w-[80px] truncate">
                        {step.processStep}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowDown size={12} className="text-gray-300 rotate-[-90deg]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
