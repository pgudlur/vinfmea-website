"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { useProjects } from "@/stores/useProjects";
import { useUI } from "@/stores/useUI";
import { dfmea, pfmea } from "@/lib/api";

type ImportStep = "upload" | "mapping" | "preview" | "result";
type FmeaType = "dfmea" | "pfmea";

interface ParsedRow {
  [key: string]: string;
}

const DFMEA_COLUMNS = [
  { key: "step_id", label: "Step ID", required: true },
  { key: "function_requirement", label: "Function / Requirement", required: true },
  { key: "failure_mode", label: "Failure Mode", required: true },
  { key: "failure_effect", label: "Failure Effect", required: false },
  { key: "severity", label: "Severity (S)", required: true },
  { key: "failure_cause", label: "Failure Cause", required: false },
  { key: "occurrence", label: "Occurrence (O)", required: true },
  { key: "current_control_prevention", label: "Prevention Controls", required: false },
  { key: "current_control_detection", label: "Detection Controls", required: false },
  { key: "detection", label: "Detection (D)", required: true },
  { key: "recommended_action", label: "Recommended Action", required: false },
  { key: "responsibility", label: "Responsibility", required: false },
  { key: "target_date", label: "Target Date", required: false },
  { key: "status", label: "Status", required: false },
];

const PFMEA_COLUMNS = [
  { key: "step_id", label: "Step ID", required: true },
  { key: "process_step", label: "Process Step", required: true },
  { key: "failure_mode", label: "Failure Mode", required: true },
  { key: "failure_effect", label: "Failure Effect", required: false },
  { key: "severity", label: "Severity (S)", required: true },
  { key: "failure_cause", label: "Failure Cause", required: false },
  { key: "occurrence", label: "Occurrence (O)", required: true },
  { key: "current_control_prevention", label: "Prevention Controls", required: false },
  { key: "current_control_detection", label: "Detection Controls", required: false },
  { key: "detection", label: "Detection (D)", required: true },
  { key: "recommended_action", label: "Recommended Action", required: false },
  { key: "responsibility", label: "Responsibility", required: false },
  { key: "target_date", label: "Target Date", required: false },
  { key: "status", label: "Status", required: false },
];

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

