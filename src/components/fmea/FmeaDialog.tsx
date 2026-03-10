"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { X, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
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
  // AIAG-VDA Action Priority logic table — exact port from desktop constants.py
  s = Math.max(1, Math.min(10, Math.floor(s || 1)));
  o = Math.max(1, Math.min(10, Math.floor(o || 1)));
  d = Math.max(1, Math.min(10, Math.floor(d || 1)));

  // Safety-critical: S >= 9 always requires attention
  if (s >= 9) {
    if (o >= 4 || d >= 4) return "H";
    if (o >= 2 && d >= 2) return "H";
    return "M";
  }

  // High severity: S >= 7
  if (s >= 7) {
    if (o >= 5 && d >= 5) return "H";
    if (o >= 4 && d >= 3) return "H";
    if (o >= 7) return "H";
    if (o >= 3 || d >= 3) return "M";
    return "L";
  }

  // Moderate severity: S >= 5
  if (s >= 5) {
    if (o >= 7 && d >= 7) return "H";
    if (o >= 8) return "H";
    if (o >= 4 || d >= 5) return "M";
    return "L";
  }

  // Low severity: S >= 3
  if (s >= 3) {
    if (o >= 8 && d >= 7) return "H";
    if (o >= 5 || d >= 6) return "M";
    return "L";
  }

  // Very low severity: S 1-2
  return "L";
}

function calcCriticality(rpn: number): string {
  // RPN-based criticality — exact match with desktop constants.py get_criticality()
  if (rpn <= 50) return "Low";
  if (rpn <= 100) return "Medium";
  if (rpn <= 200) return "High";
  return "Critical";
}

