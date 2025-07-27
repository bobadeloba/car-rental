import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export type PageImage = {
  id: string
  page: string
  title: string
  image_url: string
  alt_text?: string | null
  created_at: string
  updated_at?: string | null
}

// Default images for different page types
const DEFAULT_IMAGES: Record<string, string> = {
  home_hero: "/luxury-car-rental.png",
  home_about: "/luxury-cars.png",
  about_hero: "/luxury-car-showroom.png",
  contact_hero: "/customer-service-interaction.png",
  cars_hero: "/luxury-cars.png",
}

export async function getServerPageImage(page: string): Promise<PageImage | null> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.from("page_images").select("*").eq("page", page).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        console.log(`No image found for page ${page}, using default`)

        // Return a default image if available
        if (DEFAULT_IMAGES[page]) {
          return {
            id: `default-${page}`,
            page,
            title: page.replace(/_/g, " "),
            image_url: DEFAULT_IMAGES[page],
            created_at: new Date().toISOString(),
          }
        }
        return null
      }

      console.error(`Error fetching page image for ${page}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Error in getServerPageImage for ${page}:`, error)

    // Return default image as last resort
    if (DEFAULT_IMAGES[page]) {
      return {
        id: `default-${page}`,
        page,
        title: page.replace(/_/g, " "),
        image_url: DEFAULT_IMAGES[page],
        created_at: new Date().toISOString(),
      }
    }
    return null
  }
}

export async function getAllServerPageImages(): Promise<PageImage[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.from("page_images").select("*")

    if (error) {
      console.error("Error fetching all page images:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllServerPageImages:", error)
    return []
  }
}
