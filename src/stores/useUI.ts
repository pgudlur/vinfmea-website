"use client";

import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toasts: Toast[];

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useUI = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  toasts: [],

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  toggleMobileSidebar: () =>
    set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),

  closeMobileSidebar: () =>
    set({ sidebarMobileOpen: false }),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = { ...toast, id };
    set((s) => ({ toasts: [...s.toasts, newToast] }));

    // Auto-remove after duration (default 4s)
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
