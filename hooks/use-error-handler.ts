"use client"

import { useError } from "@/components/providers/error-provider"
import { useCallback } from "react"

export function useErrorHandler() {
  const { setError } = useError()

  const handleError = useCallback(
    (error: unknown) => {
      console.error("Caught error:", error)
      if (error instanceof Error) {
        setError(error)
      } else {
        setError(new Error(String(error)))
      }
    },
    [setError],
  )

  return handleError
}
