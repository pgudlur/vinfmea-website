/**
 * Help content for vinFMEA SaaS — ported from desktop help_system.py
 */

export interface HelpTopic {
  key: string;
  title: string;
  sections: HelpSection[];
}

export interface HelpSection {
  heading?: string;
  content: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    key: "overview",
    title: "vinFMEA Pro Overview",
    sections: [
      {
        content:
          "vinFMEA Pro is a professional Failure Mode and Effects Analysis (FMEA) and Control Plan management application built to comply with AIAG & VDA FMEA Handbook (1st Edition, 2019) standards.",
      },
      {
        heading: "Key Features",
        content: `\u2022 Multi-level BOM (Bill of Materials) hierarchy management
\u2022 SFMEA / DFMEA / PFMEA / Control Plan with 4-level traceability
\u2022 ISO 26262 Functional Safety (ASIL, Safety Goals, FTTI)
\u2022 AIAG-VDA compliant risk analysis
\u2022 Action Priority (AP) methodology alongside traditional RPN
\u2022 Interactive visualizations (Risk Matrix, Dashboard)
\u2022 CTQ (Critical to Quality) classification for PFMEA
\u2022 Excel import/export with professional formatting
\u2022 PDF report generation`,
      },
      {
        heading: "Getting Started",
        content: `1. Create a new project from the Projects page
2. Add assemblies to your project structure
3. Add parts to assemblies
4. Create SFMEA entries for system-level safety analysis
5. Create DFMEA, PFMEA, and Control Plan entries for each part
6. Use traceability links to connect SFMEA \u2192 DFMEA \u2192 PFMEA \u2192 Control Plan
7. Review risk analysis in the Dashboard and Risk Matrix`,
      },
    ],
  },
  {
    key: "assembly_tree",
    title: "Product Structure (BOM Hierarchy)",
    sections: [
      {
        content:
          "The Product Structure represents your Bill of Materials (BOM) hierarchy: Project \u2192 Assemblies \u2192 Parts \u2192 FMEA/Control Plan",
      },
      {
        heading: "Hierarchy Levels",
        content: `\u2022 Project: Top level container for all data
\u2022 Assembly: Groups of parts or sub-assemblies
\u2022 Part: Individual components with FMEA/CP data`,
      },
      {
        heading: "Managing Assemblies",
        content: `\u2022 Navigate to a project detail page to add assemblies
\u2022 Sub-assemblies can be nested to any depth
\u2022 Each assembly can contain multiple parts`,
      },
      {
        heading: "Managing Parts",
        content: `\u2022 Each part belongs to one assembly
\u2022 Parts can have multiple DFMEA, PFMEA, and Control Plan entries
\u2022 Click a part to view its details and navigate to its FMEA analyses`,
      },
    ],
  },
  {
    key: "rpn",
    title: "RPN (Risk Priority Number) Calculation",
    sections: [
      {
        content:
          "RPN is the traditional method for quantifying risk in FMEA.\n\nFormula: RPN = Severity \u00d7 Occurrence \u00d7 Detection\nRange: 1 to 1,000",
      },
      {
        heading: "Criticality Thresholds",
        content: `\u2022 Low (1\u201350): Acceptable risk, no action required
\u2022 Medium (51\u2013100): Review recommended
\u2022 High (101\u2013200): Action required
\u2022 Critical (201\u20131000): Immediate action required`,
      },
      {
        heading: "Important Notes",
        content: `\u2022 RPN alone should not be the only factor in prioritization
\u2022 AIAG-VDA recommends using Action Priority (AP) as the primary method
\u2022 Two items with the same RPN may have very different risk profiles
\u2022 Always consider Severity first \u2014 high severity items need attention regardless of RPN`,
      },
    ],
  },
  {
    key: "action_priority",
    title: "Action Priority (AP) \u2014 AIAG-VDA Method",
    sections: [
      {
        content:
          "Action Priority (AP) is the AIAG-VDA recommended method for risk prioritization. It uses logic tables that consider S-O-D combinations rather than simple multiplication.",
      },
      {
        heading: "AP Levels",
        content: `H (High): Action REQUIRED. Must reduce risk through design or process changes.

M (Medium): Action SHOULD be taken. Decision required by responsible team.

L (Low): Action MAY be taken. Optional improvement at team discretion.`,
      },
      {
        heading: "Advantages Over RPN",
        content: `\u2022 Properly weights severity (safety items always prioritized)
\u2022 Prevents masking of high-risk items by low scores
\u2022 More intuitive H/M/L classification
\u2022 Aligned with current automotive industry standards`,
      },
    ],
  },
  {
    key: "severity",
    title: "Severity Rating Scale (1\u201310)",
    sections: [
      {
        content: "Severity measures the impact of the failure effect on the customer.",
      },
      {
        heading: "Rating Scale",
        content: `1 \u2014 No effect: No discernible effect
2 \u2014 Very minor: Cosmetic defect noticed only by discriminating customers
3 \u2014 Minor: Cosmetic defect noticed by average customers
4 \u2014 Very low: Product operable; appearance/audible non-conformance
5 \u2014 Low: Product operable at reduced performance
6 \u2014 Moderate: Product operable; comfort/convenience items inoperable
7 \u2014 High: Product operable at reduced performance level
8 \u2014 Very high: Product inoperable with loss of primary function
9 \u2014 Hazardous with warning: Safety hazard, failure preceded by warning
10 \u2014 Hazardous without warning: Safety hazard, failure without warning`,
      },
    ],
  },
  {
    key: "occurrence",
    title: "Occurrence Rating Scale (1\u201310)",
    sections: [
      {
        content:
          "Occurrence estimates the likelihood of the failure cause occurring.",
      },
      {
        heading: "Rating Scale",
        content: `1 \u2014 Almost impossible (\u22641 in 1,500,000, Cpk \u2265 2.00)
2 \u2014 Remote (1 in 150,000, Cpk \u2265 1.67)
3 \u2014 Very low (1 in 15,000, Cpk \u2265 1.33)
4 \u2014 Low (1 in 2,000, Cpk \u2265 1.17)
5 \u2014 Moderately low (1 in 400, Cpk \u2265 1.00)
6 \u2014 Moderate (1 in 80, Cpk \u2265 0.83)
7 \u2014 Moderately high (1 in 20, Cpk \u2265 0.67)
8 \u2014 High (1 in 8, Cpk \u2265 0.51)
9 \u2014 Very high (1 in 3, Cpk < 0.51)
10 \u2014 Almost certain (\u22651 in 2, Cpk < 0.33)`,
      },
    ],
  },
  {
    key: "detection",
    title: "Detection Rating Scale (1\u201310)",
    sections: [
      {
        content:
          "Detection measures the ability of current controls to detect the failure before it reaches the customer.",
      },
      {
        heading: "Rating Scale",
        content: `1 \u2014 Almost certain: Automated 100% test with proven detection
2 \u2014 Very high: Multiple layered controls, poka-yoke
3 \u2014 High: Reliable detection method, functional test
4 \u2014 Moderately high: Good visual inspection combined with gauging
5 \u2014 Moderate: SPC charting, variable gauging
6 \u2014 Low: Manual inspection after processing, attribute gauging
7 \u2014 Very low: Random or intermittent inspection only
8 \u2014 Remote: Visual inspection only, no gauging
9 \u2014 Very remote: Indirect or random checks only
10 \u2014 Almost impossible: No known detection control`,
      },
    ],
  },
  {
    key: "ctq",
    title: "CTQ (Critical to Quality) Classification",
    sections: [
      {
        content:
          "CTQ classification identifies characteristics that are Critical to Quality based on the Severity \u00d7 Occurrence value in PFMEA.",
      },
      {
        heading: "CTQ Thresholds",
        content: `CTQ (S\u00d7O \u2265 36): Critical to Quality \u2014 Mandatory controls required, special attention in Control Plan.

Consider CTQ (S\u00d7O 16\u201335): Evaluate for CTQ status \u2014 Additional controls recommended, review with cross-functional team.

No CTQ (S\u00d7O < 16): Standard controls sufficient \u2014 Normal monitoring adequate.`,
      },
    ],
  },
  {
    key: "control_plan",
    title: "Control Plan Overview",
    sections: [
      {
        content:
          "The Control Plan documents the system of controls that ensure process outputs meet requirements.",
      },
      {
        heading: "Special Characteristic Classes",
        content: `\u2022 CC: Critical Characteristic (safety/regulatory)
\u2022 SC: Significant Characteristic (fit/function)
\u2022 S: Safety characteristic
\u2022 R: Regulatory compliance
\u2022 HI: High Impact (customer-designated)
\u2022 F: Fit characteristic
\u2022 A: Appearance characteristic`,
      },
      {
        heading: "Key Elements",
        content: `\u2022 Process Step: Manufacturing operation being controlled
\u2022 Machine/Device: Equipment used in the operation
\u2022 Product Characteristic: Feature or specification being controlled
\u2022 Process Characteristic: Parameter affecting the product
\u2022 Specification/Tolerance: Target values and limits
\u2022 Evaluation Method: How the characteristic is measured
\u2022 Sample Size/Frequency: Sampling plan for inspection
\u2022 Control Method: How the process is monitored
\u2022 Reaction Plan: Actions when out-of-control condition detected`,
      },
    ],
  },
  {
    key: "traceability",
    title: "Traceability Links & Sync",
    sections: [
      {
        content:
          "Traceability Links connect related SFMEA, DFMEA, PFMEA, and Control Plan entries, enabling end-to-end risk tracking.",
      },
      {
        heading: "The 4-Level Traceability Chain",
        content: `SFMEA (System): Identifies system-level hazards and safety concerns. Flows down to DFMEA.

DFMEA (Design): Addresses component-level design failure modes. Links up to SFMEA, flows down to PFMEA.

PFMEA (Process): Analyzes manufacturing process failure modes. Links up to DFMEA, flows down to Control Plan.

Control Plan: Documents inspection and control methods. Links up to PFMEA.`,
      },
      {
        heading: "Step ID Conventions",
        content: `\u2022 S-001, S-002, ... for SFMEA entries
\u2022 D-001, D-002, ... for DFMEA entries
\u2022 P-001, P-002, ... for PFMEA entries
\u2022 CP-001, CP-002, ... for Control Plan entries

Entries with matching numeric suffixes are linked: S-001 \u2194 D-001 \u2194 P-001 \u2194 CP-001`,
      },
      {
        heading: "Best Practices",
        content: `1. Start with SFMEA for system-level hazard identification
2. Create PFMEA entries from DFMEA to ensure proper linking
3. Use "Rebuild Links" after bulk imports
4. Keep step ID suffixes consistent across all FMEA types
5. When Severity changes in DFMEA, review the entire chain`,
      },
    ],
  },
  {
    key: "dashboard",
    title: "Dashboard Guide",
    sections: [
      {
        content: "The Dashboard provides real-time KPIs and visualizations of your FMEA data.",
      },
      {
        heading: "KPI Cards",
        content: `\u2022 Projects, Assemblies, Parts counts
\u2022 SFMEA, DFMEA, PFMEA, and Control Plan entry counts`,
      },
      {
        heading: "Charts",
        content: `\u2022 Criticality Distribution: Breakdown by criticality level (Critical/High/Medium/Low)
\u2022 Action Priority: Donut chart showing H/M/L distribution
\u2022 Action Status: Status of recommended actions
\u2022 Failure Causes: Top failure causes with RPN comparison
\u2022 Pareto Analysis: Cumulative percentage of top failure causes`,
      },
      {
        heading: "Top 10 Risks",
        content: "Lists the highest RPN items across DFMEA and PFMEA with type, step ID, failure mode, S/O/D ratings, RPN, and AP.",
      },
    ],
  },
  {
    key: "risk_matrix",
    title: "Risk Matrix Guide",
    sections: [
      {
        content: "The Risk Matrix provides a visual heatmap of Severity \u00d7 Occurrence values.",
      },
      {
        heading: "Matrix Layout",
        content: `10\u00d710 grid (Severity 1\u201310 \u00d7 Occurrence 1\u201310). Numbers indicate count of entries at each S\u00d7O position. Click any cell to view specific FMEA entries.`,
      },
      {
        heading: "Color Coding",
        content: `\u2022 Green (S\u00d7O < 10): Low risk
\u2022 Yellow (10 \u2264 S\u00d7O < 25): Medium risk
\u2022 Orange (25 \u2264 S\u00d7O < 50): High risk
\u2022 Red (S\u00d7O \u2265 50): Critical risk`,
      },
      {
        heading: "View Modes",
        content: `Initial and Revised matrices are shown side by side. Track movement from Initial to Revised to measure risk reduction. Goal is to move entries toward lower-left (lower risk).`,
      },
    ],
  },
  {
    key: "import_export",
    title: "Import/Export Guide",
    sections: [
      {
        content: "vinFMEA supports Excel and PDF export for data exchange and reporting.",
      },
      {
        heading: "Excel Export",
        content: `\u2022 Creates professionally formatted workbook
\u2022 Separate sheets for SFMEA, DFMEA, PFMEA, Control Plan
\u2022 Color-coded by criticality
\u2022 Includes project metadata header`,
      },
      {
        heading: "PDF Export",
        content: `\u2022 Summary report with statistics
\u2022 Top risks from DFMEA and PFMEA
\u2022 Criticality distribution table`,
      },
    ],
  },
];
