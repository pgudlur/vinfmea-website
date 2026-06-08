"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Link2 } from "lucide-react";
import { sync } from "@/lib/api";
import type { TraceabilityChain as TraceabilityChainType } from "@/lib/types";
import TraceabilityChain from "./TraceabilityChain";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface TraceabilityDialogProps {
  open: boolean;
  entryType: string;
  entryId: number | null;
  onClose: () => void;
}

export default function TraceabilityDialog({
  open,
  entryType,
  entryId,
  onClose,
}: TraceabilityDialogProps) {
  const router = useRouter();
  const [chain, setChain] = useState<TraceabilityChainType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entryId) return;
    setLoading(true);
    setError(null);
    setChain(null);

    let apiType = entryType;
    if (entryType === "control-plan") apiType = "control_plan";
    // Server doesn't support sfmea traceability
    if (entryType === "sfmea") {
      setError("Traceability is not available for SFMEA entries. Use DFMEA, PFMEA, or Control Plan entries.");
      setLoading(false);
      return;
    }

    sync
      .traceability(apiType, entryId)
      .then((data) => {
        setChain(data);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to fetch traceability chain";
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, entryType, entryId]);

  if (!open) return null;

  function handleNavigate(type: string, id: number) {
    onClose();
    router.push(`/app/${type}?highlight=${id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Link2 size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Traceability Chain
              </h2>
              <p className="text-xs text-gray-500">
                SFMEA &rarr; DFMEA &rarr; PFMEA &rarr; Control Plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="py-8">
              <LoadingSkeleton lines={4} />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <p className="mt-1 text-xs text-red-400">
                This entry may not have any linked records. Traceability requires matching step IDs across FMEA types.
              </p>
            </div>
          ) : chain ? (
            <TraceabilityChain chain={chain} onNavigate={handleNavigate} />
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No traceability data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          Traceability links are based on matching step IDs (e.g., D-001 &rarr; P-001 &rarr; CP-001).
          Click any card to navigate to that entry.
        </div>
      </div>
    </div>
  );
}
