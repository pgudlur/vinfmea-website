"use client";

import type { Project } from "@/lib/types";
import { Trash2, Calendar } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onDelete: () => void;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  Completed: "bg-blue-100 text-blue-800",
  Archived: "bg-gray-100 text-gray-500",
};

export default function ProjectCard({
  project,
  onSelect,
  onDelete,
}: ProjectCardProps) {
  const badgeStyle =
    STATUS_BADGE_STYLES[project.status] || "bg-gray-100 text-gray-600";

  const created = new Date(project.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Delete project"
      >
        <Trash2 size={16} />
      </button>

      {/* Title */}
      <h3 className="mb-1 pr-8 text-lg font-semibold text-gray-900">
        {project.name}
      </h3>

      {/* Customer and project number */}
      <div className="mb-3 space-y-0.5">
        {project.customer && (
          <p className="text-sm text-gray-500">{project.customer}</p>
        )}
        {project.project_number && (
          <p className="font-mono text-xs text-gray-400">
            {project.project_number}
          </p>
        )}
      </div>

      {/* Footer: status + date */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
        >
          {project.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar size={12} />
          {created}
        </span>
      </div>
    </div>
  );
}
