"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AuthErrorHandlerProps {
  error?: string
}

export function AuthErrorHandler({ error }: AuthErrorHandlerProps) {
  const router = useRouter()
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      const errorMessages: Record<string, string> = {
        oauth_error: "There was an error with social authentication. Please try again.",
        oauth_callback_error: "Authentication callback failed. Please try again.",
        oauth_processing_error: "There was an error processing your authentication. Please try again.",
        access_denied: "Access was denied. Please try again if this was unintentional.",
        server_error: "A server error occurred during authentication. Please try again.",
        temporarily_unavailable: "The authentication service is temporarily unavailable. Please try again later.",
      }

      setErrorMessage(errorMessages[error] || "An authentication error occurred. Please try again.")
      setShowError(true)

      // Clear the error from URL after showing it
      setTimeout(() => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("error")
        const newPath = newUrl.pathname + (newUrl.searchParams.toString() ? `?${newUrl.searchParams.toString()}` : "")
        router.replace(newPath)
        setShowError(false)
      }, 5000) // Show error for 5 seconds
    }
  }, [error, router])

  if (!showError || !errorMessage) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
