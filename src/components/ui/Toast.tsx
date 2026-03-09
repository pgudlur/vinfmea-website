"use client";

import { useUI } from "@/stores/useUI";
import { X } from "lucide-react";

const borderColorMap: Record<string, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
  warning: "border-l-yellow-500",
};

const iconBgMap: Record<string, string> = {
  success: "bg-green-50",
  error: "bg-red-50",
  info: "bg-blue-50",
  warning: "bg-yellow-50",
};

const textColorMap: Record<string, string> = {
  success: "text-green-800",
  error: "text-red-800",
  info: "text-blue-800",
  warning: "text-yellow-800",
};

export default function Toast() {
  const toasts = useUI((s) => s.toasts);
  const removeToast = useUI((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-slide-up
            flex items-start gap-3
            rounded-lg border-l-4 bg-white px-4 py-3
            shadow-lg
            ${borderColorMap[toast.type] ?? "border-l-blue-500"}
            ${iconBgMap[toast.type] ?? "bg-blue-50"}
          `}
          style={{ background: "white" }}
        >
          <p
            className={`flex-1 text-sm font-medium ${textColorMap[toast.type] ?? "text-gray-800"}`}
          >
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="mt-0.5 flex-shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