function calcCTQ(s: number, o: number): string {
  // CTQ status for PFMEA — exact match with desktop constants.py get_ctq_status()
  if (s <= 0 || o <= 0) return "";
  const soValue = s * o;
  if (soValue >= 36) return "CTQ";
  if (soValue >= 16) return "Consider CTQ";
  return "No CTQ";
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
  tooltip,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  tooltip?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {tooltip && (
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-[8px] font-bold text-gray-500 cursor-help shrink-0"
            title={tooltip}
          >
            ?
          </span>
        )}
      </span>
      {children}
      {error && <span className="mt-0.5 block text-[11px] text-red-500">{error}</span>}
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

  // Default values for new entries — ensures server receives proper integers
  const getDefaults = () => {
    if (entry) return entry as Record<string, unknown>;
    if (isControlPlan) {
      return { step_id: "", process_step: "", special_char_class: "" };
    }
    return {
      step_id: "",
      severity: 1,
      occurrence: 1,
      detection: 1,
      failure_mode: "",
      failure_effect: "",
      failure_cause: "",
      action_status: "",
    };
  };

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: getDefaults(),
  });

  // Reset form when entry changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(getDefaults());
    }
  }, [open, entry, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch S, O, D for real-time RPN calculation (for non-control-plan types)
  const severity = Number(watch("severity") || 1);
  const occurrence = Number(watch("occurrence") || 1);
  const detection = Number(watch("detection") || 1);
  const newSeverity = Number(watch("new_severity") || 0);
  const newOccurrence = Number(watch("new_occurrence") || 0);
  const newDetection = Number(watch("new_detection") || 0);

  const rpn = useMemo(() => severity * occurrence * detection, [severity, occurrence, detection]);
  const ap = useMemo(() => calcAP(severity, occurrence, detection), [severity, occurrence, detection]);
  const crit = useMemo(() => calcCriticality(rpn), [rpn]);
  const initCtq = useMemo(() => calcCTQ(severity, occurrence), [severity, occurrence]);
  const revCtq = useMemo(
    () => (newSeverity > 0 && newOccurrence > 0 ? calcCTQ(newSeverity, newOccurrence) : ""),
    [newSeverity, newOccurrence]
  );
  const newRpn = useMemo(() => newSeverity * newOccurrence * newDetection, [newSeverity, newOccurrence, newDetection]);
  const newAp = useMemo(
    () => (newSeverity && newOccurrence && newDetection ? calcAP(newSeverity, newOccurrence, newDetection) : ""),
    [newSeverity, newOccurrence, newDetection]
  );

  const isPfmea = fmeaType === "pfmea";

  const onSubmit = (data: Record<string, unknown>) => {
    if (!isControlPlan) {
      // Ensure all numeric fields are sent as proper integers
      data.severity = Number(data.severity) || 1;
      data.occurrence = Number(data.occurrence) || 1;
      data.detection = Number(data.detection) || 1;
      if (data.new_severity) data.new_severity = Number(data.new_severity);
      else data.new_severity = 0;
      if (data.new_occurrence) data.new_occurrence = Number(data.new_occurrence);
      else data.new_occurrence = 0;
      if (data.new_detection) data.new_detection = Number(data.new_detection);
      else data.new_detection = 0;

      // Computed fields
      const s = data.severity as number;
      const o = data.occurrence as number;
      const d = data.detection as number;
      data.rpn = s * o * d;
      data.action_priority = calcAP(s, o, d);
      data.criticality = calcCriticality(s * o * d);

      const ns = data.new_severity as number;
      const no_ = data.new_occurrence as number;
      const nd = data.new_detection as number;
      if (ns && no_ && nd) {
        data.new_rpn = ns * no_ * nd;
        data.new_action_priority = calcAP(ns, no_, nd);
      } else {
        data.new_rpn = 0;
        data.new_action_priority = "";
      }

      // CTQ fields for PFMEA
      if (isPfmea) {
        data.init_ctq = calcCTQ(s, o);
        data.rev_ctq = (ns > 0 && no_ > 0) ? calcCTQ(ns, no_) : "";
      }

      // Remove empty strings for optional fields to avoid server validation errors
      Object.keys(data).forEach((key) => {
        if (data[key] === "") delete data[key];
      });
      // But step_id is always required
      if (!data.step_id) data.step_id = "";
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
                  <FormField label="Step ID" required tooltip="Unique identifier for the control plan step. Use CP-001 format for traceability." error={errors.step_id ? "Step ID is required" : undefined}>
                    <input
                      {...register("step_id", { required: true })}
                      className={`${inputClass} ${errors.step_id ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="CP-001"
                    />
                  </FormField>
                  <FormField label="Process Step" tooltip="Name of the manufacturing or assembly process step">
                    <input {...register("process_step")} className={inputClass} placeholder="e.g. Final Assembly" />
                  </FormField>
                  <FormField label="Machine/Device" tooltip="Machine, tool, or device used for this process step">
                    <input {...register("machine_device")} className={inputClass} placeholder="e.g. Torque wrench, CNC mill" />
                  </FormField>
                  <FormField label="Characteristic Number" tooltip="Reference number linking to the engineering drawing">
                    <input {...register("characteristic_number")} className={inputClass} placeholder="e.g. 1.1, 2.3" />
                  </FormField>
                </Section>

                <Section title="Characteristics">
                  <FormField label="Product Characteristic" tooltip="Measurable product feature or property (dimension, weight, hardness, etc.)">
                    <input {...register("product_characteristic")} className={inputClass} placeholder="e.g. Bolt torque, Surface roughness" />
                  </FormField>
                  <FormField label="Process Characteristic" tooltip="Process parameter that affects the product characteristic">
                    <input {...register("process_characteristic")} className={inputClass} placeholder="e.g. Clamping force, Temperature" />
                  </FormField>
                  <FormField label="Special Char Class" tooltip="Classification: CC/S=Critical, SC/R=Significant, HI=High Impact, F/A=Fit/Appearance">
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
                  <FormField label="Specification/Tolerance" tooltip="Engineering specification or tolerance range for the characteristic">
                    <input {...register("specification_tolerance")} className={inputClass} placeholder="e.g. 25 ± 2 Nm, Ra 0.8 µm" />
                  </FormField>
                  <FormField label="Evaluation/Measurement" tooltip="Measurement technique, gauge, or equipment used for inspection">
                    <input {...register("evaluation_measurement")} className={inputClass} placeholder="e.g. Digital torque analyzer, CMM" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Sample Size" tooltip="Number of samples to inspect per check">
                      <input {...register("sample_size")} className={inputClass} placeholder="e.g. 5, 100%" />
                    </FormField>
                    <FormField label="Sample Frequency" tooltip="How often the inspection is performed">
                      <input {...register("sample_frequency")} className={inputClass} placeholder="e.g. Every hour, per batch" />
                    </FormField>
                  </div>
                  <FormField label="Control Method" tooltip="How the characteristic is controlled (SPC, visual, automated check, etc.)">
                    <textarea {...register("control_method")} className={textareaClass} rows={2} placeholder="e.g. X-bar R chart, 100% automated inspection" />
                  </FormField>
                  <FormField label="Reaction Plan" tooltip="Steps to take when a measurement is out of specification">
                    <textarea {...register("reaction_plan")} className={textareaClass} rows={2} placeholder="e.g. Stop line, quarantine lot, notify quality engineer" />
                  </FormField>
                </Section>

                <Section title="Responsibility & Notes">
                  <FormField label="Responsible" tooltip="Person or team responsible for this control plan step">
                    <input {...register("responsible")} className={inputClass} placeholder="e.g. Quality Inspector" />
                  </FormField>
                  <FormField label="Notes" tooltip="Additional comments or references">
                    <textarea {...register("notes")} className={textareaClass} rows={3} placeholder="Any additional notes..." />
                  </FormField>
                </Section>
              </>
            ) : (
              /* ── DFMEA / PFMEA / SFMEA Form ────────────── */
              <>
                <Section title="Identification">
                  <FormField label="Step ID" required tooltip={`Unique identifier. Use ${isDfmea ? "D-001" : isSfmea ? "S-001" : "P-001"} format for traceability linking.`} error={errors.step_id ? "Step ID is required" : undefined}>
                    <input
                      {...register("step_id", { required: true })}
                      className={`${inputClass} ${errors.step_id ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder={
                        isDfmea ? "D-001" : isSfmea ? "S-001" : "P-001"
                      }
                    />
                  </FormField>

                  {/* Type-specific primary fields */}
                  {isDfmea && (
                    <>
                      <FormField label="Part Name" tooltip="Name of the part or component being analyzed">
                        <input {...register("part_name")} className={inputClass} placeholder="e.g. ABS ECU" />
                      </FormField>
                      <FormField label="Function" tooltip="Primary function of the part in the design">
                        <input {...register("function")} className={inputClass} placeholder="e.g. Controls ABS braking" />
                      </FormField>
                    </>
                  )}
                  {fmeaType === "pfmea" && (
                    <>
                      <FormField label="Process Step" tooltip="Manufacturing or assembly process step being analyzed">
                        <input {...register("process_step")} className={inputClass} placeholder="e.g. PCB Soldering" />
                      </FormField>
                      <FormField label="Process Function" tooltip="What this process step is intended to accomplish">
                        <input {...register("process_function")} className={inputClass} placeholder="e.g. Solder components to PCB" />
                      </FormField>
                    </>
                  )}
                  {isSfmea && (
                    <>
                      <FormField label="System Element" tooltip="System or subsystem being analyzed at the system level">
                        <input {...register("system_element")} className={inputClass} placeholder="e.g. Braking System" />
                      </FormField>
                      <FormField label="System Function" tooltip="Primary function of the system element">
                        <input {...register("system_function")} className={inputClass} placeholder="e.g. Provide vehicle deceleration" />
                      </FormField>
                      <FormField label="System Requirement" tooltip="Performance requirement for the system function">
                        <input {...register("system_requirement")} className={inputClass} placeholder="e.g. Stop within 40m at 100km/h" />
                      </FormField>
                      <FormField label="Focus Element" tooltip="Specific element within the system being focused on">
                        <input {...register("focus_element")} className={inputClass} placeholder="e.g. Electronic stability control" />
                      </FormField>
                    </>
                  )}
                </Section>

                <Section title="Failure Analysis">
                  <FormField label="Failure Mode" tooltip="How the function could potentially fail">
                    <input {...register("failure_mode")} className={inputClass} placeholder="e.g. No output signal" />
                  </FormField>
                  <FormField label="Failure Effect" tooltip="What happens to the customer/system when this failure occurs">
                    <textarea {...register("failure_effect")} className={textareaClass} rows={2} placeholder="e.g. Loss of braking assist, increased stopping distance" />
                  </FormField>
                  <FormField label="Failure Cause" tooltip="Root cause or mechanism that leads to the failure mode">
                    <textarea {...register("failure_cause")} className={textareaClass} rows={2} placeholder="e.g. Solder joint fatigue due to thermal cycling" />
                  </FormField>
                </Section>

                <Section title="Current Controls">
                  <FormField label="Prevention Controls" tooltip="Controls currently in place to prevent the failure cause">
                    <textarea
                      {...register("current_prevention_controls")}
                      className={textareaClass}
                      rows={2}
                      placeholder="e.g. Design review, DFSS methodology"
                    />
                  </FormField>
                  <FormField label="Detection Controls" tooltip="Controls to detect the failure before it reaches the customer">
                    <textarea
                      {...register("current_detection_controls")}
                      className={textareaClass}
                      rows={2}
                      placeholder="e.g. End-of-line functional test, visual inspection"
                    />
                  </FormField>
                </Section>

                <Section title="Risk Assessment">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Severity (S)" tooltip="Rate the severity of the failure effect on the customer (1=No effect, 10=Hazardous)">
                      {ratingSelect("severity", SEVERITY_SCALE)}
                    </FormField>
                    <FormField label="Occurrence (O)" tooltip="Rate the likelihood of the failure cause occurring (1=Remote, 10=Very high)">
                      {ratingSelect("occurrence", OCCURRENCE_SCALE)}
                    </FormField>
                    <FormField label="Detection (D)" tooltip="Rate the ability of current controls to detect the failure (1=Almost certain, 10=Cannot detect)">
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
                    <FormField label="ASIL Rating" tooltip="Automotive Safety Integrity Level per ISO 26262 (QM, A, B, C, D)">
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

                {/* SFMEA / DFMEA Safety Section */}
                {(isSfmea || isDfmea) && (
                  <Section title="Safety (ISO 26262)">
                    <FormField label="Safety Goal" tooltip="Top-level safety requirement to prevent or mitigate the hazardous event">
                      <textarea {...register("safety_goal")} className={textareaClass} rows={2} placeholder="e.g. Prevent unintended acceleration" />
                    </FormField>
                    <FormField label="Safety Mechanism" tooltip="Technical solution to achieve the safety goal (hardware/software)">
                      <textarea {...register("safety_mechanism")} className={textareaClass} rows={2} placeholder="e.g. Redundant sensor monitoring with plausibility check" />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="FTTI" tooltip="Fault Tolerant Time Interval — max time before a fault must be detected">
                        <select {...register("ftti")} className={selectClass}>
                          {FTTI_PRESETS.map((f) => (
                            <option key={f} value={f}>
                              {f || "-- None --"}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Diagnostic Coverage" tooltip="Percentage of faults detectable by diagnostic tests (Low/Medium/High)">
                        <select {...register("diagnostic_coverage")} className={selectClass}>
                          {DIAGNOSTIC_COVERAGE_LEVELS.map((d) => (
                            <option key={d} value={d}>
                              {d || "-- None --"}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Safe State" tooltip="System state achieved when the safety mechanism activates">
                      <input {...register("safe_state")} className={inputClass} placeholder="e.g. Engine shutdown, limp-home mode" />
                    </FormField>
                  </Section>
                )}

                <Section title="Actions">
                  <FormField label="Recommended Action" tooltip="Specific action to reduce or eliminate the risk. Focus on reducing Severity, Occurrence, or Detection.">
                    <textarea
                      {...register("recommended_action")}
                      className={textareaClass}
                      rows={2}
                      placeholder="e.g. Add redundant sensor, implement design verification test"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Responsibility" tooltip="Person or team responsible for completing the action">
                      <input {...register("responsibility")} className={inputClass} placeholder="e.g. Design Engineer" />
                    </FormField>
                    <FormField label="Target Date" tooltip="Planned completion date for the recommended action">
                      <input
                        type="date"
                        {...register("target_date")}
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                  <FormField label="Action Status" tooltip="Current status of the recommended action">
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
                  <FormField label="Action Taken" tooltip="Describe the actual action taken and its effectiveness">
                    <textarea {...register("action_taken")} className={textareaClass} rows={2} placeholder="e.g. Added redundant pressure sensor, validated in DVP&R" />
                  </FormField>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="New S" tooltip="Revised Severity after action is implemented">
                      {ratingSelect("new_severity", SEVERITY_SCALE, true)}
                    </FormField>
                    <FormField label="New O" tooltip="Revised Occurrence after action is implemented">
                      {ratingSelect("new_occurrence", OCCURRENCE_SCALE, true)}
                    </FormField>
                    <FormField label="New D" tooltip="Revised Detection after action is implemented">
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
                  <FormField label="Notes" tooltip="Additional comments, references, or observations">
                    <textarea {...register("notes")} className={textareaClass} rows={3} placeholder="Any additional notes or references..." />
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
