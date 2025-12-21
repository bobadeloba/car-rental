import { createServerClient } from "@/lib/supabase/server"
import type { PageImage } from "../client/page-images"

// Default images for different page types
const DEFAULT_IMAGES: Record<string, string> = {
  home_hero: "/luxury-car-rental.png",
  home_about: "/luxury-cars.png",
  about_hero: "/luxury-car-showroom.png",
  contact_hero: "/customer-service-interaction.png",
  cars_hero: "/luxury-cars.png",
}

export async function getPageImage(page: string): Promise<PageImage | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("page_images").select("*").eq("page", page).single()

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`No image found for page ${page}, using default`)

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
    console.error(`Error in getPageImage for ${page}:`, error)

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

export async function getAllPageImages(): Promise<PageImage[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("page_images").select("*")

    if (error) {
      console.error("Error fetching all page images:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllPageImages:", error)
    return []
  }
}
