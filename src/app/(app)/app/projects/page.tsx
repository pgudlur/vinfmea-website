"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import type { Project, ProjectCreate } from "@/lib/types";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Plus, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    deleteProject,
  } = useProjects();
  const addToast = useUI((s) => s.addToast);

  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleSave(data: ProjectCreate) {
    try {
      await createProject(data);
      addToast({ type: "success", message: "Project created successfully" });
      setFormOpen(false);
      setEditProject(null);
    } catch {
      addToast({ type: "error", message: "Failed to create project" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id);
      addToast({ type: "success", message: "Project deleted" });
    } catch {
      addToast({ type: "error", message: "Failed to delete project" });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          {projects.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {projects.length}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setEditProject(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={28} />}
          title="No projects yet"
          description="Create your first project to start building FMEA analyses, control plans, and more."
          action={{
            label: "Create Project",
            onClick: () => {
              setEditProject(null);
              setFormOpen(true);
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => router.push(`/app/projects/detail?id=${project.id}`)}
              onDelete={() => setDeleteTarget(project)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit form */}
      <ProjectForm
        open={formOpen}
        project={editProject}
        onClose={() => {
          setFormOpen(false);
          setEditProject(null);
        }}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
