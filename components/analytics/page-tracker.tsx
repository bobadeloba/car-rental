"use client"

import { usePageTracker } from "@/hooks/use-page-tracker"

interface PageTrackerProps {
  pageTitle?: string
  shouldTrack?: boolean
}

export function PageTracker({ pageTitle, shouldTrack = true }: PageTrackerProps) {
  usePageTracker(pageTitle, shouldTrack)
  return null // This component doesn't render anything
}
