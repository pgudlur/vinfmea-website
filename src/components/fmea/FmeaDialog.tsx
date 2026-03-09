"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { FmeaType } from "@/lib/types";
import {
  FMEA_TYPE_CONFIG,
  ACTION_STATUSES,
  ASIL_OPTIONS,
  SEVERITY_SCALE,
  OCCURRENCE_SCALE,
  DETECTION_SCALE,
  DIAGNOSTIC_COVERAGE_LEVELS,
  FTTI_PRESETS,
  SPECIAL_CHAR_CLASSES,
} from "@/lib/constants";
import RatingCell from "./RatingCell";
import ApBadge from "./ApBadge";
import CriticalityBadge from "./CriticalityBadge";

// ── Types ──────────────────────────────────────────────────

interface FmeaDialogProps {
  open: boolean;
  fmeaType: FmeaType;
  entry?: Record<string, unknown> | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}

// ── Calculation helpers ────────────────────────────────────

function calcAP(s: number, o: number, d: number): string {
  const rpn = s * o * d;
  if (s >= 9 || (s >= 7 && o >= 4 && d >= 4) || rpn >= 200) return "H";
  if (rpn >= 80 || (s >= 5 && o >= 4)) return "M";
  return "L";
}

function calcCriticality(s: number, o: number): string {
  const product = s * o;
  if (product >= 36) return "Critical";
  if (product >= 25) return "High";
  if (product >= 16) return "Medium";
  return "Low";
}

