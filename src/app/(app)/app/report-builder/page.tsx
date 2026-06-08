"use client";

import { useState } from "react";
import { ClipboardCheck, Download, FileSpreadsheet, FileText, Settings2, CheckSquare } from "lucide-react";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import { sfmea, dfmea, pfmea, controlPlans } from "@/lib/api";
import { REPORT_COLUMNS, columnsForKeys } from "@/lib/reportColumns";
import type { FmeaType } from "@/lib/types";

interface ReportSection {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// FMEA sections that have selectable columns, mapped to their export type.
const SECTION_TO_FMEA: Record<string, FmeaType> = {
  sfmea: "sfmea",
  dfmea: "dfmea",
  pfmea: "pfmea",
  control_plan: "control-plan",
};

function initialSelectedCols(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [sid, ft] of Object.entries(SECTION_TO_FMEA)) {
    out[sid] = REPORT_COLUMNS[ft].map((c) => c.key); // default: all columns
  }
  return out;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: "summary", label: "Project Summary", description: "Project details, counts, and statistics", enabled: true },
  { id: "sfmea", label: "SFMEA Entries", description: "System-level FMEA analysis", enabled: true },
  { id: "dfmea", label: "DFMEA Entries", description: "Design-level failure mode analysis", enabled: true },
  { id: "pfmea", label: "PFMEA Entries", description: "Process-level failure mode analysis", enabled: true },
  { id: "control_plan", label: "Control Plan", description: "Process control details", enabled: true },
  { id: "risk_summary", label: "Risk Summary", description: "RPN distribution and top risks", enabled: true },
  { id: "ap_summary", label: "Action Priority Summary", description: "AP distribution across types", enabled: true },
  { id: "criticality", label: "Criticality Summary", description: "Critical/High/Medium/Low breakdown", enabled: true },
  { id: "actions", label: "Open Actions", description: "Pending recommended actions and owners", enabled: false },
  { id: "traceability", label: "Traceability Matrix", description: "DFMEA → PFMEA → CP links", enabled: false },
];

