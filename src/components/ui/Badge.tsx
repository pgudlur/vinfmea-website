import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeProps["variant"], string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

export default function Badge({
  children,
  variant,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
