import { createServerClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export async function fetchAppMetadata() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name, site_description")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching app metadata:", error)
      return {
        appName: "Kings Rental Cars",
        siteName: "Kings Rental Cars",
        description: "Premium car rental service",
      }
    }

    return {
      appName: data?.app_name || "Kings Rental Cars",
      siteName: data?.site_name || data?.app_name || "Kings Rental Cars",
      description: data?.site_description || "Premium car rental service",
    }
  } catch (error) {
    console.error("Error in fetchAppMetadata:", error)
    return {
      appName: "Kings Rental Cars",
      siteName: "Kings Rental Cars",
      description: "Premium car rental service",
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, description } = await fetchAppMetadata()

  return {
    title: siteName,
    description: description,
    openGraph: {
      title: siteName,
      description: description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: description,
    },
  }
}
