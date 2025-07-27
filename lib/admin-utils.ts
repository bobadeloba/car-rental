/**
 * Utility functions for admin-related operations
 */

/**
 * Checks if the current environment is a preview or development environment
 * where we might want to relax certain restrictions
 */
export function isPreviewOrDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview" || !process.env.NODE_ENV
}

/**
 * Determines if a user should be granted admin privileges
 * In production, this checks the user's role
 * In preview/development, it may grant admin privileges more liberally
 */
export function shouldGrantAdminPrivileges(session: any, userRole?: string | null): boolean {
  // In preview/dev environments, grant admin privileges to any authenticated user
  if (isPreviewOrDevEnvironment()) {
    return !!session
  }

  // In production, check the user's role
  return (
    userRole === "admin" || userRole === "superadmin" || (typeof userRole === "string" && userRole.includes("admin"))
  )
}
