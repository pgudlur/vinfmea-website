/**
 * Excel export utility for vinFMEA SaaS.
 * Uses xlsx package (dynamic import for code splitting).
 */

import type { FmeaType } from "./types";
import { getReportColumns, type ReportColumn } from "./reportColumns";

interface ExportOptions {
  entries: Record<string, unknown>[];
  fmeaType: FmeaType;
  projectName?: string;
  /** Columns to include; defaults to the full catalog for the type. */
  columns?: ReportColumn[];
}

const FMEA_TYPE_LABELS: Record<string, string> = {
  sfmea: "SFMEA",
  dfmea: "DFMEA",
  pfmea: "PFMEA",
  "control-plan": "Control Plan",
};

export async function exportToExcel({ entries, fmeaType, projectName, columns: optColumns }: ExportOptions) {
  const XLSX = await import("xlsx");

  const columns = optColumns && optColumns.length > 0 ? optColumns : getReportColumns(fmeaType);
  const label = FMEA_TYPE_LABELS[fmeaType] ?? fmeaType.toUpperCase();

  // Build data rows
  const headers = columns.map((c) => c.header);
  const rows = entries.map((entry) =>
    columns.map((c) => {
      const val = entry[c.key];
      if (val === null || val === undefined) return "";
      return val;
    })
  );

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add metadata row
  const sheetData = [
    [`vinFMEA Pro - ${label} Export`],
    [`Project: ${projectName ?? "All Projects"}`],
    [`Exported: ${new Date().toLocaleString()}`],
    [`Total Entries: ${entries.length}`],
    [], // blank row
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws["!cols"] = columns.map((c) => ({
    wch: Math.max(c.header.length + 2, 15),
  }));

  XLSX.utils.book_append_sheet(wb, ws, label);

  // Download
  const filename = `vinFMEA_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
