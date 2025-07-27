"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

interface PageViewData {
  page_path: string
  page_title: string
  referrer: string
  user_agent: string
  ip_address?: string
  country?: string
  city?: string
  region?: string
  device_type: string
  browser: string
  operating_system: string
  screen_resolution: string
  language: string
  timezone: string
}

export function usePageTracker() {
  const pathname = usePathname()
  const [pageViewId, setPageViewId] = useState<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const isTrackingRef = useRef<boolean>(false)
  const lastPathnameRef = useRef<string>("")

  // Detect device type
  const getDeviceType = (): string => {
    if (typeof window === "undefined") return "unknown"

    const userAgent = navigator.userAgent.toLowerCase()
    if (/tablet|ipad|playbook|silk/.test(userAgent)) return "tablet"
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent))
      return "mobile"
    return "desktop"
  }

  // Detect browser
  const getBrowser = (): string => {
    if (typeof window === "undefined") return "unknown"

    const userAgent = navigator.userAgent
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    if (userAgent.includes("Opera")) return "Opera"
    return "Other"
  }

  // Detect operating system
  const getOperatingSystem = (): string => {
    if (typeof window === "undefined") return "unknown"

    const userAgent = navigator.userAgent
    if (userAgent.includes("Windows")) return "Windows"
    if (userAgent.includes("Mac")) return "macOS"
    if (userAgent.includes("Linux")) return "Linux"
    if (userAgent.includes("Android")) return "Android"
    if (userAgent.includes("iOS")) return "iOS"
    return "Other"
  }

  // Track page view
  const trackPageView = async (path: string): Promise<string | null> => {
    if (typeof window === "undefined") return null

    try {
      const pageData: PageViewData = {
        page_path: path,
        page_title: document.title || path,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowser(),
        operating_system: getOperatingSystem(),
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      const response = await fetch("/api/track-page-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      })

      if (response.ok) {
        const result = await response.json()
        return result.id || null
      } else {
        console.warn("Failed to track page view:", response.status)
        return null
      }
    } catch (error) {
      console.warn("Error tracking page view:", error)
      return null
    }
  }

  // Update duration
  const updateDuration = async (viewId: string, duration: number, exitType = "navigation") => {
    if (!viewId) return

    try {
      await fetch("/api/track-page-duration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_view_id: viewId,
          duration_seconds: Math.round(duration / 1000),
          exit_type: exitType,
        }),
      })
    } catch (error) {
      console.warn("Error updating page duration:", error)
    }
  }

  // Handle page visibility changes
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause tracking
        if (pageViewId && startTimeRef.current) {
          const duration = Date.now() - startTimeRef.current
          updateDuration(pageViewId, duration, "hidden")
        }
      } else {
        // Page is visible again, resume tracking
        startTimeRef.current = Date.now()
      }
    }

    const handleBeforeUnload = () => {
      if (pageViewId && startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current
        // Use sendBeacon for reliable tracking on page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track-page-duration",
            JSON.stringify({
              page_view_id: pageViewId,
              duration_seconds: Math.round(duration / 1000),
              exit_type: "close",
            }),
          )
        } else {
          updateDuration(pageViewId, duration, "close")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [pageViewId])

  // Track page changes
  useEffect(() => {
    if (typeof window === "undefined") return

    // Don't track admin pages or API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return
    }

    // Prevent duplicate tracking for the same page
    if (pathname === lastPathnameRef.current && isTrackingRef.current) {
      return
    }

    // Update duration for previous page
    if (pageViewId && startTimeRef.current && lastPathnameRef.current) {
      const duration = Date.now() - startTimeRef.current
      updateDuration(pageViewId, duration, "navigation")
    }

    // Track new page view
    const trackNewPage = async () => {
      isTrackingRef.current = true
      startTimeRef.current = Date.now()
      lastPathnameRef.current = pathname

      const newPageViewId = await trackPageView(pathname)
      setPageViewId(newPageViewId)
    }

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackNewPage, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return {
    pageViewId,
    isTracking: isTrackingRef.current,
  }
}