// ── Collapsible Section ────────────────────────────────────

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-5 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        {title}
      </button>
      {open && <div className="px-5 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ── Field helpers ──────────────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors";

const selectClass = `${inputClass} appearance-none`;

const textareaClass = `${inputClass} resize-none`;

// ── Main Dialog Component ─────────────────────────────────

export default function FmeaDialog({
  open,
  fmeaType,
  entry,
  onClose,
  onSave,
}: FmeaDialogProps) {
  const isEditing = !!entry;
  const typeConfig = FMEA_TYPE_CONFIG[fmeaType];
  const isControlPlan = fmeaType === "control-plan";
  const isSfmea = fmeaType === "sfmea";
  const isDfmea = fmeaType === "dfmea";

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: (entry as Record<string, unknown>) || {},
  });

  // Reset form when entry changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(entry || {});
    }
  }, [open, entry, reset]);

  // Watch S, O, D for real-time RPN calculation (for non-control-plan types)
  const severity = Number(watch("severity") || 1);
  const occurrence = Number(watch("occurrence") || 1);
  const detection = Number(watch("detection") || 1);
  const newSeverity = Number(watch("new_severity") || 0);
  const newOccurrence = Number(watch("new_occurrence") || 0);
  const newDetection = Number(watch("new_detection") || 0);

  const rpn = useMemo(() => severity * occurrence * detection, [severity, occurrence, detection]);
  const ap = useMemo(() => calcAP(severity, occurrence, detection), [severity, occurrence, detection]);
  const crit = useMemo(() => calcCriticality(severity, occurrence), [severity, occurrence]);
  const newRpn = useMemo(() => newSeverity * newOccurrence * newDetection, [newSeverity, newOccurrence, newDetection]);
  const newAp = useMemo(
    () => (newSeverity && newOccurrence && newDetection ? calcAP(newSeverity, newOccurrence, newDetection) : ""),
    [newSeverity, newOccurrence, newDetection]
  );

  const onSubmit = (data: Record<string, unknown>) => {
    if (!isControlPlan) {
      data.severity = Number(data.severity) || 1;
      data.occurrence = Number(data.occurrence) || 1;
      data.detection = Number(data.detection) || 1;
      if (data.new_severity) data.new_severity = Number(data.new_severity);
      if (data.new_occurrence) data.new_occurrence = Number(data.new_occurrence);
      if (data.new_detection) data.new_detection = Number(data.new_detection);
    }
    onSave(data);
  };

  if (!open) return null;

  // ── Rating select options ────────────────────────────────
  const ratingSelect = (
    fieldName: string,
    scale: { value: number; label: string }[],
    isOptional = false
  ) => (
    <select {...register(fieldName)} className={selectClass}>
      {isOptional && <option value="">--</option>}
      {scale.map((s) => (
        <option key={s.value} value={s.value}>
          {s.value} - {s.label}
        </option>
      ))}
    </select>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold text-white ${typeConfig.color}`}
            >
              {typeConfig.short}
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? "Edit" : "Add"} {typeConfig.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto">
            {isControlPlan ? (
              /* ── Control Plan Form ──────────────────────── */
              <>
                <Section title="Identification">
                  <FormField label="Step ID" required>
                    <input
                      {...register("step_id", { required: true })}
                      className={inputClass}
                      placeholder="CP-001"
                    />
                    {errors.step_id && (
                      <span className="mt-1 text-xs text-red-500">Step ID is required</span>
                    )}
                  </FormField>
                  <FormField label="Process Step">
                    <input {...register("process_step")} className={inputClass} />
                  </FormField>
                  <FormField label="Machine/Device">
                    <input {...register("machine_device")} className={inputClass} />
                  </FormField>
                  <FormField label="Characteristic Number">
                    <input {...register("characteristic_number")} className={inputClass} />
                  </FormField>
                </Section>

                <Section title="Characteristics">
                  <FormField label="Product Characteristic">
                    <input {...register("product_characteristic")} className={inputClass} />
                  </FormField>
                  <FormField label="Process Characteristic">
                    <input {...register("process_characteristic")} className={inputClass} />
                  </FormField>
                  <FormField label="Special Char Class">
                    <select {...register("special_char_class")} className={selectClass}>
                      {SPECIAL_CHAR_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c || "-- None --"}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </Section>

                <Section title="Specifications & Control">
                  <FormField label="Specification/Tolerance">
                    <input {...register("specification_tolerance")} className={inputClass} />
                  </FormField>
                  <FormField label="Evaluation/Measurement">
                    <input {...register("evaluation_measurement")} className={inputClass} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Sample Size">
                      <input {...register("sample_size")} className={inputClass} />
                    </FormField>
                    <FormField label="Sample Frequency">
                      <input {...register("sample_frequency")} className={inputClass} />
                    </FormField>
                  </div>
                  <FormField label="Control Method">
                    <textarea {...register("control_method")} className={textareaClass} rows={2} />
                  </FormField>
                  <FormField label="Reaction Plan">
                    <textarea {...register("reaction_plan")} className={textareaClass} rows={2} />
                  </FormField>
                </Section>

                <Section title="Responsibility & Notes">
                  <FormField label="Responsible">
                    <input {...register("responsible")} className={inputClass} />
                  </FormField>
                  <FormField label="Notes">
                    <textarea {...register("notes")} className={textareaClass} rows={3} />
                  </FormField>
                </Section>
              </>
            ) : (
              /* ── DFMEA / PFMEA / SFMEA Form ────────────── */
              <>
                <Section title="Identification">
                  <FormField label="Step ID" required>
                    <input
                      {...register("step_id", { required: true })}
                      className={inputClass}
                      placeholder={
                        isDfmea ? "D-001" : isSfmea ? "S-001" : "P-001"
                      }
                    />
                    {errors.step_id && (
                      <span className="mt-1 text-xs text-red-500">Step ID is required</span>
                    )}
                  </FormField>

                  {/* Type-specific primary fields */}
                  {isDfmea && (
                    <>
                      <FormField label="Part Name">
                        <input {...register("part_name")} className={inputClass} />
                      </FormField>
                      <FormField label="Function">
                        <input {...register("function")} className={inputClass} />
                      </FormField>
                    </>
                  )}
                  {fmeaType === "pfmea" && (
                    <>
                      <FormField label="Process Step">
                        <input {...register("process_step")} className={inputClass} />
                      </FormField>
                      <FormField label="Process Function">
                        <input {...register("process_function")} className={inputClass} />
                      </FormField>
                    </>
                  )}
                  {isSfmea && (
                    <>
                      <FormField label="System Element">
                        <input {...register("system_element")} className={inputClass} />
                      </FormField>
                      <FormField label="System Function">
                        <input {...register("system_function")} className={inputClass} />
                      </FormField>
                      <FormField label="System Requirement">
                        <input {...register("system_requirement")} className={inputClass} />
                      </FormField>
                      <FormField label="Focus Element">
                        <input {...register("focus_element")} className={inputClass} />
                      </FormField>
                    </>
                  )}
                </Section>

                <Section title="Failure Analysis">
                  <FormField label="Failure Mode">
                    <input {...register("failure_mode")} className={inputClass} />
                  </FormField>
                  <FormField label="Failure Effect">
                    <textarea {...register("failure_effect")} className={textareaClass} rows={2} />
                  </FormField>
                  <FormField label="Failure Cause">
                    <textarea {...register("failure_cause")} className={textareaClass} rows={2} />
                  </FormField>
                </Section>

                <Section title="Current Controls">
                  <FormField label="Prevention Controls">
                    <textarea
                      {...register("current_prevention_controls")}
                      className={textareaClass}
                      rows={2}
                    />
                  </FormField>
                  <FormField label="Detection Controls">
                    <textarea
                      {...register("current_detection_controls")}
                      className={textareaClass}
                      rows={2}
                    />
                  </FormField>
                </Section>

                <Section title="Risk Assessment">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Severity (S)">
                      {ratingSelect("severity", SEVERITY_SCALE)}
                    </FormField>
                    <FormField label="Occurrence (O)">
                      {ratingSelect("occurrence", OCCURRENCE_SCALE)}
                    </FormField>
                    <FormField label="Detection (D)">
                      {ratingSelect("detection", DETECTION_SCALE)}
                    </FormField>
                  </div>

                  {/* Read-only calculated fields */}
                  <div className="mt-2 flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3">
                    <div className="text-center">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        RPN
                      </span>
                      <RatingCell value={Math.min(rpn, 10)} />
                      <span className="block text-sm font-bold text-gray-900 mt-0.5">
                        {rpn}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                        AP
                      </span>
                      <ApBadge value={ap} />
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                        Criticality
                      </span>
                      <CriticalityBadge value={crit} />
                    </div>
                  </div>

                  {/* ASIL for DFMEA and SFMEA */}
                  {(isDfmea || isSfmea) && (
                    <FormField label="ASIL Rating">
                      <select {...register("asil_rating")} className={selectClass}>
                        {ASIL_OPTIONS.map((a) => (
                          <option key={a} value={a}>
                            {a || "-- None --"}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  )}
                </Section>

                {/* SFMEA Safety Section */}
                {isSfmea && (
                  <Section title="Safety (ISO 26262)">
                    <FormField label="Safety Goal">
                      <textarea {...register("safety_goal")} className={textareaClass} rows={2} />
                    </FormField>
                    <FormField label="Safety Mechanism">
                      <textarea {...register("safety_mechanism")} className={textareaClass} rows={2} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="FTTI">
                        <select {...register("ftti")} className={selectClass}>
                          {FTTI_PRESETS.map((f) => (
                            <option key={f} value={f}>
                              {f || "-- None --"}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Diagnostic Coverage">
                        <select {...register("diagnostic_coverage")} className={selectClass}>
                          {DIAGNOSTIC_COVERAGE_LEVELS.map((d) => (
                            <option key={d} value={d}>
                              {d || "-- None --"}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Safe State">
                      <input {...register("safe_state")} className={inputClass} />
                    </FormField>
                  </Section>
                )}

                <Section title="Actions">
                  <FormField label="Recommended Action">
                    <textarea
                      {...register("recommended_action")}
                      className={textareaClass}
                      rows={2}
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Responsibility">
                      <input {...register("responsibility")} className={inputClass} />
                    </FormField>
                    <FormField label="Target Date">
                      <input
                        type="date"
                        {...register("target_date")}
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                  <FormField label="Action Status">
                    <select {...register("action_status")} className={selectClass}>
                      <option value="">-- Select --</option>
                      {ACTION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </Section>

                <Section title="Revised Assessment" defaultOpen={false}>
                  <FormField label="Action Taken">
                    <textarea {...register("action_taken")} className={textareaClass} rows={2} />
                  </FormField>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="New S">
                      {ratingSelect("new_severity", SEVERITY_SCALE, true)}
                    </FormField>
                    <FormField label="New O">
                      {ratingSelect("new_occurrence", OCCURRENCE_SCALE, true)}
                    </FormField>
                    <FormField label="New D">
                      {ratingSelect("new_detection", DETECTION_SCALE, true)}
                    </FormField>
                  </div>

                  {newSeverity > 0 && newOccurrence > 0 && newDetection > 0 && (
                    <div className="mt-2 flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3">
                      <div className="text-center">
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                          New RPN
                        </span>
                        <span className="block text-sm font-bold text-gray-900 mt-0.5">
                          {newRpn}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                          New AP
                        </span>
                        <ApBadge value={newAp} />
                      </div>
                    </div>
                  )}
                </Section>

                <Section title="Notes" defaultOpen={false}>
                  <FormField label="Notes">
                    <textarea {...register("notes")} className={textareaClass} rows={3} />
                  </FormField>
                </Section>
              </>
            )}
          </div>

          {/* Sticky footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              {isEditing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
