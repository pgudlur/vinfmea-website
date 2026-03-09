"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Project, ProjectCreate } from "@/lib/types";
import { PROJECT_STATUSES } from "@/lib/constants";
import { X } from "lucide-react";

interface ProjectFormProps {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
  onSave: (data: ProjectCreate) => void;
}

export default function ProjectForm({
  open,
  project,
  onClose,
  onSave,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreate>({
    defaultValues: {
      name: "",
      description: "",
      customer: "",
      project_number: "",
      model_year: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name,
          description: project.description || "",
          customer: project.customer || "",
          project_number: project.project_number || "",
          model_year: project.model_year || "",
          status: project.status || "Active",
        });
      } else {
        reset({
          name: "",
          description: "",
          customer: "",
          project_number: "",
          model_year: "",
          status: "Active",
        });
      }
    }
  }, [open, project, reset]);

  if (!open) return null;

  const isEdit = !!project;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="animate-slide-up relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Project name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer
            </label>
            <input
              {...register("customer")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Customer name"
            />
          </div>

          {/* Project Number + Model Year row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Project Number
              </label>
              <input
                {...register("project_number")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="PRJ-001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Model Year
              </label>
              <input
                {...register("model_year")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="2026"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
