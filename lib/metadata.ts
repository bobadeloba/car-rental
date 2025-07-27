import { createSafeClient } from "@/lib/safe-supabase"
import type { Metadata } from "next"

// Function to get site metadata from the database
export async function getSiteMetadata() {
  try {
    const supabase = createSafeClient()
    const { data, error } = await supabase
      .from("admin_settings")
      .select("site_name, site_description, logo_url, app_name")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching site metadata:", error)
      return {
        siteName: "Premium Car Rentals",
        description: "Professional car rental service with premium vehicles and exceptional customer service",
        logoUrl: null,
      }
    }

    return {
      siteName: data?.site_name || data?.app_name || "Premium Car Rentals",
      description:
        data?.site_description ||
        "Professional car rental service with premium vehicles and exceptional customer service",
      logoUrl: data?.logo_url || null,
    }
  } catch (error) {
    console.error("Error in getSiteMetadata:", error)
    return {
      siteName: "Premium Car Rentals",
      description: "Professional car rental service with premium vehicles and exceptional customer service",
      logoUrl: null,
    }
  }
}

// Function to generate metadata for pages
export function generatePageMetadata(title: string, description: string): Metadata {
  return {
    title: title,
    description: description,
  }
}
