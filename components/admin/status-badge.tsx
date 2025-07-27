import { cn } from "@/lib/utils"

type StatusType = string | undefined | null

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    active: {
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      label: "Active",
    },
    inactive: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      label: "Inactive",
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      label: "Pending",
    },
    completed: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      label: "Cancelled",
    },
    available: {
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      label: "Available",
    },
    rented: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      label: "Rented",
    },
    maintenance: {
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      label: "Maintenance",
    },
    default: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      label: "Unknown",
    },
  }

  // Safe access to status config with proper type checking
  // const statusKey = status && typeof status === "string" ? status.toLowerCase() : "default"
  // const { color, label } = statusConfig[statusKey] || statusConfig.default

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "unavailable":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Unknown"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getStatusColor(),
        className,
      )}
    >
      {label}
    </span>
  )
}

export default StatusBadge
