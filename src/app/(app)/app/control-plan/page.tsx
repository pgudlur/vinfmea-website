"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFmea } from "@/stores/useFmea";
import { useProjects } from "@/stores/useProjects";
import FmeaSpreadsheet from "@/components/fmea/FmeaSpreadsheet";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { ChevronRight } from "lucide-react";

function ControlPlanContent() {
  const searchParams = useSearchParams();
  const partId = searchParams.get("part_id");
  const projectId = searchParams.get("project_id");

  const { fetchEntries, isLoading } = useFmea();
  const { parts } = useProjects();

  const part = partId ? parts.find((p) => p.id === Number(partId)) : null;

  useEffect(() => {
    fetchEntries("control-plan", {
      partId: partId ? Number(partId) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
    });
  }, [fetchEntries, partId, projectId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {part && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Control Plan</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-gray-900">{part.name}</span>
          {part.part_number && (
            <span className="ml-1 text-xs text-gray-400">
              ({part.part_number})
            </span>
          )}
        </nav>
      )}

      <FmeaSpreadsheet fmeaType="control-plan" />
    </div>
  );
}

export default function ControlPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSkeleton lines={8} />
        </div>
      }
    >
      <ControlPlanContent />
    </Suspense>
  );
}
