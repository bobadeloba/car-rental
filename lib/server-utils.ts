import { createServerClient } from "@/lib/supabase/server"

/**
 * Fetches app metadata from Supabase - SERVER COMPONENTS ONLY
 */
export async function fetchServerAppMetadata() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name, site_description, logo_url")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching app metadata:", error)
      return {
        appName: "Kings Rental Cars",
        siteName: "Kings Rental Cars",
        description: "Premium car rental service for all your needs",
        logoUrl: null,
      }
    }

    return {
      appName: data?.app_name || "Kings Rental Cars",
      siteName: data?.site_name || data?.app_name || "Kings Rental Cars",
      description: data?.site_description || "Premium car rental service for all your needs",
      logoUrl: data?.logo_url,
    }
  } catch (error) {
    console.error("Error in fetchServerAppMetadata:", error)
    return {
      appName: "Kings Rental Cars",
      siteName: "Kings Rental Cars",
      description: "Premium car rental service for all your needs",
      logoUrl: null,
    }
  }
}

/**
 * Generates metadata for Next.js pages - SERVER COMPONENTS ONLY
 */
export async function generateServerMetadata(title?: string, description?: string, imageUrl?: string) {
  const metadata = await fetchServerAppMetadata()

  return {
    title: title || metadata.siteName,
    description: description || metadata.description,
    openGraph: {
      title: title || metadata.siteName,
      description: description || metadata.description,
      ...(imageUrl && { images: [{ url: imageUrl }] }),
      siteName: metadata.siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || metadata.siteName,
      description: description || metadata.description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  }
}
