"use client";

import { create } from "zustand";
import { projects, assemblies, parts } from "@/lib/api";
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  Assembly,
  AssemblyCreate,
  AssemblyUpdate,
  Part,
  PartCreate,
  PartUpdate,
} from "@/lib/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  assemblies: Assembly[];
  parts: Part[];
  selectedPartId: number | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  selectProject: (id: number) => Promise<void>;
  clearProject: () => void;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: number, data: ProjectUpdate) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;

  fetchAssemblies: (projectId: number) => Promise<void>;
  createAssembly: (data: AssemblyCreate) => Promise<Assembly>;
  updateAssembly: (id: number, data: AssemblyUpdate) => Promise<void>;
  deleteAssembly: (id: number) => Promise<void>;

  fetchParts: (params?: { assembly_id?: number; project_id?: number }) => Promise<void>;
  createPart: (data: PartCreate) => Promise<Part>;
  updatePart: (id: number, data: PartUpdate) => Promise<void>;
  deletePart: (id: number) => Promise<void>;

  selectPart: (partId: number | null) => void;
}

export const useProjects = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  assemblies: [],
  parts: [],
  selectedPartId: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await projects.list();
      set({ projects: list, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch projects",
      });
    }
  },

  selectProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projects.get(id);
      const [asms, pts] = await Promise.all([
        assemblies.list({ project_id: id }),
        parts.list({ project_id: id }),
      ]);
      set({
        currentProject: project,
        assemblies: asms,
        parts: pts,
        selectedPartId: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load project",
      });
    }
  },

  clearProject: () => {
    set({
      currentProject: null,
      assemblies: [],
      parts: [],
      selectedPartId: null,
    });
  },

  createProject: async (data: ProjectCreate) => {
    const project = await projects.create(data);
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  updateProject: async (id: number, data: ProjectUpdate) => {
    const updated = await projects.update(id, data);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? updated : p)),
      currentProject: s.currentProject?.id === id ? updated : s.currentProject,
    }));
  },

  deleteProject: async (id: number) => {
    await projects.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
    }));
  },

  fetchAssemblies: async (projectId: number) => {
    const asms = await assemblies.list({ project_id: projectId });
    set({ assemblies: asms });
  },

  createAssembly: async (data: AssemblyCreate) => {
    const asm = await assemblies.create(data);
    set((s) => ({ assemblies: [...s.assemblies, asm] }));
    return asm;
  },

  updateAssembly: async (id: number, data: AssemblyUpdate) => {
    const updated = await assemblies.update(id, data);
    set((s) => ({
      assemblies: s.assemblies.map((a) => (a.id === id ? updated : a)),
    }));
  },

  deleteAssembly: async (id: number) => {
    await assemblies.delete(id);
    const projectId = get().currentProject?.id;
    if (projectId) {
      // Refresh assemblies and parts since deleting assembly cascades
      const [asms, pts] = await Promise.all([
        assemblies.list({ project_id: projectId }),
        parts.list({ project_id: projectId }),
      ]);
      set({ assemblies: asms, parts: pts });
    }
  },

  fetchParts: async (params) => {
    const pts = await parts.list(params);
    set({ parts: pts });
  },

  createPart: async (data: PartCreate) => {
    const part = await parts.create(data);
    set((s) => ({ parts: [...s.parts, part] }));
    return part;
  },

  updatePart: async (id: number, data: PartUpdate) => {
    const updated = await parts.update(id, data);
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deletePart: async (id: number) => {
    await parts.delete(id);
    set((s) => ({
      parts: s.parts.filter((p) => p.id !== id),
      selectedPartId: s.selectedPartId === id ? null : s.selectedPartId,
    }));
  },

  selectPart: (partId: number | null) => {
    set({ selectedPartId: partId });
  },
}));
