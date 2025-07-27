"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CarLoader } from "./car-loader"

interface PageLoaderProps {
  className?: string
  message?: string
  duration?: number
  onComplete?: () => void
}

export function PageLoader({
  className,
  message = "Loading your experience...",
  duration = 3000,
  onComplete,
}: PageLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)

          // Add a small delay before calling onComplete to ensure animations finish
          setTimeout(() => {
            setIsComplete(true)
            onComplete?.()
          }, 500)

          return 100
        }
        return prev + 1
      })
    }, duration / 100)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  // If loading is complete, don't render anything
  if (isComplete) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900",
        className,
      )}
    >
      <CarLoader size="lg" />

      <div className="mt-8 w-64">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Starting engine</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  )
}
