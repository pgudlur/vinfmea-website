"use client";

import { create } from "zustand";
import { sfmea, dfmea, pfmea, controlPlans } from "@/lib/api";
import type {
  FmeaType,
  SfmeaEntry,
  DfmeaEntry,
  PfmeaEntry,
  ControlPlanEntry,
} from "@/lib/types";

// Union row type for the spreadsheet
export type FmeaRow = SfmeaEntry | DfmeaEntry | PfmeaEntry | ControlPlanEntry;

interface FmeaState {
  entries: FmeaRow[];
  fmeaType: FmeaType;
  isLoading: boolean;
  error: string | null;
  editingId: number | null;
  searchQuery: string;

  fetchEntries: (
    type: FmeaType,
    filters?: { partId?: number; projectId?: number }
  ) => Promise<void>;
  createEntry: (type: FmeaType, data: Record<string, unknown>) => Promise<void>;
  updateEntry: (
    type: FmeaType,
    id: number,
    data: Record<string, unknown>
  ) => Promise<void>;
  deleteEntry: (type: FmeaType, id: number) => Promise<void>;
  setEditing: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setFmeaType: (type: FmeaType) => void;
}

// Map FMEA type to API module
function getApi(type: FmeaType) {
  switch (type) {
    case "sfmea":
      return sfmea;
    case "dfmea":
      return dfmea;
    case "pfmea":
      return pfmea;
    case "control-plan":
      return controlPlans;
  }
}

export const useFmea = create<FmeaState>((set) => ({
  entries: [],
  fmeaType: "dfmea",
  isLoading: false,
  error: null,
  editingId: null,
  searchQuery: "",

  fetchEntries: async (type, filters) => {
    set({ isLoading: true, error: null, fmeaType: type });
    try {
      const api = getApi(type);
      const params: { part_id?: number; project_id?: number } = {};
      if (filters?.partId) params.part_id = filters.partId;
      if (filters?.projectId) params.project_id = filters.projectId;

      const entries = await api.list(params);
      set({ entries: entries as FmeaRow[], isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch entries",
      });
    }
  },

  createEntry: async (type, data) => {
    const api = getApi(type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = await (api.create as any)(data);
    set((s) => ({ entries: [...s.entries, entry] }));
  },

  updateEntry: async (type, id, data) => {
    const api = getApi(type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (api.update as any)(id, data);
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? updated : e)),
    }));
  },

  deleteEntry: async (type, id) => {
    const api = getApi(type);
    await api.delete(id);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
    }));
  },

  setEditing: (id) => set({ editingId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFmeaType: (type) => set({ fmeaType: type }),
}));
