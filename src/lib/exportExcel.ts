/**
 * Excel export utility for vinFMEA SaaS.
 * Uses xlsx package (dynamic import for code splitting).
 */

import type { FmeaType } from "./types";

interface ExportOptions {
  entries: Record<string, unknown>[];
  fmeaType: FmeaType;
  projectName?: string;
}

const FMEA_TYPE_LABELS: Record<string, string> = {
  sfmea: "SFMEA",
  dfmea: "DFMEA",
  pfmea: "PFMEA",
  "control-plan": "Control Plan",
};

// Column configs per FMEA type
const COLUMN_CONFIGS: Record<string, { header: string; key: string }[]> = {
  sfmea: [
    { header: "Step ID", key: "step_id" },
    { header: "System Element", key: "system_element" },
    { header: "System Function", key: "system_function" },
    { header: "Failure Mode", key: "failure_mode" },
    { header: "Failure Effect", key: "failure_effect" },
    { header: "Severity", key: "severity" },
    { header: "Failure Cause", key: "failure_cause" },
    { header: "Occurrence", key: "occurrence" },
    { header: "Prevention Controls", key: "current_prevention_controls" },
    { header: "Detection Controls", key: "current_detection_controls" },
    { header: "Detection", key: "detection" },
    { header: "RPN", key: "rpn" },
    { header: "AP", key: "action_priority" },
    { header: "Criticality", key: "criticality" },
    { header: "ASIL", key: "asil_rating" },
    { header: "Recommended Action", key: "recommended_action" },
    { header: "Responsibility", key: "responsibility" },
    { header: "Target Date", key: "target_date" },
    { header: "Status", key: "action_status" },
    { header: "Action Taken", key: "action_taken" },
    { header: "New S", key: "new_severity" },
    { header: "New O", key: "new_occurrence" },
    { header: "New D", key: "new_detection" },
    { header: "New RPN", key: "new_rpn" },
    { header: "New AP", key: "new_action_priority" },
  ],
  dfmea: [
    { header: "Step ID", key: "step_id" },
    { header: "Part Name", key: "part_name" },
    { header: "Function", key: "function" },
    { header: "Requirement", key: "requirement" },
    { header: "Failure Mode", key: "failure_mode" },
    { header: "Failure Effect", key: "failure_effect" },
    { header: "Severity", key: "severity" },
    { header: "Failure Cause", key: "failure_cause" },
    { header: "Occurrence", key: "occurrence" },
    { header: "Prevention Controls", key: "current_prevention_controls" },
    { header: "Detection Controls", key: "current_detection_controls" },
    { header: "Detection", key: "detection" },
    { header: "RPN", key: "rpn" },
    { header: "AP", key: "action_priority" },
    { header: "Criticality", key: "criticality" },
    { header: "ASIL", key: "asil_rating" },
    { header: "Recommended Action", key: "recommended_action" },
    { header: "Responsibility", key: "responsibility" },
    { header: "Target Date", key: "target_date" },
    { header: "Status", key: "action_status" },
    { header: "Action Taken", key: "action_taken" },
    { header: "New S", key: "new_severity" },
    { header: "New O", key: "new_occurrence" },
    { header: "New D", key: "new_detection" },
    { header: "New RPN", key: "new_rpn" },
    { header: "New AP", key: "new_action_priority" },
  ],
  pfmea: [
    { header: "Step ID", key: "step_id" },
    { header: "Process Step", key: "process_step" },
    { header: "Process Function", key: "process_function" },
    { header: "Requirement", key: "requirement" },
    { header: "Failure Mode", key: "failure_mode" },
    { header: "Failure Effect", key: "failure_effect" },
    { header: "Severity", key: "severity" },
    { header: "Failure Cause", key: "failure_cause" },
    { header: "Occurrence", key: "occurrence" },
    { header: "Prevention Controls", key: "current_prevention_controls" },
    { header: "Detection Controls", key: "current_detection_controls" },
    { header: "Detection", key: "detection" },
    { header: "RPN", key: "rpn" },
    { header: "AP", key: "action_priority" },
    { header: "Criticality", key: "criticality" },
    { header: "CTQ (Init)", key: "init_ctq" },
    { header: "CTQ (Rev)", key: "rev_ctq" },
    { header: "Recommended Action", key: "recommended_action" },
    { header: "Responsibility", key: "responsibility" },
    { header: "Target Date", key: "target_date" },
    { header: "Status", key: "action_status" },
    { header: "Action Taken", key: "action_taken" },
    { header: "New S", key: "new_severity" },
    { header: "New O", key: "new_occurrence" },
    { header: "New D", key: "new_detection" },
    { header: "New RPN", key: "new_rpn" },
    { header: "New AP", key: "new_action_priority" },
  ],
  "control-plan": [
    { header: "Step ID", key: "step_id" },
    { header: "Process Step", key: "process_step" },
    { header: "Machine/Device", key: "machine_device" },
    { header: "Characteristic #", key: "characteristic_number" },
    { header: "Product Characteristic", key: "product_characteristic" },
    { header: "Process Characteristic", key: "process_characteristic" },
    { header: "Special Char Class", key: "special_char_class" },
    { header: "Spec/Tolerance", key: "specification_tolerance" },
    { header: "Eval Method", key: "evaluation_measurement" },
    { header: "Sample Size", key: "sample_size" },
    { header: "Sample Freq", key: "sample_frequency" },
    { header: "Control Method", key: "control_method" },
    { header: "Reaction Plan", key: "reaction_plan" },
    { header: "Responsible", key: "responsible" },
    { header: "Notes", key: "notes" },
  ],
};

export async function exportToExcel({ entries, fmeaType, projectName }: ExportOptions) {
  const XLSX = await import("xlsx");

  const columns = COLUMN_CONFIGS[fmeaType] ?? COLUMN_CONFIGS["dfmea"];
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
