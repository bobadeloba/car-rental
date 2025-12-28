"use client"

import { usePageTracker } from "@/hooks/use-page-tracker"

interface PageTrackerProps {
  pageTitle?: string
  shouldTrack?: boolean
}

export function PageTracker({ shouldTrack = true }: PageTrackerProps) {
  // Always call the hook at the top level
  usePageTracker()

  // Only track if shouldTrack is true
  if (!shouldTrack) {
    return null
  }

  return null
}
