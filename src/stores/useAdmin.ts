"use client";

import { create } from "zustand";
import { adminLicenses, adminUsers } from "@/lib/api";
import type {
  AdminDashboardSummary,
  SaasLicense,
  UserWithSession,
} from "@/lib/types";

interface AdminState {
  // License state
  licenses: SaasLicense[];
  licensesTotal: number;
  summary: AdminDashboardSummary | null;
  licenseSearch: string;
  licensePlanFilter: string;
  licenseStatusFilter: string;
  licensePage: number;

  // User state
  users: UserWithSession[];
  usersTotal: number;
  userSearch: string;
  userRoleFilter: string;
  userStatusFilter: string;
  userPage: number;

  // Loading states
  isLoadingSummary: boolean;
  isLoadingLicenses: boolean;
  isLoadingUsers: boolean;

  // Actions
  fetchSummary: () => Promise<void>;
  fetchLicenses: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  setLicenseSearch: (v: string) => void;
  setLicensePlanFilter: (v: string) => void;
  setLicenseStatusFilter: (v: string) => void;
  setLicensePage: (v: number) => void;
  setUserSearch: (v: string) => void;
  setUserRoleFilter: (v: string) => void;
  setUserStatusFilter: (v: string) => void;
  setUserPage: (v: number) => void;
}

const PAGE_SIZE = 50;

export const useAdmin = create<AdminState>((set, get) => ({
  // License state
  licenses: [],
  licensesTotal: 0,
  summary: null,
  licenseSearch: "",
  licensePlanFilter: "",
  licenseStatusFilter: "",
  licensePage: 0,

  // User state
  users: [],
  usersTotal: 0,
  userSearch: "",
  userRoleFilter: "",
  userStatusFilter: "",
  userPage: 0,

  // Loading
  isLoadingSummary: false,
  isLoadingLicenses: false,
  isLoadingUsers: false,

  fetchSummary: async () => {
    set({ isLoadingSummary: true });
    try {
      const data = await adminLicenses.summary();
      set({ summary: data });
    } catch {
      // ignore
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  fetchLicenses: async () => {
    const { licenseSearch, licensePlanFilter, licenseStatusFilter, licensePage } = get();
    set({ isLoadingLicenses: true });
    try {
      const res = await adminLicenses.list({
        search: licenseSearch || undefined,
        plan: licensePlanFilter || undefined,
        status: licenseStatusFilter || undefined,
        offset: licensePage * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      set({ licenses: res.items, licensesTotal: res.total });
    } catch {
      // ignore
    } finally {
      set({ isLoadingLicenses: false });
    }
  },

  fetchUsers: async () => {
    const { userSearch, userRoleFilter, userStatusFilter, userPage } = get();
    set({ isLoadingUsers: true });
    try {
      const res = await adminUsers.list({
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined,
        offset: userPage * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      set({ users: res.items, usersTotal: res.total });
    } catch {
      // ignore
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  setLicenseSearch: (v) => set({ licenseSearch: v, licensePage: 0 }),
  setLicensePlanFilter: (v) => set({ licensePlanFilter: v, licensePage: 0 }),
  setLicenseStatusFilter: (v) => set({ licenseStatusFilter: v, licensePage: 0 }),
  setLicensePage: (v) => set({ licensePage: v }),
  setUserSearch: (v) => set({ userSearch: v, userPage: 0 }),
  setUserRoleFilter: (v) => set({ userRoleFilter: v, userPage: 0 }),
  setUserStatusFilter: (v) => set({ userStatusFilter: v, userPage: 0 }),
  setUserPage: (v) => set({ userPage: v }),
}));
