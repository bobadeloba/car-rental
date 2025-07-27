import { createSafeClient } from "./safe-supabase"

export async function getCompanyName(): Promise<string> {
  try {
    // Skip API fetch during build/SSR to avoid URL parsing issues
    if (typeof window !== "undefined") {
      try {
        // Use absolute URL with origin for fetch during client-side rendering
        const origin = window.location.origin
        const response = await fetch(`${origin}/api/company-name`)
        if (response.ok) {
          const { name } = await response.json()
          if (name) {
            return name
          }
        }
      } catch (apiError) {
        console.error("API fetch error:", apiError)
        // Continue to fallback
      }
    }

    // Fallback to direct query
    const supabase = createSafeClient()
    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching company name:", error)
      return "Kings Rental Cars"
    }

    return data?.site_name || data?.app_name || "Kings Rental Cars"
  } catch (error) {
    console.error("Error in getCompanyName:", error)
    return "Kings Rental Cars"
  }
}
