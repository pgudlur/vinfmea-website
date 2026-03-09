import { CRITICALITY_COLORS } from "@/lib/constants";

interface CriticalityBadgeProps {
  value: string;
}

export default function CriticalityBadge({ value }: CriticalityBadgeProps) {
  const config = CRITICALITY_COLORS[value];
  if (!config) {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
        {value || "--"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}
    >
      {value}
    </span>
  );
}
