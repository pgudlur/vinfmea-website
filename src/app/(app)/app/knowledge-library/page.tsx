"use client";

import { useState } from "react";
import { BookOpen, Search, ChevronRight, AlertTriangle, Lightbulb, Wrench, Shield } from "lucide-react";

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string[];
  icon: React.ReactNode;
  color: string;
}

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: "rpn",
    title: "RPN Calculation",
    category: "Standards",
    icon: <AlertTriangle size={18} />,
    color: "#EF4444",
    content: [
      "RPN (Risk Priority Number) = Severity × Occurrence × Detection",
      "Range: 1 to 1,000",
      "Higher RPN indicates greater risk priority",
      "RPN alone should NOT be the sole criterion for action — always consider Severity first",
      "RPN thresholds: Critical ≥ 200, High ≥ 120, Medium ≥ 40, Low < 40",
      "After implementing actions, recalculate revised RPN to measure improvement",
    ],
  },
  {
    id: "ap",
    title: "Action Priority (AP)",
    category: "Standards",
    icon: <AlertTriangle size={18} />,
    color: "#F59E0B",
    content: [
      "Action Priority replaces simple RPN thresholds (per AIAG-VDA 2019)",
      "HIGH (H): Must take action to reduce risk — safety or regulatory concern",
      "MEDIUM (M): Should take action — risk reduction is recommended",
      "LOW (L): May take action — risk is acceptable but improvement is possible",
      "AP considers S×O combinations with Detection thresholds",
      "AP is preferred over RPN for prioritization decisions",
    ],
  },
  {
    id: "severity",
    title: "Severity Scale (1-10)",
    category: "Rating Scales",
    icon: <Lightbulb size={18} />,
    color: "#3B82F6",
    content: [
      "1 — No effect: No discernible effect on the system",
      "2-3 — Minor: Slight inconvenience, customer barely notices",
      "4-6 — Moderate: Customer experiences discomfort or dissatisfaction",
      "7-8 — High: Customer very dissatisfied, system inoperable but safe",
      "9 — Very High: Potential safety hazard with warning",
      "10 — Hazardous: Potential safety hazard without warning, noncompliance with regulation",
    ],
  },
  {
    id: "occurrence",
    title: "Occurrence Scale (1-10)",
    category: "Rating Scales",
    icon: <Lightbulb size={18} />,
    color: "#22C55E",
    content: [
      "1 — Remote: Failure is unlikely (<1 in 1,500,000)",
      "2-3 — Low: Relatively few failures (1 in 150,000 to 1 in 15,000)",
      "4-6 — Moderate: Occasional failures (1 in 2,000 to 1 in 80)",
      "7-8 — High: Repeated failures (1 in 20 to 1 in 8)",
      "9-10 — Very High: Failure is almost inevitable (≥1 in 3)",
      "Rate based on similar designs, service history, or engineering knowledge",
    ],
  },
  {
    id: "detection",
    title: "Detection Scale (1-10)",
    category: "Rating Scales",
    icon: <Lightbulb size={18} />,
    color: "#A855F7",
    content: [
      "1 — Almost Certain: Controls will almost certainly detect the failure",
      "2-3 — High: Controls have a high chance of detecting the failure",
      "4-6 — Moderate: Controls may detect the failure",
      "7-8 — Low: Controls have low chance of detecting the failure",
      "9 — Very Remote: Controls are not likely to detect the failure",
      "10 — Absolute Uncertainty: No current control or control cannot detect",
    ],
  },
  {
    id: "ctq",
    title: "CTQ Classification",
    category: "Standards",
    icon: <Shield size={18} />,
    color: "#0EA5E9",
    content: [
      "CTQ (Critical to Quality) identifies characteristics requiring special controls",
      "S×O ≥ 36 → CTQ: Critical characteristic, mandatory special controls",
      "S×O 16-35 → Consider CTQ: Review for potential special controls",
      "S×O < 16 → Standard: Normal production controls sufficient",
      "CTQ items require Control Plan entries with SPC or 100% inspection",
      "All S≥9 items are automatically CTQ regardless of Occurrence",
    ],
  },
  {
    id: "aiag-vda",
    title: "AIAG-VDA FMEA Standard",
    category: "Reference",
    icon: <BookOpen size={18} />,
    color: "#6366F1",
    content: [
      "AIAG & VDA FMEA Handbook, 1st Edition (2019)",
      "Harmonized approach between AIAG (US) and VDA (German) standards",
      "7-step approach: Planning, Structure Analysis, Function Analysis, Failure Analysis, Risk Analysis, Optimization, Results Documentation",
      "Introduces Action Priority (AP) as primary risk evaluation method",
      "Maintains RPN for backward compatibility and trending",
      "Applies to DFMEA (Design) and PFMEA (Process) analysis types",
    ],
  },
  {
    id: "iso26262",
    title: "ISO 26262 — Functional Safety",
    category: "Reference",
    icon: <Shield size={18} />,
    color: "#DC2626",
    content: [
      "ISO 26262 — Road Vehicles Functional Safety",
      "ASIL Ratings: QM (no requirement), A (lowest), B, C, D (highest)",
      "ASIL determined by Severity, Exposure (probability), and Controllability",
      "Safety Goals define top-level safety requirements",
      "FTTI (Fault Tolerant Time Interval): Maximum time to achieve safe state",
      "Safe State: Operating mode without unreasonable risk",
      "Diagnostic Coverage: Percentage of faults detected by safety mechanisms",
      "SFMEA extends standard FMEA with ISO 26262 safety fields",
    ],
  },
  {
    id: "control-plan",
    title: "Control Plan Essentials",
    category: "Process",
    icon: <Wrench size={18} />,
    color: "#14B8A6",
    content: [
      "Control Plans document the system for controlling parts and processes",
      "Three phases: Prototype, Pre-Launch, Production",
      "Special Characteristics: CC (Critical), SC (Significant), HI (High Impact), F/A (Fit/Appearance)",
      "Links directly to PFMEA — every high-risk PFMEA item needs a Control Plan entry",
      "Includes: evaluation method, sample size/frequency, control method, reaction plan",
      "SPC (Statistical Process Control) required for CC and SC characteristics",
    ],
  },
  {
    id: "traceability",
    title: "Traceability Chain",
    category: "Process",
    icon: <Wrench size={18} />,
    color: "#8B5CF6",
    content: [
      "Full traceability: SFMEA → DFMEA → PFMEA → Control Plan",
      "Step IDs link across types: S-001 → D-001 → P-001 → CP-001",
      "DFMEA design concerns flow down to PFMEA process controls",
      "PFMEA process concerns automatically generate Control Plan entries",
      "Changes in DFMEA mark downstream links as 'out of sync'",
      "Use 'Rebuild Links' to re-establish broken traceability chains",
    ],
  },
  {
    id: "drbfm",
    title: "DRBFM Methodology",
    category: "Reference",
    icon: <BookOpen size={18} />,
    color: "#F97316",
    content: [
      "DRBFM (Design Review Based on Failure Mode) — Toyota methodology",
      "Focuses specifically on design CHANGES and their concerns",
      "Key question: 'What could go wrong because of this change?'",
      "Change Points → Concerns → Countermeasures",
      "Complements traditional FMEA by focusing review resources on changes",
      "Particularly effective for engineering change management and model updates",
    ],
  },
  {
    id: "dvpr",
    title: "DVP&R Overview",
    category: "Process",
    icon: <Wrench size={18} />,
    color: "#0891B2",
    content: [
      "DVP&R (Design Verification Plan and Report)",
      "Links DFMEA failure modes to verification/validation tests",
      "Test stages: DV (Design Verification), PV (Production Validation), OTS (Off-Tool Samples), PPAP",
      "Tracks: test method, acceptance criteria, sample size, responsible engineer",
      "Status tracking: Planned → In Progress → Pass / Fail / Conditional Pass",
      "Ensures all DFMEA high-risk items have corresponding verification tests",
    ],
  },
];

