import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export default function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${color}`}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
