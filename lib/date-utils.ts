/**
 * Format a date to a readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: dateString.includes("T") ? undefined : "numeric",
  }).format(date)
}

/**
 * Format a date with full month, day, and year
 */
export function formatLongDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * Format a date in PPP format (e.g., "Apr 29, 2023")
 */
export function formatPPP(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * Calculate the difference in days between two dates
 */
export function differenceInDays(dateLeft: Date | string, dateRight: Date | string): number {
  const date1 = typeof dateLeft === "string" ? new Date(dateLeft) : dateLeft
  const date2 = typeof dateRight === "string" ? new Date(dateRight) : dateRight

  // Calculate milliseconds between dates and convert to days
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
}
