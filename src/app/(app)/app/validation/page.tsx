"use client";

import { useState } from "react";
import { Shield, CheckCircle2, FileCheck, Settings, BarChart3, ChevronRight } from "lucide-react";

type DocType = "svp" | "iq" | "oq" | "pq";

interface ValidationDoc {
  key: DocType;
  title: string;
  fullTitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  sections: { heading: string; items: string[] }[];
}

const VALIDATION_DOCS: ValidationDoc[] = [
  {
    key: "svp",
    title: "SVP",
    fullTitle: "Software Validation Plan",
    icon: <Shield size={18} />,
    color: "#2563EB",
    bgColor: "#EFF6FF",
    sections: [
      {
        heading: "1. Purpose",
        items: [
          "Define validation approach for vinFMEA Pro SaaS application",
          "Ensure software meets functional and regulatory requirements",
          "Establish acceptance criteria for production deployment",
        ],
      },
      {
        heading: "2. Scope",
        items: [
          "FMEA data entry, calculation, and management features",
          "Risk assessment calculations (RPN, AP, CTQ)",
          "Data integrity across SFMEA, DFMEA, PFMEA, and Control Plan",
          "Import/Export functionality (Excel, PDF)",
          "Multi-user access control and authentication",
        ],
      },
      {
        heading: "3. Validation Strategy",
        items: [
          "Installation Qualification (IQ): Verify correct deployment",
          "Operational Qualification (OQ): Verify features work as designed",
          "Performance Qualification (PQ): Verify under real-world conditions",
        ],
      },
      {
        heading: "4. Acceptance Criteria",
        items: [
          "All critical calculations produce correct results",
          "Data persistence verified across sessions",
          "Role-based access control enforced correctly",
          "No data loss during concurrent multi-user access",
          "Export outputs match source data exactly",
        ],
      },
      {
        heading: "5. References",
        items: [
          "AIAG & VDA FMEA Handbook, 1st Edition (2019)",
          "ISO 26262 — Functional Safety for Road Vehicles",
          "GAMP 5 — Risk-Based Approach to Compliant GxP Systems",
          "21 CFR Part 11 — Electronic Records & Signatures",
        ],
      },
    ],
  },
  {
    key: "iq",
    title: "IQ",
    fullTitle: "Installation Qualification",
    icon: <Settings size={18} />,
    color: "#16A34A",
    bgColor: "#F0FDF4",
    sections: [
      {
        heading: "1. Server Environment",
        items: [
          "Verify Railway hosting environment is active and accessible",
          "Verify SSL/TLS certificate is valid for vinfmea.com",
          "Confirm PostgreSQL database is provisioned and connected",
          "Verify FastAPI backend responds on /api/health endpoint",
        ],
      },
      {
        heading: "2. Client Environment",
        items: [
          "Verify application loads in Chrome, Firefox, Safari, and Edge",
          "Verify Cloudflare Workers deployment is active",
          "Confirm static assets are served with correct caching headers",
          "Verify responsive layout on desktop, tablet, and mobile",
        ],
      },
      {
        heading: "3. Authentication System",
        items: [
          "Verify login page is accessible at /login",
          "Confirm JWT token generation on successful authentication",
          "Verify token expiration and refresh mechanisms",
          "Confirm role-based access (Admin, Editor, Viewer)",
        ],
      },
      {
        heading: "4. Database Schema",
        items: [
          "Verify all tables are created (projects, assemblies, parts, sfmea, dfmea, pfmea, control_plans, fmea_links, audit_trail)",
          "Confirm foreign key relationships are intact",
          "Verify indexes on frequently queried columns",
          "Confirm audit trail table with SHA-256 hash chain",
        ],
      },
    ],
  },
  {
    key: "oq",
    title: "OQ",
    fullTitle: "Operational Qualification",
    icon: <FileCheck size={18} />,
    color: "#D97706",
    bgColor: "#FFFBEB",
    sections: [
      {
        heading: "1. FMEA Data Entry",
        items: [
          "Create SFMEA entry with all ISO 26262 fields (ASIL, Safety Goal, FTTI)",
          "Create DFMEA entry with design-level failure analysis",
          "Create PFMEA entry with process-level failure analysis",
          "Create Control Plan entry with SPC and reaction plan details",
          "Verify step ID auto-generation (S-xxx, D-xxx, P-xxx, CP-xxx)",
        ],
      },
      {
        heading: "2. Calculations",
        items: [
          "Verify RPN = Severity \u00d7 Occurrence \u00d7 Detection (range 1\u20131000)",
          "Verify Action Priority (H/M/L) logic tables match AIAG-VDA standard",
          "Verify CTQ classification (S\u00d7O \u2265 36 = CTQ, 16\u201335 = Consider)",
          "Verify Criticality thresholds (Low/Medium/High/Critical)",
          "Verify revised ratings recalculate correctly",
        ],
      },
      {
        heading: "3. Traceability",
        items: [
          "Verify DFMEA \u2192 PFMEA link creation",
          "Verify PFMEA \u2192 Control Plan auto-sync",
          "Verify traceability chain visualization shows all linked entries",
          "Verify Rebuild Links correctly matches step ID suffixes",
        ],
      },
      {
        heading: "4. Reports & Export",
        items: [
          "Verify Excel export produces valid .xlsx with all columns",
          "Verify PDF report includes summary statistics and top risks",
          "Verify exported data matches displayed data exactly",
          "Verify color-coded formatting in exports",
        ],
      },
      {
        heading: "5. Risk Matrix",
        items: [
          "Verify 10\u00d710 matrix displays correct entry counts at each S\u00d7O position",
          "Verify Initial and Revised matrices show independently",
          "Verify cell click reveals correct FMEA entries",
          "Verify color coding matches risk thresholds",
        ],
      },
    ],
  },
  {
    key: "pq",
    title: "PQ",
    fullTitle: "Performance Qualification",
    icon: <BarChart3 size={18} />,
    color: "#9333EA",
    bgColor: "#FAF5FF",
    sections: [
      {
        heading: "1. Data Volume Testing",
        items: [
          "Load test with 100+ DFMEA entries per project",
          "Load test with 100+ PFMEA entries per project",
          "Verify dashboard renders within 3 seconds with full dataset",
          "Verify Risk Matrix performs within 2 seconds",
        ],
      },
      {
        heading: "2. Concurrent Users",
        items: [
          "Test with 5 simultaneous users editing different entries",
          "Verify record locking prevents conflicting edits",
          "Verify license seat checkout/checkin operates correctly",
          "Verify heartbeat mechanism maintains active sessions",
        ],
      },
      {
        heading: "3. Data Integrity",
        items: [
          "Verify audit trail records all CREATE, UPDATE, DELETE operations",
          "Verify SHA-256 hash chain integrity via /api/audit/verify",
          "Verify no data loss after server restart",
          "Verify optimistic locking prevents stale overwrites (version column)",
        ],
      },
      {
        heading: "4. Real-World Scenarios",
        items: [
          "Complete full Brake System FMEA workflow (SFMEA \u2192 DFMEA \u2192 PFMEA \u2192 CP)",
          "Complete full EV Battery FMEA workflow",
          "Generate complete project reports (Excel + PDF)",
          "Verify traceability chain for end-to-end linked entries",
        ],
      },
    ],
  },
];

export default function ValidationPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocType>("svp");
  const doc = VALIDATION_DOCS.find((d) => d.key === selectedDoc)!;

  return (
    <div className="flex h-full">
      {/* Left panel — doc selector */}
      <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Validation</h2>
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {VALIDATION_DOCS.map((d) => {
            const isActive = d.key === selectedDoc;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDoc(d.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-white shadow-sm border border-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: isActive ? d.bgColor : "#F3F4F6",
                    color: isActive ? d.color : "#9CA3AF",
                  }}
                >
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                    {d.title}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{d.fullTitle}</p>
                </div>
                {isActive && <ChevronRight size={14} className="text-gray-400 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right panel — content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: doc.bgColor, color: doc.color }}
              >
                {doc.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{doc.fullTitle}</h1>
                <p className="text-sm text-gray-500">{doc.title} — vinFMEA Pro SaaS</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {doc.sections.map((section, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  {section.heading}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{ color: doc.color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
