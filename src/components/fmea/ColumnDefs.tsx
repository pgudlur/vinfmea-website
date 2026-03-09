import { ColumnDef } from "@tanstack/react-table";
import type {
  DfmeaEntry,
  PfmeaEntry,
  SfmeaEntry,
  ControlPlanEntry,
} from "@/lib/types";
import RatingCell from "./RatingCell";
import ApBadge from "./ApBadge";
import CriticalityBadge from "./CriticalityBadge";
import StatusBadge from "./StatusBadge";

// ── Helper: select checkbox column ────────────────────────────

function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
      />
    ),
    size: 40,
    enableSorting: false,
  };
}

// ── Helper: truncated text cell ──────────────────────────────

function textCell<T>(accessorKey: string, header: string, maxW = 200): ColumnDef<T> {
  return {
    accessorKey,
    header,
    cell: ({ getValue }) => (
      <span className={`block max-w-[${maxW}px] truncate`} title={String(getValue() ?? "")}>
        {String(getValue() ?? "")}
      </span>
    ),
  };
}

// ── DFMEA Columns ───────────────────────────────────────────

export function getDfmeaColumns(): ColumnDef<DfmeaEntry>[] {
  return [
    selectColumn<DfmeaEntry>(),
    {
      accessorKey: "step_id",
      header: "Step ID",
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-gray-900">
          {String(getValue())}
        </span>
      ),
      size: 90,
    },
    textCell<DfmeaEntry>("part_name", "Part Name"),
    textCell<DfmeaEntry>("function", "Function"),
    textCell<DfmeaEntry>("failure_mode", "Failure Mode"),
    textCell<DfmeaEntry>("failure_effect", "Failure Effect"),
    {
      accessorKey: "severity",
      header: "S",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "occurrence",
      header: "O",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "detection",
      header: "D",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "rpn",
      header: "RPN",
      cell: ({ getValue }) => {
        const rpn = getValue() as number;
        const color =
          rpn <= 50
            ? "bg-green-100 text-green-800"
            : rpn <= 100
              ? "bg-yellow-100 text-yellow-800"
              : rpn <= 200
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800";
        return (
          <span
            className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold ${color}`}
          >
            {rpn}
          </span>
        );
      },
      size: 65,
    },
    {
      accessorKey: "action_priority",
      header: "AP",
      cell: ({ getValue }) => <ApBadge value={getValue() as string} />,
      size: 100,
    },
    {
      accessorKey: "asil_rating",
      header: "ASIL",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs font-medium text-gray-700">
            {val || "--"}
          </span>
        );
      },
      size: 60,
    },
    {
      accessorKey: "criticality",
      header: "Criticality",
      cell: ({ getValue }) => (
        <CriticalityBadge value={getValue() as string} />
      ),
      size: 100,
    },
    textCell<DfmeaEntry>("recommended_action", "Recommended Action"),
    {
      accessorKey: "action_status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      size: 110,
    },
    textCell<DfmeaEntry>("responsibility", "Responsibility", 140),
    {
      accessorKey: "target_date",
      header: "Target Date",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {val || "--"}
          </span>
        );
      },
      size: 110,
    },
  ];
}

// ── PFMEA Columns ───────────────────────────────────────────

export function getPfmeaColumns(): ColumnDef<PfmeaEntry>[] {
  return [
    selectColumn<PfmeaEntry>(),
    {
      accessorKey: "step_id",
      header: "Step ID",
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-gray-900">
          {String(getValue())}
        </span>
      ),
      size: 90,
    },
    textCell<PfmeaEntry>("process_step", "Process Step"),
    textCell<PfmeaEntry>("process_function", "Process Function"),
    textCell<PfmeaEntry>("failure_mode", "Failure Mode"),
    textCell<PfmeaEntry>("failure_effect", "Failure Effect"),
    {
      accessorKey: "severity",
      header: "S",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "occurrence",
      header: "O",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "detection",
      header: "D",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "rpn",
      header: "RPN",
      cell: ({ getValue }) => {
        const rpn = getValue() as number;
        const color =
          rpn <= 50
            ? "bg-green-100 text-green-800"
            : rpn <= 100
              ? "bg-yellow-100 text-yellow-800"
              : rpn <= 200
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800";
        return (
          <span
            className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold ${color}`}
          >
            {rpn}
          </span>
        );
      },
      size: 65,
    },
    {
      accessorKey: "action_priority",
      header: "AP",
      cell: ({ getValue }) => <ApBadge value={getValue() as string} />,
      size: 100,
    },
    {
      accessorKey: "init_ctq",
      header: "Init CTQ",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs font-medium text-gray-700">
            {val || "--"}
          </span>
        );
      },
      size: 80,
    },
    {
      accessorKey: "criticality",
      header: "Criticality",
      cell: ({ getValue }) => (
        <CriticalityBadge value={getValue() as string} />
      ),
      size: 100,
    },
    textCell<PfmeaEntry>("recommended_action", "Recommended Action"),
    {
      accessorKey: "action_status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      size: 110,
    },
    textCell<PfmeaEntry>("responsibility", "Responsibility", 140),
    {
      accessorKey: "target_date",
      header: "Target Date",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {val || "--"}
          </span>
        );
      },
      size: 110,
    },
  ];
}

