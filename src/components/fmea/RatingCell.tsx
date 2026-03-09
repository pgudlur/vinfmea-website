import { getRatingColor } from "@/lib/constants";

interface RatingCellProps {
  value: number;
}

export default function RatingCell({ value }: RatingCellProps) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-semibold ${getRatingColor(value)}`}
    >
      {value}
    </span>
  );
}
