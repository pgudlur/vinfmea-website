interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

const widthPattern = ["w-full", "w-3/4", "w-1/2"];

export default function LoadingSkeleton({
  lines = 3,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse rounded bg-gray-200 ${widthPattern[i % widthPattern.length]}`}
        />
      ))}
    </div>
  );
}