// ── SFMEA Columns ───────────────────────────────────────────

export function getSfmeaColumns(): ColumnDef<SfmeaEntry>[] {
  return [
    selectColumn<SfmeaEntry>(),
    {
      accessorKey: "step_id",
      header: "Step ID",
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-gray-900">
          {String(getValue())}
        </span>
      ),
      size: 90,
    },
    textCell<SfmeaEntry>("system_element", "System Element"),
    textCell<SfmeaEntry>("system_function", "System Function"),
    textCell<SfmeaEntry>("focus_element", "Focus Element"),
    textCell<SfmeaEntry>("failure_mode", "Failure Mode"),
    textCell<SfmeaEntry>("failure_effect", "Failure Effect"),
    {
      accessorKey: "severity",
      header: "S",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "occurrence",
      header: "O",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "detection",
      header: "D",
      cell: ({ getValue }) => <RatingCell value={getValue() as number} />,
      size: 55,
    },
    {
      accessorKey: "rpn",
      header: "RPN",
      cell: ({ getValue }) => {
        const rpn = getValue() as number;
        const color =
          rpn <= 50
            ? "bg-green-100 text-green-800"
            : rpn <= 100
              ? "bg-yellow-100 text-yellow-800"
              : rpn <= 200
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800";
        return (
          <span
            className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold ${color}`}
          >
            {rpn}
          </span>
        );
      },
      size: 65,
    },
    {
      accessorKey: "action_priority",
      header: "AP",
      cell: ({ getValue }) => <ApBadge value={getValue() as string} />,
      size: 100,
    },
    {
      accessorKey: "asil_rating",
      header: "ASIL",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs font-medium text-gray-700">
            {val || "--"}
          </span>
        );
      },
      size: 60,
    },
    {
      accessorKey: "safety_goal",
      header: "Safety Goal",
      cell: ({ getValue }) => (
        <span className="block max-w-[160px] truncate text-xs" title={String(getValue() ?? "")}>
          {String(getValue() ?? "")}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "criticality",
      header: "Criticality",
      cell: ({ getValue }) => (
        <CriticalityBadge value={getValue() as string} />
      ),
      size: 100,
    },
    textCell<SfmeaEntry>("recommended_action", "Recommended Action"),
    {
      accessorKey: "action_status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      size: 110,
    },
    textCell<SfmeaEntry>("responsibility", "Responsibility", 140),
    {
      accessorKey: "target_date",
      header: "Target Date",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {val || "--"}
          </span>
        );
      },
      size: 110,
    },
  ];
}

// ── Control Plan Columns ────────────────────────────────────

export function getControlPlanColumns(): ColumnDef<ControlPlanEntry>[] {
  return [
    selectColumn<ControlPlanEntry>(),
    {
      accessorKey: "step_id",
      header: "Step ID",
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-gray-900">
          {String(getValue())}
        </span>
      ),
      size: 90,
    },
    textCell<ControlPlanEntry>("process_step", "Process Step"),
    textCell<ControlPlanEntry>("machine_device", "Machine/Device"),
    textCell<ControlPlanEntry>("product_characteristic", "Product Char"),
    textCell<ControlPlanEntry>("process_characteristic", "Process Char"),
    {
      accessorKey: "special_char_class",
      header: "Class",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className="text-xs font-medium text-gray-700">
            {val || "--"}
          </span>
        );
      },
      size: 60,
    },
    textCell<ControlPlanEntry>("specification_tolerance", "Spec/Tolerance"),
    textCell<ControlPlanEntry>("evaluation_measurement", "Eval/Measurement"),
    {
      accessorKey: "sample_size",
      header: "Sample Size",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-700">{String(getValue() ?? "")}</span>
      ),
      size: 90,
    },
    {
      accessorKey: "sample_frequency",
      header: "Frequency",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-700">{String(getValue() ?? "")}</span>
      ),
      size: 90,
    },
    textCell<ControlPlanEntry>("control_method", "Control Method"),
    textCell<ControlPlanEntry>("reaction_plan", "Reaction Plan"),
    textCell<ControlPlanEntry>("responsible", "Responsible", 140),
  ];
}
