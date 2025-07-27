"use client"

import { useEffect } from "react"

export function useCarViewTracker(carId: string | null, shouldTrack = true) {
  useEffect(() => {
    if (!carId || !shouldTrack) return

    const trackView = async () => {
      try {
        await fetch("/api/track-car-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ carId }),
        })
      } catch (error) {
        console.error("Failed to track car view:", error)
      }
    }

    // Track the view after a short delay to ensure the user actually viewed the content
    const timer = setTimeout(trackView, 2000)

    return () => clearTimeout(timer)
  }, [carId, shouldTrack])
}
