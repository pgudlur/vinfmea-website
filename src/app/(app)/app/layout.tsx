"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, startHeartbeat, stopHeartbeat } from "@/stores/useAuth";
import Sidebar from "@/components/app/Sidebar";
import Header from "@/components/app/Header";
import Toast from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import OnboardingWizard from "@/components/app/OnboardingWizard";

// ── App Layout (protected) ──────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const initialize = useAuth((s) => s.initialize);
  const token = useAuth((s) => s.token);
  const isInitialized = useAuth((s) => s.isInitialized);
  const initializedRef = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Auth guard & initialization ───────────────────────────
  useEffect(() => {
    // Prevent double init in React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Check for token in localStorage before initializing store
    const storedToken = localStorage.getItem("vinfmea_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    initialize();
    setAuthChecked(true);

    // Show onboarding wizard for first-time users
    if (!localStorage.getItem("vinfmea_onboarding_complete")) {
      setShowOnboarding(true);
    }
  }, [initialize, router]);

  // ── Heartbeat lifecycle ───────────────────────────────────
  useEffect(() => {
    if (!authChecked) return;

    const currentToken = useAuth.getState().token;
    if (currentToken) {
      startHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [authChecked]);

  // ── Redirect on token loss (logout / session expiry) ──────
  useEffect(() => {
    if (isInitialized && !token) {
      router.push("/login");
    }
  }, [isInitialized, token, router]);

  // ── Loading state while checking auth ─────────────────────
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1ABC9C] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Main app shell ────────────────────────────────────────
  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 main-scroll">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <Toast />
      {showOnboarding && (
        <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
