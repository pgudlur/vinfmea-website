"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  Grid3X3,
  ListChecks,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/stores/useAuth";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";

// ── Types ───────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: { text: string; color: string };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Badge component for FMEA type indicators ───────────────

function TypeBadge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded font-bold leading-none"
      style={{
        fontSize: "10px",
        minWidth: "20px",
        height: "18px",
        padding: "0 4px",
        backgroundColor: color,
        color: "#fff",
      }}
    >
      {text}
    </span>
  );
}

// ── Navigation configuration ────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/app",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Projects",
        href: "/app/projects",
        icon: <FolderOpen size={20} />,
      },
    ],
  },
  {
    title: "ANALYSIS",
    items: [
      {
        label: "SFMEA",
        href: "/app/sfmea",
        badge: { text: "S", color: "#EF4444" },
      },
      {
        label: "DFMEA",
        href: "/app/dfmea",
        badge: { text: "D", color: "#3B82F6" },
      },
      {
        label: "PFMEA",
        href: "/app/pfmea",
        badge: { text: "P", color: "#22C55E" },
      },
      {
        label: "Control Plan",
        href: "/app/control-plan",
        badge: { text: "CP", color: "#A855F7" },
      },
    ],
  },
  {
    title: "TOOLS",
    items: [
      {
        label: "Risk Matrix",
        href: "/app/risk-matrix",
        icon: <Grid3X3 size={20} />,
      },
      {
        label: "Actions",
        href: "/app/actions",
        icon: <ListChecks size={20} />,
      },
    ],
  },
];

// ── Sidebar Component ───────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { currentProject } = useProjects();
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    closeMobileSidebar,
    toggleSidebar,
  } = useUI();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo & collapse toggle ─────────────────────────── */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700/50 shrink-0">
        {!sidebarCollapsed && (
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1ABC9C] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              vinFMEA
            </span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/app" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-[#1ABC9C] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* ── Project selector ───────────────────────────────── */}
      {!sidebarCollapsed && currentProject && (
        <div className="px-3 py-3 border-b border-slate-700/50 shrink-0">
          <Link
            href="/app/projects"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 transition-colors duration-200 group"
          >
            <FolderOpen size={16} className="text-[#1ABC9C] shrink-0" />
            <span className="text-sm text-slate-200 truncate flex-1">
              {currentProject.name}
            </span>
            <ChevronDown
              size={14}
              className="text-slate-400 group-hover:text-slate-300 shrink-0"
            />
          </Link>
        </div>
      )}

      {/* ── Navigation sections ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {/* Section label */}
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </p>
            )}
            {sidebarCollapsed && <div className="mb-1" />}

            {/* Links */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobileSidebar}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`
                        group relative flex items-center gap-3 rounded-lg transition-all duration-200
                        ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"}
                        ${
                          active
                            ? "text-[#1ABC9C] bg-teal-500/10 border-l-2 border-[#1ABC9C]"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/40 border-l-2 border-transparent"
                        }
                      `}
                    >
                      {/* Icon or badge */}
                      <span className="shrink-0 flex items-center justify-center w-5 h-5">
                        {item.icon ? (
                          item.icon
                        ) : item.badge ? (
                          <TypeBadge
                            text={item.badge.text}
                            color={item.badge.color}
                          />
                        ) : null}
                      </span>

                      {/* Label */}
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                      )}

                      {/* Collapsed tooltip */}
                      {sidebarCollapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg pointer-events-none">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Sign out ───────────────────────────────────────── */}
      <div className="border-t border-slate-700/50 px-2 py-3 shrink-0">
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? "Sign Out" : undefined}
          className={`
            group relative flex items-center gap-3 w-full rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"}
          `}
        >
          <LogOut size={20} className="shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Sign Out</span>
          )}
          {sidebarCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg pointer-events-none">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile backdrop ────────────────────────────────── */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in"
          onClick={closeMobileSidebar}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        className={`
          bg-[#1E293B] flex flex-col shrink-0 transition-all duration-200 select-none
          ${sidebarCollapsed ? "w-16" : "w-64"}
          hidden lg:flex
        `}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar (overlay) ───────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#1E293B] flex flex-col
          transition-transform duration-200 lg:hidden
          ${sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
