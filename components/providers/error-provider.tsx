"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define the context type
type ErrorContextType = {
  error: Error | null
  setError: (error: Error | null) => void
  clearError: () => void
}

// Create the context with default values
const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
  clearError: () => {},
})

// Custom hook to use the error context
export const useError = () => useContext(ErrorContext)

// Error provider component
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null)

  const clearError = () => setError(null)

  // If there's an error, show the error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {error.message || "We apologize for the inconvenience. Our team has been notified of this issue."}
        </p>
        <div className="flex gap-4">
          <Button onClick={clearError} variant="default">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Go to homepage
          </Button>
        </div>
      </div>
    )
  }

  // Wrap children in an error boundary
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      <ErrorBoundaryWrapper setError={setError}>{children}</ErrorBoundaryWrapper>
    </ErrorContext.Provider>
  )
}

// Error boundary class component
class ErrorBoundaryWrapper extends React.Component<{
  children: ReactNode
  setError: (error: Error | null) => void
}> {
  componentDidCatch(error: Error) {
    // Update the error state when an error is caught
    this.props.setError(error)
    // Log the error
    console.error("Application error:", error)
  }

  render() {
    return this.props.children
  }
}
