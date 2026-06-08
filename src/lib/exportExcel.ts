/**
 * Excel export utility for vinFMEA SaaS.
 * Uses xlsx-js-style (a styled fork of SheetJS) so cells can be color-coded.
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

// ── Cell style helpers (xlsx-js-style uses cell.s with rgb hex) ────────────
function fillStyle(bg: string, fg: string, bold = false) {
  return {
    fill: { patternType: "solid", fgColor: { rgb: bg } },
    font: { color: { rgb: fg }, bold },
    alignment: { vertical: "center", wrapText: true },
  };
}

const CRITICALITY_STYLES: Record<string, { bg: string; fg: string }> = {
  Critical: { bg: "FECACA", fg: "991B1B" },
  High: { bg: "FED7AA", fg: "9A3412" },
  Medium: { bg: "FEF9C3", fg: "854D0E" },
  Low: { bg: "DCFCE7", fg: "166534" },
};

function criticalityStyle(value: string) {
  const m = CRITICALITY_STYLES[value];
  return m ? fillStyle(m.bg, m.fg, true) : null;
}

function rpnStyle(value: unknown) {
  const n = Number(value) || 0;
  if (n >= 200) return fillStyle("FECACA", "991B1B", true);
  if (n >= 100) return fillStyle("FED7AA", "9A3412");
  return null;
}

function apStyle(value: unknown) {
  const v = String(value);
  if (v === "H") return fillStyle("FECACA", "991B1B", true);
  if (v === "M") return fillStyle("FED7AA", "9A3412");
  if (v === "L") return fillStyle("DCFCE7", "166534");
  return null;
}

export async function exportToExcel({ entries, fmeaType, projectName, columns: optColumns }: ExportOptions) {
  const XLSX = await import("xlsx-js-style");

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

  // ── Styling ──────────────────────────────────────────────────────────────
  const HEADER_ROW = 5; // 0-based: metadata rows 0-3, blank 4, headers 5
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "1E293B" } },
    font: { color: { rgb: "FFFFFF" }, bold: true },
    alignment: { vertical: "center", wrapText: true },
  };
  // Title (row 0) bold
  const titleRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (ws[titleRef]) ws[titleRef].s = { font: { bold: true, sz: 14 } };
  // Header row
  columns.forEach((_c, c) => {
    const ref = XLSX.utils.encode_cell({ r: HEADER_ROW, c });
    if (ws[ref]) ws[ref].s = headerStyle;
  });

  // Color-code Criticality / RPN / AP cells per row (only if those columns are
  // included in the selection).
  const critIdx = columns.findIndex((c) => c.key === "criticality");
  const rpnIdx = columns.findIndex((c) => c.key === "rpn");
  const apIdx = columns.findIndex((c) => c.key === "action_priority");

  entries.forEach((entry, i) => {
    const r = HEADER_ROW + 1 + i; // 0-based sheet row of this entry
    const setStyle = (c: number, s: object | null) => {
      if (c < 0 || !s) return;
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) ws[ref].s = s;
    };
    setStyle(critIdx, criticalityStyle(String(entry["criticality"] ?? "")));
    setStyle(rpnIdx, rpnStyle(entry["rpn"]));
    setStyle(apIdx, apStyle(entry["action_priority"]));
  });

  XLSX.utils.book_append_sheet(wb, ws, label);

  // Download
  const filename = `vinFMEA_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
