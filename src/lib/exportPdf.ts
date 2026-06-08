/**
 * PDF export utility for vinFMEA SaaS.
 * Uses jsPDF + jspdf-autotable (dynamic import for code splitting).
 */

import type { FmeaType } from "./types";
import { getReportColumns, type ReportColumn } from "./reportColumns";

interface PdfExportOptions {
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

export async function exportToPdf({ entries, fmeaType, projectName, columns: optColumns }: PdfExportOptions) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const label = FMEA_TYPE_LABELS[fmeaType] ?? fmeaType.toUpperCase();
  const columns = optColumns && optColumns.length > 0 ? optColumns : getReportColumns(fmeaType);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(`vinFMEA Pro \u2014 ${label} Report`, 14, 15);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Project: ${projectName ?? "All Projects"}`, 14, 22);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 27);
  doc.text(`Total Entries: ${entries.length}`, 14, 32);

  // Summary statistics
  const rpnValues = entries
    .map((e) => Number(e.rpn) || 0)
    .filter((v) => v > 0);
  if (rpnValues.length > 0) {
    const avgRpn = Math.round(rpnValues.reduce((a, b) => a + b, 0) / rpnValues.length);
    const maxRpn = Math.max(...rpnValues);
    doc.text(`Avg RPN: ${avgRpn}  |  Max RPN: ${maxRpn}`, 14, 37);
  }

  // Table
  const tableData = entries.map((entry) =>
    columns.map((c) => {
      const val = entry[c.key];
      if (val === null || val === undefined) return "";
      return String(val);
    })
  );

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
    },
    tableWidth: "auto",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didParseCell: (data) => {
      // Color RPN cells by value
      if (data.section === "body") {
        const rpnColIdx = columns.findIndex((c) => c.key === "rpn");
        if (data.column.index === rpnColIdx) {
          const rpn = Number(data.cell.raw) || 0;
          if (rpn >= 200) {
            data.cell.styles.fillColor = [254, 202, 202];
            data.cell.styles.textColor = [153, 27, 27];
          } else if (rpn >= 100) {
            data.cell.styles.fillColor = [254, 215, 170];
            data.cell.styles.textColor = [154, 52, 18];
          }
        }
        // Color AP cells
        const apColIdx = columns.findIndex((c) => c.key === "action_priority");
        if (data.column.index === apColIdx) {
          const ap = String(data.cell.raw);
          if (ap === "H") {
            data.cell.styles.fillColor = [254, 202, 202];
            data.cell.styles.textColor = [153, 27, 27];
          } else if (ap === "M") {
            data.cell.styles.fillColor = [254, 215, 170];
            data.cell.styles.textColor = [154, 52, 18];
          }
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `vinFMEA Pro \u2014 Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    );
  }

  const filename = `vinFMEA_${label}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
