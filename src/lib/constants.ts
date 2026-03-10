/**
 * Constants for vinFMEA SaaS — colors, column definitions, rating scales.
 */

// ── Action Priority Colors ──────────────────────────────────

export const AP_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  H: { bg: "bg-red-100", text: "text-red-700", label: "High" },
  M: { bg: "bg-orange-100", text: "text-orange-700", label: "Medium" },
  L: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
};

// ── Criticality Colors ──────────────────────────────────────

export const CRITICALITY_COLORS: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-green-100", text: "text-green-700" },
  Medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
  High: { bg: "bg-orange-100", text: "text-orange-700" },
  Critical: { bg: "bg-red-100", text: "text-red-700" },
};

// ── Status Colors ───────────────────────────────────────────

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Open: { bg: "bg-gray-100", text: "text-gray-600" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700" },
  Completed: { bg: "bg-green-100", text: "text-green-700" },
  Deferred: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Cancelled: { bg: "bg-gray-100", text: "text-gray-400" },
};

// ── S/O/D Rating Color (1-10) ───────────────────────────────

export function getRatingColor(value: number): string {
  if (value <= 3) return "bg-green-100 text-green-800";
  if (value <= 5) return "bg-yellow-100 text-yellow-800";
  if (value <= 7) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

// ── RPN Color ───────────────────────────────────────────────

export function getRpnColor(rpn: number): string {
  if (rpn <= 50) return "bg-green-100 text-green-800";
  if (rpn <= 100) return "bg-yellow-100 text-yellow-800";
  if (rpn <= 200) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

// ── Risk Matrix Cell Color ──────────────────────────────────

export function getRiskCellColor(severity: number, occurrence: number): string {
  const product = severity * occurrence;
  if (product >= 50) return "bg-red-500";
  if (product >= 25) return "bg-orange-400";
  if (product >= 10) return "bg-yellow-400";
  return "bg-green-400";
}

// ── ASIL Ratings ────────────────────────────────────────────

export const ASIL_OPTIONS = ["", "QM", "A", "B", "C", "D"];

export const ASIL_COLORS: Record<string, { bg: string; text: string }> = {
  QM: { bg: "bg-green-100", text: "text-green-700" },
  A: { bg: "bg-yellow-100", text: "text-yellow-700" },
  B: { bg: "bg-orange-100", text: "text-orange-700" },
  C: { bg: "bg-red-100", text: "text-red-700" },
  D: { bg: "bg-red-200", text: "text-red-900" },
};

// ── Action Statuses ─────────────────────────────────────────

export const ACTION_STATUSES = [
  "Open",
  "In Progress",
  "Completed",
  "Deferred",
  "Cancelled",
];

// ── Project Statuses ────────────────────────────────────────

export const PROJECT_STATUSES = [
  "Active",
  "On Hold",
  "Completed",
  "Archived",
];

// ── Special Char Classes (Control Plan) ─────────────────────

export const SPECIAL_CHAR_CLASSES = [
  "",
  "CC",
  "SC",
  "S",
  "R",
  "HI",
  "F",
  "A",
];

// ── Diagnostic Coverage Levels ──────────────────────────────

export const DIAGNOSTIC_COVERAGE_LEVELS = [
  "",
  "High (>=99%)",
  "Medium (90-99%)",
  "Low (60-90%)",
  "None (<60%)",
];

// ── FTTI Presets ────────────────────────────────────────────

export const FTTI_PRESETS = [
  "",
  "10ms",
  "50ms",
  "100ms",
  "500ms",
  "1s",
  "Custom",
];

// ── Row-Level Criticality Background Colors (inline styles) ─

export const CRITICALITY_ROW_COLORS: Record<string, string> = {
  Critical: "#FADBD8",  // Light Red
  High:     "#FDEBD0",  // Light Orange
  Medium:   "#FEF9E7",  // Light Yellow
  Low:      "#D5F5E3",  // Light Green
};

// ── Control Plan Special Char Class Row Colors ──────────────

export const SPECIAL_CHAR_ROW_COLORS: Record<string, string> = {
  CC: "#FADBD8",  // Critical Characteristic – Light Red
  S:  "#FADBD8",  // Safety – Light Red
  SC: "#FEF9E7",  // Significant – Light Yellow
  R:  "#FEF9E7",  // Regulatory – Light Yellow
  HI: "#FDEBD0",  // High Impact – Light Orange
  F:  "#E8F4F8",  // Fit – Light Blue
  A:  "#E8F4F8",  // Appearance – Light Blue
};

// ── FMEA Type Labels ────────────────────────────────────────

export const FMEA_TYPE_CONFIG = {
  sfmea: { label: "SFMEA", short: "S", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  dfmea: { label: "DFMEA", short: "D", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  pfmea: { label: "PFMEA", short: "P", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
  "control-plan": { label: "Control Plan", short: "CP", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
} as const;

// ── Severity Scale (AIAG-VDA) ───────────────────────────────

export const SEVERITY_SCALE = [
  { value: 1, label: "No effect" },
  { value: 2, label: "Very minor" },
  { value: 3, label: "Minor" },
  { value: 4, label: "Very low" },
  { value: 5, label: "Low" },
  { value: 6, label: "Moderate" },
  { value: 7, label: "High" },
  { value: 8, label: "Very high" },
  { value: 9, label: "Hazardous with warning" },
  { value: 10, label: "Hazardous without warning" },
];

// ── Occurrence Scale ────────────────────────────────────────

export const OCCURRENCE_SCALE = [
  { value: 1, label: "Almost impossible" },
  { value: 2, label: "Remote" },
  { value: 3, label: "Very low" },
  { value: 4, label: "Low" },
  { value: 5, label: "Moderately low" },
  { value: 6, label: "Moderate" },
  { value: 7, label: "Moderately high" },
  { value: 8, label: "High" },
  { value: 9, label: "Very high" },
  { value: 10, label: "Almost certain" },
];

// ── Detection Scale ─────────────────────────────────────────

export const DETECTION_SCALE = [
  { value: 1, label: "Almost certain" },
  { value: 2, label: "Very high" },
  { value: 3, label: "High" },
  { value: 4, label: "Moderately high" },
  { value: 5, label: "Moderate" },
  { value: 6, label: "Low" },
  { value: 7, label: "Very low" },
  { value: 8, label: "Remote" },
  { value: 9, label: "Very remote" },
  { value: 10, label: "Almost impossible" },
];
