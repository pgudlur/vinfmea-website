/**
 * Single source of truth for report/export columns per FMEA type.
 * Used by the Report Builder column picker and by the PDF + Excel exporters,
 * so the available columns and their order/labels stay consistent everywhere.
 */

import type { FmeaType } from "./types";

export interface ReportColumn {
  header: string;
  key: string;
}

export const REPORT_COLUMNS: Record<string, ReportColumn[]> = {
  sfmea: [
    { header: "Step ID", key: "step_id" },
    { header: "System Element", key: "system_element" },
    { header: "System Function", key: "system_function" },
    { header: "System Requirement", key: "system_requirement" },
    { header: "Focus Element", key: "focus_element" },
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
    { header: "Safety Goal", key: "safety_goal" },
    { header: "Safety Mechanism", key: "safety_mechanism" },
    { header: "FTTI", key: "ftti" },
    { header: "Safe State", key: "safe_state" },
    { header: "Diagnostic Coverage", key: "diagnostic_coverage" },
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
    { header: "Notes", key: "notes" },
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
    { header: "Safety Goal", key: "safety_goal" },
    { header: "Safety Mechanism", key: "safety_mechanism" },
    { header: "FTTI", key: "ftti" },
    { header: "Safe State", key: "safe_state" },
    { header: "Diagnostic Coverage", key: "diagnostic_coverage" },
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
    { header: "Notes", key: "notes" },
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
    { header: "Notes", key: "notes" },
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

/** Keys considered "revised rating" columns (the post-action S/O/D/RPN/AP). */
export const REVISED_KEYS = [
  "new_severity",
  "new_occurrence",
  "new_detection",
  "new_rpn",
  "new_action_priority",
  "rev_ctq",
];

export function getReportColumns(fmeaType: FmeaType): ReportColumn[] {
  return REPORT_COLUMNS[fmeaType] ?? REPORT_COLUMNS["dfmea"];
}

/** Resolve a list of selected keys to ordered ReportColumn objects. */
export function columnsForKeys(fmeaType: FmeaType, keys: string[]): ReportColumn[] {
  const all = getReportColumns(fmeaType);
  const set = new Set(keys);
  return all.filter((c) => set.has(c.key));
}
