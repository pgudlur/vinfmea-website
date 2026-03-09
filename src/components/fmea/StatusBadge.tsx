import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  value: string;
}

export default function StatusBadge({ value }: StatusBadgeProps) {
  const config = STATUS_COLORS[value];
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
