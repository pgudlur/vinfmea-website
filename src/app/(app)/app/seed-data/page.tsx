"use client";

import { useState, useEffect } from "react";
import { sfmea, dfmea, pfmea, controlPlans, projects, parts } from "@/lib/api";
import { sync } from "@/lib/api";
import type { Project, Part, DfmeaEntry, PfmeaEntry, ControlPlanEntry, SfmeaEntry } from "@/lib/types";
import { Database, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

// ── SFMEA sample data for Brake Assembly project ─────────────
const BRAKE_SFMEA_DATA = [
  {
    step_id: "S-001",
    system_element: "Braking System",
    system_function: "Provide vehicle deceleration upon driver command",
    system_requirement: "Stop vehicle within 40m at 100km/h on dry road",
    focus_element: "Hydraulic brake circuit",
    failure_mode: "Complete loss of braking force",
    failure_effect: "Vehicle cannot decelerate, potential collision",
    failure_cause: "Hydraulic fluid leak in brake lines",
    severity: 10,
    occurrence: 3,
    detection: 4,
    current_prevention_controls: "Dual-circuit hydraulic system design",
    current_detection_controls: "Brake fluid level sensor with dashboard warning",
    asil_rating: "ASIL D",
    safety_goal: "Prevent total loss of braking capability",
    safety_mechanism: "Redundant hydraulic circuit with independent reservoirs",
    ftti: "< 100ms",
    safe_state: "Emergency brake activation via secondary circuit",
    diagnostic_coverage: "High (≥ 99%)",
    recommended_action: "Add pressure monitoring on both circuits",
    responsibility: "System Engineer",
    action_status: "In Progress",
  },
  {
    step_id: "S-002",
    system_element: "Anti-lock Braking System (ABS)",
    system_function: "Prevent wheel lock during emergency braking",
    system_requirement: "Maintain directional stability during panic stops",
    focus_element: "ABS ECU and wheel speed sensors",
    failure_mode: "ABS fails to modulate brake pressure",
    failure_effect: "Wheel lockup, loss of steering control, extended stopping distance",
    failure_cause: "ECU software fault or sensor signal loss",
    severity: 9,
    occurrence: 2,
    detection: 3,
    current_prevention_controls: "Software validation per ASPICE, redundant sensor signals",
    current_detection_controls: "ABS self-diagnostic check at startup",
    asil_rating: "ASIL C",
    safety_goal: "Maintain wheel rotation during braking",
    safety_mechanism: "Watchdog timer, sensor plausibility check",
    ftti: "< 50ms",
    safe_state: "Deactivate ABS, revert to conventional braking",
    diagnostic_coverage: "High (≥ 99%)",
    recommended_action: "Implement continuous sensor plausibility monitoring",
    responsibility: "Software Engineer",
    action_status: "Open",
  },
  {
    step_id: "S-003",
    system_element: "Electronic Stability Control (ESC)",
    system_function: "Maintain vehicle stability during dynamic maneuvers",
    system_requirement: "Correct yaw deviation within 500ms of detection",
    focus_element: "Yaw rate sensor and steering angle sensor",
    failure_mode: "Incorrect stability intervention",
    failure_effect: "Unexpected braking on individual wheels, vehicle pulls to one side",
    failure_cause: "Yaw rate sensor drift or calibration error",
    severity: 8,
    occurrence: 2,
    detection: 4,
    current_prevention_controls: "Sensor auto-calibration at startup",
    current_detection_controls: "Cross-check yaw rate vs. lateral acceleration",
    asil_rating: "ASIL B",
    safety_goal: "Prevent unintended vehicle dynamics intervention",
    safety_mechanism: "Multi-sensor fusion with plausibility validation",
    ftti: "< 200ms",
    safe_state: "Deactivate ESC, alert driver via dashboard warning",
    diagnostic_coverage: "Medium (≥ 90%)",
    recommended_action: "Add redundant yaw rate measurement",
    responsibility: "System Engineer",
    action_status: "Open",
  },
];

// ── SFMEA sample data for EV Battery project ──────────────────
const EV_BATTERY_SFMEA_DATA = [
  {
    step_id: "S-001",
    system_element: "Battery Management System (BMS)",
    system_function: "Monitor and control battery pack operation",
    system_requirement: "Maintain cell voltages within 2.5V-4.2V range",
    focus_element: "Cell voltage monitoring circuit",
    failure_mode: "Failure to detect cell over-voltage",
    failure_effect: "Thermal runaway, potential fire hazard",
    failure_cause: "Cell monitoring IC failure or wiring open circuit",
    severity: 10,
    occurrence: 2,
    detection: 3,
    current_prevention_controls: "Redundant cell monitoring ICs",
    current_detection_controls: "BMS continuous self-diagnostic with CRC check",
    asil_rating: "ASIL D",
    safety_goal: "Prevent battery cell over-voltage condition",
    safety_mechanism: "Hardware comparator with independent threshold detection",
    ftti: "< 100ms",
    safe_state: "Open main contactor, isolate battery pack",
    diagnostic_coverage: "High (≥ 99%)",
    recommended_action: "Add independent hardware over-voltage protection circuit",
    responsibility: "BMS Hardware Engineer",
    action_status: "In Progress",
  },
  {
    step_id: "S-002",
    system_element: "Thermal Management System",
    system_function: "Maintain battery temperature within safe operating range",
    system_requirement: "Keep cell temperature between -10°C and 45°C during operation",
    focus_element: "Coolant pump and temperature sensors",
    failure_mode: "Loss of cooling capability",
    failure_effect: "Battery overheating, accelerated degradation, potential thermal event",
    failure_cause: "Coolant pump failure or coolant leak",
    severity: 9,
    occurrence: 3,
    detection: 3,
    current_prevention_controls: "Redundant temperature sensors, thermal fuse on each module",
    current_detection_controls: "Continuous temperature monitoring with rate-of-change detection",
    asil_rating: "ASIL C",
    safety_goal: "Prevent battery operation above safe temperature limit",
    safety_mechanism: "Automatic power derating based on temperature",
    ftti: "< 5s",
    safe_state: "Reduce power output, enable emergency cooling",
    diagnostic_coverage: "High (≥ 99%)",
    recommended_action: "Add coolant flow sensor for pump verification",
    responsibility: "Thermal Engineer",
    action_status: "Open",
  },
  {
    step_id: "S-003",
    system_element: "High Voltage Isolation System",
    system_function: "Maintain galvanic isolation between HV and LV systems",
    system_requirement: "Isolation resistance > 500 Ω/V at all times",
    focus_element: "HV connector and insulation barrier",
    failure_mode: "Loss of HV isolation",
    failure_effect: "Electric shock hazard to vehicle occupants or service personnel",
    failure_cause: "Insulation degradation due to moisture ingress or mechanical damage",
    severity: 10,
    occurrence: 2,
    detection: 4,
    current_prevention_controls: "IP67-rated enclosure, vibration-resistant connectors",
    current_detection_controls: "Continuous isolation monitoring device (IMD)",
    asil_rating: "ASIL D",
    safety_goal: "Prevent exposure to hazardous voltage levels",
    safety_mechanism: "Automatic HV disconnect upon isolation fault detection",
    ftti: "< 50ms",
    safe_state: "Open pyro-fuse, disconnect HV battery",
    diagnostic_coverage: "High (≥ 99%)",
    recommended_action: "Implement pre-charge circuit with isolation check",
    responsibility: "HV Safety Engineer",
    action_status: "Open",
  },
];

interface SeedResult {
  project: string;
  sfmeaCreated: number;
  linksRebuilt: number;
  errors: string[];
}

export default function SeedDataPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allParts, setAllParts] = useState<Record<number, Part[]>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [existingSfmea, setExistingSfmea] = useState<Record<number, SfmeaEntry[]>>({});
  const [existingDfmea, setExistingDfmea] = useState<Record<number, DfmeaEntry[]>>({});
  const [existingPfmea, setExistingPfmea] = useState<Record<number, PfmeaEntry[]>>({});
  const [existingCp, setExistingCp] = useState<Record<number, ControlPlanEntry[]>>({});

  useEffect(() => {
    async function load() {
      try {
        const projs = await projects.list();
        setAllProjects(projs);

        const partsMap: Record<number, Part[]> = {};
        const sfmeaMap: Record<number, SfmeaEntry[]> = {};
        const dfmeaMap: Record<number, DfmeaEntry[]> = {};
        const pfmeaMap: Record<number, PfmeaEntry[]> = {};
        const cpMap: Record<number, ControlPlanEntry[]> = {};

        for (const p of projs) {
          const [pts, sf, df, pf, cp] = await Promise.all([
            parts.list({ project_id: p.id }),
            sfmea.list({ project_id: p.id }),
            dfmea.list({ project_id: p.id }),
            pfmea.list({ project_id: p.id }),
            controlPlans.list({ project_id: p.id }),
          ]);
          partsMap[p.id] = pts;
          sfmeaMap[p.id] = sf;
          dfmeaMap[p.id] = df;
          pfmeaMap[p.id] = pf;
          cpMap[p.id] = cp;
        }

        setAllParts(partsMap);
        setExistingSfmea(sfmeaMap);
        setExistingDfmea(dfmeaMap);
        setExistingPfmea(pfmeaMap);
        setExistingCp(cpMap);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const seedProject = async (project: Project, sampleData: typeof BRAKE_SFMEA_DATA): Promise<SeedResult> => {
    const result: SeedResult = {
      project: project.name,
      sfmeaCreated: 0,
      linksRebuilt: 0,
      errors: [],
    };

    const projectParts = allParts[project.id] || [];
    const firstPart = projectParts.length > 0 ? projectParts[0] : null;
    const existingStepIds = (existingSfmea[project.id] || []).map((e) => e.step_id);

    for (const entry of sampleData) {
      if (existingStepIds.includes(entry.step_id)) {
        result.errors.push(`Step ${entry.step_id} already exists, skipping`);
        continue;
      }

      try {
        await sfmea.create({
          ...entry,
          part_id: firstPart?.id ?? null,
        });
        result.sfmeaCreated++;
      } catch (err) {
        result.errors.push(
          `Failed to create ${entry.step_id}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    // Rebuild traceability links
    try {
      const linkResult = await sync.rebuildLinks(project.id);
      result.linksRebuilt = linkResult.links_created;
    } catch (err) {
      result.errors.push(
        `Failed to rebuild links: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }

    return result;
  };

  const handleSeedAll = async () => {
    setSeeding(true);
    setResults([]);

    const newResults: SeedResult[] = [];

    for (const project of allProjects) {
      const nameLC = project.name.toLowerCase();
      if (nameLC.includes("brake")) {
        const r = await seedProject(project, BRAKE_SFMEA_DATA);
        newResults.push(r);
      } else if (nameLC.includes("battery") || nameLC.includes("ev")) {
        const r = await seedProject(project, EV_BATTERY_SFMEA_DATA);
        newResults.push(r);
      }
    }

    if (newResults.length === 0) {
      newResults.push({
        project: "No matching projects",
        sfmeaCreated: 0,
        linksRebuilt: 0,
        errors: ["No projects with 'Brake' or 'Battery/EV' in their name were found."],
      });
    }

    setResults(newResults);
    setSeeding(false);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Database size={22} className="text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">Sample Data Generator</h1>
      </div>

      <p className="text-sm text-gray-600">
        This utility creates sample SFMEA entries for example projects (Brake Assembly and EV Battery)
        and rebuilds traceability links (SFMEA → DFMEA → PFMEA → Control Plan) to demonstrate the
        traceability chain concept.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading project data...</span>
        </div>
      ) : (
        <>
          {/* Project overview */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-800">Project Summary</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {allProjects.map((project) => {
                const sf = existingSfmea[project.id] || [];
                const df = existingDfmea[project.id] || [];
                const pf = existingPfmea[project.id] || [];
                const cp = existingCp[project.id] || [];
                const nameLC = project.name.toLowerCase();
                const isTarget = nameLC.includes("brake") || nameLC.includes("battery") || nameLC.includes("ev");

                return (
                  <div key={project.id} className={`px-5 py-3 ${isTarget ? "bg-blue-50/40" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{project.name}</span>
                        {isTarget && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                            TARGET
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-600">
                          SFMEA: {sf.length}
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
                          DFMEA: {df.length}
                        </span>
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-600">
                          PFMEA: {pf.length}
                        </span>
                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-purple-600">
                          CP: {cp.length}
                        </span>
                      </div>
                    </div>
                    {isTarget && sf.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        No SFMEA entries — sample data will be created
                      </p>
                    )}
                    {isTarget && sf.length > 0 && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        SFMEA entries exist — duplicates will be skipped
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traceability chain preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Traceability Chain Preview</h3>
            <p className="mb-3 text-xs text-gray-500">
              The sample data uses matching Step IDs (S-001 → D-001 → P-001 → CP-001) to create traceability links.
            </p>
            <div className="flex items-center justify-center gap-2 py-4">
              {[
                { label: "SFMEA", color: "bg-red-500", id: "S-001" },
                { label: "DFMEA", color: "bg-blue-500", id: "D-001" },
                { label: "PFMEA", color: "bg-green-500", id: "P-001" },
                { label: "Control Plan", color: "bg-purple-500", id: "CP-001" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold text-white ${item.color}`}>
                      {item.label}
                    </span>
                    <p className="mt-1 text-xs font-mono text-gray-500">{item.id}</p>
                  </div>
                  {i < 3 && <ArrowRight size={16} className="text-gray-300" />}
                </div>
              ))}
            </div>
          </div>

          {/* Seed button */}
          <button
            onClick={handleSeedAll}
            disabled={seeding}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating sample data...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Generate SFMEA Sample Data & Rebuild Links
              </>
            )}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Results</h3>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${
                    r.errors.length === 0
                      ? "border-green-200 bg-green-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {r.errors.filter((e) => !e.includes("skipping")).length === 0 ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600" />
                    )}
                    <span className="font-medium text-sm text-gray-800">{r.project}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>SFMEA created: <strong>{r.sfmeaCreated}</strong></span>
                    <span>Links rebuilt: <strong>{r.linksRebuilt}</strong></span>
                  </div>
                  {r.errors.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {r.errors.map((e, j) => (
                        <li key={j} className="text-xs text-amber-700">• {e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
