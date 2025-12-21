"use client"

import React from "react"

import { createClientComponentClient } from "@/lib/supabase/client"

import type { PageImage } from "@/types/page-image"

// Default images for different page types
const DEFAULT_IMAGES: Record<string, string> = {
  home_hero: "/luxury-car-rental.png",
  home_about: "/luxury-cars.png",
  about_hero: "/luxury-car-showroom.png",
  contact_hero: "/customer-service-interaction.png",
  cars_hero: "/luxury-cars.png",
}

export async function getClientPageImage(page: string): Promise<PageImage | null> {
  try {
    const supabase = createClientComponentClient()

    // First try to fetch from API
    try {
      const response = await fetch(`/api/page-images?key=${encodeURIComponent(page)}`)
      if (response.ok) {
        const { data } = await response.json()
        if (data) {
          return data
        }
      }
    } catch (apiError) {
      console.error("API fetch error:", apiError)
      // Continue to fallback
    }

    // Fallback to direct query
    try {
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
    } catch (dbError) {
      console.error("Database query error:", dbError)
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
    }
  } catch (error) {
    console.error(`Error in getClientPageImage for ${page}:`, error)

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

export async function getAllClientPageImages(): Promise<PageImage[]> {
  try {
    const supabase = createClientComponentClient()

    // First try to fetch from API
    try {
      const response = await fetch("/api/page-images/all")
      if (response.ok) {
        const { data } = await response.json()
        if (data && Array.isArray(data)) {
          return data
        }
      }
    } catch (apiError) {
      console.error("API fetch error:", apiError)
      // Continue to fallback
    }

    // Fallback to direct query
    const { data, error } = await supabase.from("page_images").select("*")

    if (error) {
      console.error("Error fetching all page images:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllClientPageImages:", error)
    return []
  }
}

// React hook for using page images in client components
export function usePageImage(page: string) {
  const [image, setImage] = React.useState<PageImage | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    async function fetchImage() {
      try {
        setLoading(true)
        const data = await getClientPageImage(page)
        setImage(data)
      } catch (err) {
        console.error(`Error fetching image for ${page}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [page])

  return { image, loading, error }
}
