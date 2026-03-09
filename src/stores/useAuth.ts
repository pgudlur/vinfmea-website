"use client";

import { create } from "zustand";
import { auth, license, setToken, clearToken, ApiError } from "@/lib/api";
import type { UserInfo } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  seatId: number | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sessionWarning: "none" | "warning" | "expired";

  initialize: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  dismissWarning: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  seatId: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  sessionWarning: "none",

  initialize: () => {
    if (typeof window === "undefined") return;
    if (get().isInitialized) return;
    set({ isInitialized: true });

    const token = localStorage.getItem("vinfmea_token");
    if (token) {
      set({ token });
      // Validate token by fetching user profile
      get()
        .refreshUser()
        .catch(() => {
          // refreshUser already handles clearing token on 401/403
          // Network errors are silently ignored (token stays)
        });
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null, sessionWarning: "none" });
    try {
      const res = await auth.login(username, password);
      setToken(res.token);
      set({
        token: res.token,
        user: {
          id: res.user_id,
          username: res.username,
          display_name: res.display_name,
          role: res.role,
          is_active: true,
          created_at: "",
        },
        seatId: res.seat_id,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    stopHeartbeat();
    try {
      await auth.logout();
    } catch {
      // Always clear local state
    }
    clearToken();
    set({
      token: null,
      user: null,
      seatId: null,
      sessionWarning: "none",
    });
  },

  refreshUser: async () => {
    try {
      const user = await auth.me();
      set({ user });
    } catch (err) {
      // Only clear token on definitive auth errors (401/403)
      // Network errors or server issues should not log user out
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearToken();
        set({ token: null, user: null, seatId: null });
      }
      throw err;
    }
  },

  dismissWarning: () => {
    set({ sessionWarning: "none" });
  },
}));

// ── Heartbeat ───────────────────────────────────────────────

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let listenersAttached = false;
let lastUserActivity = Date.now();

function onUserActivity() {
  lastUserActivity = Date.now();
}

export function startHeartbeat() {
  if (heartbeatInterval) return;

  if (typeof window !== "undefined" && !listenersAttached) {
    window.addEventListener("mousemove", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity, { passive: true });
    window.addEventListener("click", onUserActivity, { passive: true });
    listenersAttached = true;
    lastUserActivity = Date.now();
  }

  // Heartbeat every 60 seconds (server expects this; cleans stale at 5 min)
  heartbeatInterval = setInterval(async () => {
    const state = useAuth.getState();
    if (!state.token) return;

    const elapsed = Date.now() - lastUserActivity;
    // Only send heartbeat if user was active in the last 10 minutes
    if (elapsed < 10 * 60 * 1000) {
      try {
        await license.heartbeat();
      } catch {
        useAuth.setState({ sessionWarning: "expired" });
      }
    } else if (elapsed > 25 * 60 * 1000) {
      // 25+ minutes idle — warn about session expiring
      useAuth.setState({ sessionWarning: "warning" });
    }
  }, 60 * 1000);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (typeof window !== "undefined" && listenersAttached) {
    window.removeEventListener("mousemove", onUserActivity);
    window.removeEventListener("keydown", onUserActivity);
    window.removeEventListener("click", onUserActivity);
    listenersAttached = false;
  }
}
