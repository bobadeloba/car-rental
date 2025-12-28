"use client"

import { useEffect, useRef } from "react"

// Generate a unique session ID
function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("tracking_session_id")
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem("tracking_session_id", sessionId)
  }
  return sessionId
}

export function useCarViewTracker(carId: string | null, shouldTrack = true) {
  const hasTrackedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!carId || !shouldTrack) return

    // Prevent duplicate tracking for same car in same render cycle
    if (hasTrackedRef.current === carId) return

    const trackView = async () => {
      try {
        const sessionId = getSessionId()

        await fetch("/api/track-car-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carId,
            sessionId,
          }),
        })

        hasTrackedRef.current = carId
      } catch (error) {
        console.error("[v0] Failed to track car view:", error)
      }
    }

    // Track after a short delay to ensure user actually viewed the content
    const timer = setTimeout(trackView, 2000)

    return () => clearTimeout(timer)
  }, [carId, shouldTrack])
}