export default function ImportPage() {
  const { currentProject, parts } = useProjects();
  const addToast = useUI((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>("upload");
  const [fmeaType, setFmeaType] = useState<FmeaType>("dfmea");
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fileRows, setFileRows] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const targetColumns = fmeaType === "dfmea" ? DFMEA_COLUMNS : PFMEA_COLUMNS;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        addToast({
          type: "error",
          message: "Please upload a CSV file (.csv)",
        });
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const { headers, rows } = parseCSV(text);

        if (headers.length === 0 || rows.length === 0) {
          addToast({ type: "error", message: "File appears empty or invalid" });
          return;
        }

        setFileHeaders(headers);
        setFileRows(rows);

        // Auto-map columns by fuzzy matching
        const mapping: Record<string, string> = {};
        targetColumns.forEach((tc) => {
          const match = headers.find(
            (h) =>
              h.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                tc.key.toLowerCase().replace(/[^a-z0-9]/g, "") ||
              h.toLowerCase().includes(tc.label.toLowerCase()) ||
              tc.label.toLowerCase().includes(h.toLowerCase())
          );
          if (match) mapping[tc.key] = match;
        });
        setColumnMapping(mapping);

        setStep("mapping");
      };
      reader.readAsText(file);
    },
    [addToast, targetColumns]
  );

  const handleImport = async () => {
    if (!currentProject) {
      addToast({ type: "error", message: "Please select a project first" });
      return;
    }

    setImporting(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      for (let i = 0; i < fileRows.length; i++) {
        const row = fileRows[i];
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const entry: any = {
            project_id: currentProject.id,
            part_id: selectedPartId || undefined,
          };

          // Map columns
          targetColumns.forEach((tc) => {
            const sourceCol = columnMapping[tc.key];
            if (sourceCol && row[sourceCol]) {
              const val = row[sourceCol];
              if (["severity", "occurrence", "detection"].includes(tc.key)) {
                entry[tc.key] = Math.min(10, Math.max(1, parseInt(val) || 1));
              } else {
                entry[tc.key] = val;
              }
            }
          });

          // Ensure required fields
          if (!entry.step_id) entry.step_id = `${fmeaType === "dfmea" ? "D" : "P"}-${String(i + 1).padStart(3, "0")}`;
          if (!entry.failure_mode) entry.failure_mode = "—";
          if (fmeaType === "dfmea" && !entry.function_requirement) entry.function_requirement = "—";
          if (fmeaType === "pfmea" && !entry.process_step) entry.process_step = "—";
          entry.severity = entry.severity || 1;
          entry.occurrence = entry.occurrence || 1;
          entry.detection = entry.detection || 1;

          if (fmeaType === "dfmea") {
            await dfmea.create(entry);
          } else {
            await pfmea.create(entry);
          }
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    } finally {
      setImporting(false);
      setImportResults(results);
      setStep("result");

      if (results.success > 0) {
        addToast({
          type: "success",
          message: `Imported ${results.success} entries`,
        });
      }
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFileName("");
    setFileHeaders([]);
    setFileRows([]);
    setColumnMapping({});
    setImportResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
        <p className="text-sm text-gray-500">
          Import DFMEA or PFMEA data from a CSV file.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {(["upload", "mapping", "preview", "result"] as ImportStep[]).map(
          (s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === s
                    ? "bg-blue-600 text-white"
                    : idx <
                        ["upload", "mapping", "preview", "result"].indexOf(step)
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {idx <
                ["upload", "mapping", "preview", "result"].indexOf(step) ? (
                  <CheckCircle2 size={14} />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-sm ${step === s ? "font-medium text-gray-900" : "text-gray-400"}`}
              >
                {s === "upload"
                  ? "Upload"
                  : s === "mapping"
                    ? "Map Columns"
                    : s === "preview"
                      ? "Preview"
                      : "Results"}
              </span>
              {idx < 3 && (
                <ArrowRight size={14} className="mx-1 text-gray-300" />
              )}
            </div>
          )
        )}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                FMEA Type
              </label>
              <select
                value={fmeaType}
                onChange={(e) => setFmeaType(e.target.value as FmeaType)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="dfmea">DFMEA (Design)</option>
                <option value="pfmea">PFMEA (Process)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Target Part (optional)
              </label>
              <select
                value={selectedPartId ?? ""}
                onChange={(e) =>
                  setSelectedPartId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Project-level (no specific part)</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.part_number ? ` (${p.part_number})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center transition hover:border-blue-400 hover:bg-blue-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className="mx-auto text-gray-400" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              Click to upload a CSV file
            </p>
            <p className="mt-1 text-xs text-gray-400">
              CSV files with headers in the first row
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <FileSpreadsheet
                size={16}
                className="mt-0.5 text-blue-600"
              />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Expected CSV format</p>
                <p className="mt-1">
                  Headers should include: Step ID, Failure Mode, Severity,
                  Occurrence, Detection, and other FMEA fields. The importer
                  will auto-map matching column names.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Column Mapping */}
      {step === "mapping" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Map Columns
              </h3>
              <p className="text-sm text-gray-500">
                {fileName} — {fileRows.length} rows detected
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={14} /> Start Over
            </button>
          </div>

          <div className="space-y-2">
            {targetColumns.map((tc) => (
              <div
                key={tc.key}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2"
              >
                <span
                  className={`w-44 text-sm ${tc.required ? "font-medium text-gray-900" : "text-gray-600"}`}
                >
                  {tc.label}
                  {tc.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
                <ArrowRight size={14} className="text-gray-300" />
                <select
                  value={columnMapping[tc.key] || ""}
                  onChange={(e) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      [tc.key]: e.target.value,
                    }))
                  }
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm ${
                    columnMapping[tc.key]
                      ? "border-green-300 bg-green-50"
                      : tc.required
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                  }`}
                >
                  <option value="">— Not mapped —</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => setStep("preview")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Preview <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Preview ({Math.min(fileRows.length, 5)} of {fileRows.length} rows)
          </h3>

          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left font-medium text-gray-500">
                    #
                  </th>
                  {targetColumns
                    .filter((tc) => columnMapping[tc.key])
                    .map((tc) => (
                      <th
                        key={tc.key}
                        className="border-b border-r border-gray-200 px-2 py-1.5 text-left font-medium text-gray-500"
                      >
                        {tc.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {fileRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="border-r border-gray-200 px-2 py-1 text-gray-400">
                      {idx + 1}
                    </td>
                    {targetColumns
                      .filter((tc) => columnMapping[tc.key])
                      .map((tc) => (
                        <td
                          key={tc.key}
                          className="border-r border-gray-200 px-2 py-1"
                        >
                          {row[columnMapping[tc.key]] || "—"}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep("mapping")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <Download size={14} /> Import {fileRows.length} Rows
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === "result" && importResults && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            {importResults.failed === 0 ? (
              <CheckCircle2 size={32} className="text-green-500" />
            ) : (
              <AlertCircle size={32} className="text-amber-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Import Complete
              </h3>
              <p className="text-sm text-gray-500">
                {importResults.success} succeeded, {importResults.failed} failed
              </p>
            </div>
          </div>

          {importResults.errors.length > 0 && (
            <div className="mb-4 max-h-40 overflow-auto rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-1 text-xs font-medium text-red-700">Errors:</p>
              {importResults.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600">
                  {err}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
