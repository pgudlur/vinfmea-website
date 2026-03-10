"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/stores/useAuth";
import { useUI } from "@/stores/useUI";

// ── Types ───────────────────────────────────────────────────

interface PageMeta {
  title: string;
  badge?: { text: string; color: string };
}

// ── Route-to-title mapping ──────────────────────────────────

const PAGE_TITLES: Record<string, PageMeta> = {
  "/app": { title: "Dashboard" },
  "/app/projects": { title: "Projects" },
  "/app/sfmea": {
    title: "SFMEA",
    badge: { text: "S", color: "#EF4444" },
  },
  "/app/dfmea": {
    title: "DFMEA",
    badge: { text: "D", color: "#3B82F6" },
  },
  "/app/pfmea": {
    title: "PFMEA",
    badge: { text: "P", color: "#22C55E" },
  },
  "/app/control-plan": {
    title: "Control Plan",
    badge: { text: "CP", color: "#A855F7" },
  },
  "/app/risk-matrix": { title: "Risk Matrix" },
  "/app/actions": { title: "Action Tracker" },
  "/app/admin": { title: "Admin Dashboard" },
  "/app/admin/users": { title: "User Management" },
  "/app/hierarchy": { title: "Hierarchy" },
  "/app/fmea-msr": {
    title: "FMEA-MSR",
    badge: { text: "MSR", color: "#F97316" },
  },
  "/app/drbfm": {
    title: "DRBFM",
    badge: { text: "DR", color: "#0EA5E9" },
  },
  "/app/dvpr": {
    title: "DVP&R",
    badge: { text: "DV", color: "#14B8A6" },
  },
  "/app/process-flow": { title: "Process Flow" },
  "/app/boundary-diagram": { title: "Boundary Diagram" },
  "/app/sync-status": { title: "Sync Status" },
  "/app/rebuild-links": { title: "Rebuild Links" },
  "/app/audit-trail": { title: "Audit Trail" },
  "/app/knowledge-library": { title: "Knowledge Library" },
  "/app/report-builder": { title: "Report Builder" },
  "/app/function-analysis": { title: "Function Analysis" },
  "/app/import": { title: "Data Import" },
  "/app/seed-data": { title: "Sample Data" },
  "/app/validation": { title: "Validation Docs" },
  "/app/help": { title: "Help" },
  "/app/language": { title: "Language" },
};

// ── Role badge colors ───────────────────────────────────────

function getRoleBadgeClasses(role: string): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";
    case "editor":
      return "bg-blue-100 text-blue-700";
    case "viewer":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ── Header Component ────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggleMobileSidebar } = useUI();

  // Resolve page title: exact match first, then prefix match
  const pageMeta = (() => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    // Find longest prefix match for nested routes
    const match = Object.keys(PAGE_TITLES)
      .filter((key) => key !== "/app" && pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    return match ? PAGE_TITLES[match] : { title: "Dashboard" };
  })();

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* ── Left side: hamburger + page title ────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2.5">
          {pageMeta.badge && (
            <span
              className="inline-flex items-center justify-center rounded font-bold leading-none"
              style={{
                fontSize: "11px",
                minWidth: "22px",
                height: "20px",
                padding: "0 5px",
                backgroundColor: pageMeta.badge.color,
                color: "#fff",
              }}
            >
              {pageMeta.badge.text}
            </span>
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      {/* ── Right side: user info ────────────────────────── */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Display name */}
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.display_name}
          </span>

          {/* Role badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${getRoleBadgeClasses(user.role)}`}
          >
            {user.role}
          </span>
        </div>
      )}
    </header>
  );
}