export default function ReportBuilderPage() {
  const { currentProject } = useProjects();
  const addToast = useUI((s) => s.addToast);
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const [generating, setGenerating] = useState(false);
  const [selectedCols, setSelectedCols] = useState<Record<string, string[]>>(initialSelectedCols);
  const [expandedCols, setExpandedCols] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const toggleCol = (sid: string, key: string) => {
    const ft = SECTION_TO_FMEA[sid];
    setSelectedCols((prev) => {
      const cur = new Set(prev[sid] ?? []);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      // keep catalog order
      const ordered = REPORT_COLUMNS[ft].map((c) => c.key).filter((k) => cur.has(k));
      return { ...prev, [sid]: ordered };
    });
  };

  const setAllCols = (sid: string, all: boolean) => {
    const ft = SECTION_TO_FMEA[sid];
    setSelectedCols((prev) => ({
      ...prev,
      [sid]: all ? REPORT_COLUMNS[ft].map((c) => c.key) : [],
    }));
  };

  const enabledCount = sections.filter((s) => s.enabled).length;

  const handleGenerate = async () => {
    if (!currentProject) {
      addToast({ type: "error", message: "Select a project first" });
      return;
    }
    if (enabledCount === 0) {
      addToast({ type: "error", message: "Select at least one section" });
      return;
    }

    setGenerating(true);
    try {
      const projectId = currentProject.id;
      const enabledIds = new Set(sections.filter((s) => s.enabled).map((s) => s.id));

      // Fetch data for enabled sections
      const [sEntries, dEntries, pEntries, cpEntries] = await Promise.all([
        enabledIds.has("sfmea") ? sfmea.list({ project_id: projectId }).catch(() => []) : Promise.resolve([]),
        enabledIds.has("dfmea") ? dfmea.list({ project_id: projectId }).catch(() => []) : Promise.resolve([]),
        enabledIds.has("pfmea") ? pfmea.list({ project_id: projectId }).catch(() => []) : Promise.resolve([]),
        enabledIds.has("control_plan") ? controlPlans.list({ project_id: projectId }).catch(() => []) : Promise.resolve([]),
      ]);

      if (format === "excel") {
        const { exportToExcel } = await import("@/lib/exportExcel");
        // Export each type to its own sheet
        const excelTypes = [
          { data: sEntries, fmeaType: "sfmea" as const, id: "sfmea" },
          { data: dEntries, fmeaType: "dfmea" as const, id: "dfmea" },
          { data: pEntries, fmeaType: "pfmea" as const, id: "pfmea" },
          { data: cpEntries, fmeaType: "control-plan" as const, id: "control_plan" },
        ];
        for (const { data, fmeaType, id } of excelTypes) {
          if (data.length > 0 && enabledIds.has(id)) {
            await exportToExcel({
              entries: data as Record<string, unknown>[],
              fmeaType,
              projectName: currentProject.name,
              columns: columnsForKeys(fmeaType, selectedCols[id] ?? []),
            });
          }
        }

        addToast({ type: "success", message: "Excel report(s) downloaded" });
      } else {
        const { exportToPdf } = await import("@/lib/exportPdf");
        const pdfTypes = [
          { data: sEntries, fmeaType: "sfmea" as const, id: "sfmea" },
          { data: dEntries, fmeaType: "dfmea" as const, id: "dfmea" },
          { data: pEntries, fmeaType: "pfmea" as const, id: "pfmea" },
          { data: cpEntries, fmeaType: "control-plan" as const, id: "control_plan" },
        ];
        for (const { data, fmeaType, id } of pdfTypes) {
          if (data.length > 0 && enabledIds.has(id)) {
            await exportToPdf({
              entries: data as Record<string, unknown>[],
              fmeaType,
              projectName: currentProject.name,
              columns: columnsForKeys(fmeaType, selectedCols[id] ?? []),
            });
          }
        }
        addToast({ type: "success", message: "PDF report(s) downloaded" });
      }
    } catch (err) {
      addToast({ type: "error", message: "Failed to generate report" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Report Builder</h1>
        </div>
        {currentProject && (
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
            Project: <span className="font-medium text-gray-800">{currentProject.name}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Section selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Report Sections</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, enabled: true })))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, enabled: false })))}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {sections.map((section) => {
                const ft = SECTION_TO_FMEA[section.id];
                const isFmea = !!ft;
                const colKeys = isFmea ? (selectedCols[section.id] ?? []) : [];
                const total = isFmea ? REPORT_COLUMNS[ft].length : 0;
                const open = expandedCols === section.id;
                return (
                  <div
                    key={section.id}
                    className={`rounded-lg border transition-colors ${
                      section.enabled ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${section.enabled ? "text-gray-900" : "text-gray-600"}`}>
                          {section.label}
                        </p>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                      {isFmea && section.enabled ? (
                        <button
                          type="button"
                          onClick={() => setExpandedCols(open ? null : section.id)}
                          className="ml-auto shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Columns ({colKeys.length}/{total}) {open ? "▴" : "▾"}
                        </button>
                      ) : (
                        section.enabled && <CheckSquare size={16} className="ml-auto text-blue-500 shrink-0" />
                      )}
                    </div>
                    {isFmea && section.enabled && open && (
                      <div className="border-t border-gray-100 px-3 py-3">
                        <div className="mb-2 flex gap-2 text-xs">
                          <button type="button" onClick={() => setAllCols(section.id, true)} className="text-blue-600 hover:text-blue-700">All</button>
                          <span className="text-gray-300">|</span>
                          <button type="button" onClick={() => setAllCols(section.id, false)} className="text-gray-500 hover:text-gray-700">None</button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                          {REPORT_COLUMNS[ft].map((c) => (
                            <label key={c.key} className="flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={colKeys.includes(c.key)}
                                onChange={() => toggleCol(section.id, c.key)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="truncate">{c.header}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Settings & Generate */}
        <div className="space-y-4">
          {/* Format */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Output Format</h3>
            </div>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                format === "excel" ? "border-green-300 bg-green-50" : "border-gray-200"
              }`}>
                <input
                  type="radio"
                  name="format"
                  checked={format === "excel"}
                  onChange={() => setFormat("excel")}
                  className="text-green-600"
                />
                <FileSpreadsheet size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Excel (.xlsx)</p>
                  <p className="text-xs text-gray-500">Multi-sheet workbook with all data</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                format === "pdf" ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}>
                <input
                  type="radio"
                  name="format"
                  checked={format === "pdf"}
                  onChange={() => setFormat("pdf")}
                  className="text-red-600"
                />
                <FileText size={18} className="text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">PDF</p>
                  <p className="text-xs text-gray-500">Formatted report with summary tables</p>
                </div>
              </label>
            </div>
          </div>

          {/* Columns hint */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Columns</h3>
            <p className="text-xs text-gray-500">
              Use the <span className="font-medium">Columns</span> button on each FMEA
              section to choose exactly which fields appear in the report. All columns
              (including revised ratings) are included by default.
            </p>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={generating || enabledCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={18} />
            {generating ? "Generating..." : `Generate Report (${enabledCount} sections)`}
          </button>
        </div>
      </div>
    </div>
  );
}
