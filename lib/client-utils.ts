"use client"

import React from "react"

import { createBrowserClient } from "@/lib/supabase/client"

/**
 * Fetches app metadata from Supabase - CLIENT COMPONENTS ONLY
 */
export async function fetchClientAppMetadata() {
  try {
    const supabase = createBrowserClient()

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
    console.error("Error in fetchClientAppMetadata:", error)
    return {
      appName: "Kings Rental Cars",
      siteName: "Kings Rental Cars",
      description: "Premium car rental service for all your needs",
      logoUrl: null,
    }
  }
}

/**
 * Hook for using app metadata in client components
 */
export function useAppMetadata() {
  const [metadata, setMetadata] = React.useState({
    appName: "Kings Rental Cars",
    siteName: "Kings Rental Cars",
    description: "Premium car rental service for all your needs",
    logoUrl: null,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadMetadata() {
      try {
        setLoading(true)
        const data = await fetchClientAppMetadata()
        setMetadata(data)
      } catch (err) {
        console.error("Error loading metadata:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadMetadata()
  }, [])

  return { metadata, loading, error }
}
