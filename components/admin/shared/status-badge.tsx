import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  type?: "booking" | "car" | "payment" | "user"
}

export default function StatusBadge({ status, type = "booking" }: StatusBadgeProps) {
  const getStatusColor = (status: string, type: string) => {
    if (type === "booking") {
      switch (status.toLowerCase()) {
        case "confirmed":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "cancelled":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        case "completed":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      }
    } else if (type === "car") {
      switch (status.toLowerCase()) {
        case "available":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        case "maintenance":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "rented":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        case "reserved":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      }
    } else if (type === "payment") {
      switch (status.toLowerCase()) {
        case "paid":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "failed":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        case "refunded":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      }
    } else if (type === "user") {
      switch (status.toLowerCase()) {
        case "active":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "suspended":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      }
    }

    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }

  return <Badge className={`${getStatusColor(status, type)} capitalize`}>{status}</Badge>
}
