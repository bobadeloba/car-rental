"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"

// Generate a unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session ID from sessionStorage
function getSessionId(): string {
  if (typeof window === "undefined") return generateSessionId()

  let sessionId = sessionStorage.getItem("tracking_session_id")
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("tracking_session_id", sessionId)
  }
  return sessionId
}

export function usePageTracker() {
  const pathname = usePathname()
  const pageViewIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const lastPathnameRef = useRef<string>("")
  const isTrackingRef = useRef<boolean>(false)

  // Track page view
  const trackPageView = useCallback(async (path: string, title: string): Promise<string | null> => {
    if (typeof window === "undefined") return null

    // Don't track admin pages or API routes
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return null
    }

    try {
      const sessionId = getSessionId()

      const response = await fetch("/api/track-page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: path,
          pageTitle: title,
          sessionId,
          startTime: Date.now(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.sessionId) {
          sessionStorage.setItem("tracking_session_id", result.sessionId)
        }
        return result.pageViewId || null
      } else {
        const error = await response.json()
        console.warn("[v0] Error tracking page view:", error)
        return null
      }
    } catch (error) {
      console.warn("[v0] Error tracking page view:", error)
      return null
    }
  }, [])

  // Update duration when leaving page
  const updateDuration = useCallback(async (exitType = "navigation") => {
    if (!pageViewIdRef.current || !startTimeRef.current) return

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const sessionId = getSessionId()

    try {
      // Use sendBeacon for reliable tracking on unload
      if (exitType === "close" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track-page-duration",
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            pagePath: lastPathnameRef.current,
            pageTitle: document.title,
            sessionId,
            duration,
            exitType,
          }),
        )
      } else {
        await fetch("/api/track-page-duration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageViewId: pageViewIdRef.current,
            pagePath: lastPathnameRef.current,
            pageTitle: document.title,
            sessionId,
            duration,
            exitType,
          }),
        })
      }
    } catch (error) {
      console.warn("[v0] Error updating duration:", error)
    }
  }, [])

  // Handle visibility changes and page unload
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateDuration("hidden")
      } else {
        // Resume tracking when page becomes visible
        startTimeRef.current = Date.now()
      }
    }

    const handleBeforeUnload = () => {
      updateDuration("close")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [updateDuration])

  // Track page changes
  useEffect(() => {
    if (typeof window === "undefined") return

    // Skip admin and API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return
    }

    // Prevent duplicate tracking
    if (pathname === lastPathnameRef.current && isTrackingRef.current) {
      return
    }

    // Update duration for previous page
    if (pageViewIdRef.current && lastPathnameRef.current) {
      updateDuration("navigation")
    }

    // Track new page
    const track = async () => {
      isTrackingRef.current = true
      startTimeRef.current = Date.now()
      lastPathnameRef.current = pathname

      const pageViewId = await trackPageView(pathname, document.title || pathname)
      pageViewIdRef.current = pageViewId
    }

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(track, 150)

    return () => clearTimeout(timeoutId)
  }, [pathname, trackPageView, updateDuration])

  return {
    pageViewId: pageViewIdRef.current,
    isTracking: isTrackingRef.current,
  }
}
