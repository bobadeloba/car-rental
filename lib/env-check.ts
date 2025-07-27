/**
 * Gets the site URL with fallback for different environments
 */
export function getSiteUrl(): string {
  // Vercel provides a SITE_URL environment variable
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // Netlify provides a URL environment variable
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL
  }

  // Fallback for local development
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

/**
 * Validates that all required environment variables are set
 * This should be run early in the application lifecycle
 */
export function checkRequiredEnvVars() {
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missingVars = requiredVars.filter((varName) => {
    const value = process.env[varName]
    return !value || value === "" || value.includes("*****")
  })

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}

/**
 * Gets the Supabase URL with fallback for development
 */
export function getSupabaseUrl() {
  // First try the environment variable
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (envUrl && envUrl !== "" && !envUrl.includes("*****")) {
    return envUrl
  }

  // Fallback for development/testing only
  if (process.env.NODE_ENV === "development") {
    console.warn("Using fallback Supabase URL for development. This should not happen in production.")
    return "https://your-project.supabase.co"
  }

  // Log error but return empty string to prevent crashes
  console.error("NEXT_PUBLIC_SUPABASE_URL is not properly set")
  return ""
}

/**
 * Gets the Supabase anon key with fallback for development
 */
export function getSupabaseAnonKey() {
  // First try the environment variable
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envKey && envKey !== "" && !envKey.includes("*****")) {
    return envKey
  }

  // Fallback for development/testing only
  if (process.env.NODE_ENV === "development") {
    console.warn("Using fallback Supabase anon key for development. This should not happen in production.")
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzA5ODU0MCwiZXhwIjoxOTI4Njc0NTQwfQ.fake-key-for-development"
  }

  // Log error but return empty string to prevent crashes
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly set")
  return ""
}
