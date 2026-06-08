"use client";

import { useState, useRef, useEffect } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import type { FmeaType } from "@/lib/types";

interface ExportMenuProps {
  fmeaType: FmeaType;
  entries: Record<string, unknown>[];
  projectName?: string;
}

export default function ExportMenu({ fmeaType, entries, projectName }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExcelExport = async () => {
    setExporting(true);
    try {
      const { exportToExcel } = await import("@/lib/exportExcel");
      await exportToExcel({ entries, fmeaType, projectName });
    } catch (err) {
      console.error("Excel export failed:", err);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  const handlePdfExport = async () => {
    setExporting(true);
    try {
      const { exportToPdf } = await import("@/lib/exportPdf");
      await exportToPdf({ entries, fmeaType, projectName });
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={entries.length === 0 || exporting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FileDown className="h-4 w-4" />
        {exporting ? "Exporting..." : "Export"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={handleExcelExport}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Export Excel (.xlsx)
          </button>
          <button
            onClick={handlePdfExport}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FileText size={16} className="text-red-600" />
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
