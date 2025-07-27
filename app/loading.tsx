"use client"

import { useEffect, useState } from "react"
import { PageLoader } from "@/components/ui/page-loader"

export default function Loading() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a maximum timeout to ensure we don't get stuck
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000) // 5 seconds max loading time

    return () => clearTimeout(timeout)
  }, [])

  if (!isLoading) return null

  return (
    <PageLoader
      message="Starting your luxury car experience..."
      duration={3000}
      onComplete={() => setIsLoading(false)}
    />
  )
}
