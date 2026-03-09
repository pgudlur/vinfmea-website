"use client";

import type { TopRisk } from "@/lib/types";
import { getRpnColor, AP_COLORS, STATUS_COLORS, FMEA_TYPE_CONFIG } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

interface TopRisksProps {
  risks: TopRisk[];
}

function TypeBadge({ type }: { type: string }) {
  const key = type.toLowerCase().replace(" ", "-") as keyof typeof FMEA_TYPE_CONFIG;
  const config = FMEA_TYPE_CONFIG[key];
  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        {type}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgLight} ${config.textColor}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}

export default function TopRisks({ risks }: TopRisksProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">Top Risks</h2>
      </div>

      {risks.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No risk data available
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="pb-3 pr-3">Type</th>
                <th className="pb-3 pr-3">Step ID</th>
                <th className="pb-3 pr-3">Failure Mode</th>
                <th className="pb-3 pr-3 text-center">S</th>
                <th className="pb-3 pr-3 text-center">O</th>
                <th className="pb-3 pr-3 text-center">D</th>
                <th className="pb-3 pr-3 text-center">RPN</th>
                <th className="pb-3 pr-3 text-center">AP</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {risks.map((risk, i) => {
                const rpnColor = getRpnColor(risk.rpn);
                const ap = AP_COLORS[risk.action_priority];
                const status = STATUS_COLORS[risk.action_status];

                return (
                  <tr
                    key={`${risk.type}-${risk.step_id}-${i}`}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="py-2.5 pr-3">
                      <TypeBadge type={risk.type} />
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-gray-700">
                      {risk.step_id}
                    </td>
                    <td className="max-w-[200px] truncate py-2.5 pr-3 text-gray-800">
                      {risk.failure_mode}
                    </td>
                    <td className="py-2.5 pr-3 text-center font-medium text-gray-700">
                      {risk.severity}
                    </td>
                    <td className="py-2.5 pr-3 text-center font-medium text-gray-700">
                      {risk.occurrence}
                    </td>
                    <td className="py-2.5 pr-3 text-center font-medium text-gray-700">
                      {risk.detection}
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      <span
                        className={`inline-flex min-w-[40px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${rpnColor}`}
                      >
                        {risk.rpn}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      {ap ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ap.bg} ${ap.text}`}
                        >
                          {risk.action_priority}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {status ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
                        >
                          {risk.action_status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {risk.action_status || "--"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
