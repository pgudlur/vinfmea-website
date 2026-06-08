"use client";

import { ArrowRight } from "lucide-react";
import type { TraceabilityChain as TraceabilityChainType } from "@/lib/types";

interface TraceabilityChainProps {
  chain: TraceabilityChainType;
  onNavigate?: (type: string, id: number) => void;
}

const CHAIN_STEPS = [
  { key: "sfmea", label: "SFMEA", color: "#EF4444", bgColor: "#FEE2E2", borderColor: "#FECACA" },
  { key: "dfmea", label: "DFMEA", color: "#3B82F6", bgColor: "#DBEAFE", borderColor: "#BFDBFE" },
  { key: "pfmea", label: "PFMEA", color: "#22C55E", bgColor: "#DCFCE7", borderColor: "#BBF7D0" },
  { key: "control_plan", label: "Control Plan", color: "#A855F7", bgColor: "#F3E8FF", borderColor: "#E9D5FF" },
] as const;

export default function TraceabilityChain({ chain, onNavigate }: TraceabilityChainProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-2">
      {CHAIN_STEPS.map((step, index) => {
        const entry = chain[step.key as keyof TraceabilityChainType];
        const hasEntry = entry !== null && typeof entry === "object" && "id" in entry;

        return (
          <div key={step.key} className="flex items-stretch gap-2 sm:flex-1">
            {/* Card */}
            <div
              className={`flex-1 rounded-xl border-2 p-4 transition-all ${
                hasEntry
                  ? "cursor-pointer shadow-sm hover:shadow-md"
                  : "border-dashed opacity-60"
              }`}
              style={{
                backgroundColor: hasEntry ? step.bgColor : "#F9FAFB",
                borderColor: hasEntry ? step.borderColor : "#E5E7EB",
              }}
              onClick={() => {
                if (hasEntry && onNavigate) {
                  const navType = step.key === "control_plan" ? "control-plan" : step.key;
                  onNavigate(navType, (entry as { id: number }).id);
                }
              }}
            >
              {/* Type badge */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.label}
                </span>
                {chain.link && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      chain.link.sync_status === "synced"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {chain.link.sync_status === "synced" ? "Synced" : "Out of Sync"}
                  </span>
                )}
              </div>

              {hasEntry ? (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-gray-500">
                    {(entry as { step_id?: string }).step_id ?? "—"}
                  </p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {step.key === "control_plan"
                      ? ((entry as { process_step?: string }).process_step || "—")
                      : ((entry as { failure_mode?: string }).failure_mode || "—")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {"rpn" in (entry as Record<string, unknown>) && (
                      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        RPN: {(entry as { rpn?: number }).rpn ?? "—"}
                      </span>
                    )}
                    {"action_priority" in (entry as Record<string, unknown>) && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          (entry as { action_priority?: string }).action_priority === "H"
                            ? "bg-red-200 text-red-800"
                            : (entry as { action_priority?: string }).action_priority === "M"
                            ? "bg-orange-200 text-orange-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        AP: {(entry as { action_priority?: string }).action_priority ?? "—"}
                      </span>
                    )}
                    {"severity" in (entry as Record<string, unknown>) && (
                      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        S:{(entry as { severity?: number }).severity}
                        {" "}O:{(entry as { occurrence?: number }).occurrence}
                        {" "}D:{(entry as { detection?: number }).detection}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-3 text-center">
                  <p className="text-xs text-gray-400">Not Linked</p>
                </div>
              )}
            </div>

            {/* Arrow between cards */}
            {index < CHAIN_STEPS.length - 1 && (
              <div className="hidden items-center sm:flex">
                <ArrowRight size={18} className="text-gray-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
