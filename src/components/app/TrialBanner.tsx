"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/api";
import type { TrialStatus } from "@/lib/types";
import { Clock, X } from "lucide-react";

const DISMISS_KEY = "vinfmea_trial_banner_dismissed";

function isDismissedToday(): boolean {
  if (typeof window === "undefined") return false;
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  return dismissed === new Date().toISOString().slice(0, 10);
}

export default function TrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(true); // hidden until loaded

  useEffect(() => {
    setDismissed(isDismissedToday());
    auth.trialStatus().then(setTrial).catch(() => {});
  }, []);

  if (!trial || !trial.is_trial || trial.days_remaining > 7 || dismissed) {
    return null;
  }

  const isUrgent = trial.days_remaining <= 3;
  const dayWord = trial.days_remaining === 1 ? "day" : "days";

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
    setDismissed(true);
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm font-medium text-white ${
        isUrgent
          ? "bg-red-500"
          : "bg-amber-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          {trial.days_remaining === 0
            ? "Your free trial expires today."
            : `Your free trial expires in ${trial.days_remaining} ${dayWord}.`}
          {" "}
          <a
            href="/pricing"
            className="underline underline-offset-2 font-semibold hover:no-underline"
          >
            Upgrade to keep your data
          </a>
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-4 shrink-0 rounded p-0.5 hover:bg-white/20 transition-colors"
        aria-label="Dismiss trial banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
