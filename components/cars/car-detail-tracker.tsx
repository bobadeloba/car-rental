"use client"

import { useCarViewTracker } from "@/hooks/use-car-view-tracker"

interface CarDetailTrackerProps {
  carId: string
}

export function CarDetailTracker({ carId }: CarDetailTrackerProps) {
  useCarViewTracker(carId, true)
  return null
}