export default function KnowledgeLibraryPage() {
  const [selectedId, setSelectedId] = useState<string>("rpn");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedItem = KNOWLEDGE_ITEMS.find((i) => i.id === selectedId)!;

  const categories = [...new Set(KNOWLEDGE_ITEMS.map((i) => i.category))];

  const filteredItems = searchQuery
    ? KNOWLEDGE_ITEMS.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : KNOWLEDGE_ITEMS;

  return (
    <div className="flex h-full">
      {/* Left panel — topic list */}
      <div className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">Knowledge Library</h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <nav className="p-2">
          {categories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="mb-3">
                <p className="px-3 mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {catItems.map((item) => {
                    const isActive = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-white shadow-sm border border-gray-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md"
                          style={{
                            backgroundColor: isActive ? `${item.color}15` : "#F3F4F6",
                            color: isActive ? item.color : "#9CA3AF",
                          }}
                        >
                          {item.icon}
                        </div>
                        <span className={`text-sm ${isActive ? "font-medium text-gray-900" : "text-gray-600"}`}>
                          {item.title}
                        </span>
                        {isActive && <ChevronRight size={14} className="ml-auto text-gray-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right panel — content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${selectedItem.color}15`, color: selectedItem.color }}
            >
              {selectedItem.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h1>
              <p className="text-xs text-gray-500">{selectedItem.category}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <ul className="space-y-3">
              {selectedItem.content.map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <div
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedItem.color }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
