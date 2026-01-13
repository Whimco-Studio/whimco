"use client";

type StatusType = "success" | "warning" | "error" | "info" | "pending" | "default";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<StatusType, { bg: string; text: string; dot: string }> = {
  success: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  error: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  pending: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  default: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },
};

// Map common status strings to StatusType
function getStatusType(status: string): StatusType {
  const statusMap: Record<string, StatusType> = {
    completed: "success",
    active: "success",
    online: "success",
    approved: "success",
    pending: "pending",
    processing: "pending",
    waiting: "pending",
    failed: "error",
    error: "error",
    rejected: "error",
    offline: "error",
    hidden: "warning",
    inactive: "warning",
    info: "info",
  };

  return statusMap[status.toLowerCase()] || "default";
}

export default function StatusBadge({
  status,
  label,
  size = "sm",
}: StatusBadgeProps) {
  const statusType = getStatusType(status);
  const styles = statusStyles[statusType];

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${styles.bg} ${styles.text} ${sizeClasses}`}
    >
      <span className={`${dotSize} rounded-full ${styles.dot}`} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
