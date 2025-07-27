"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SetupTestimonialsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/setup-testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ success: false, error: data.error || "Failed to set up testimonials" })
      } else {
        setResult({ success: true, message: data.message || "Testimonials set up successfully" })
      }
    } catch (error) {
      setResult({ success: false, error: "An unexpected error occurred" })
      console.error("Error setting up testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Up Testimonials</CardTitle>
          <CardDescription>
            This will create the necessary database tables and policies for the testimonials feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="font-medium text-amber-800 mb-2">Important Information</h3>
            <p className="text-amber-700 text-sm">This setup will:</p>
            <ul className="list-disc list-inside text-amber-700 text-sm mt-2 space-y-1">
              <li>Create the profiles table if it doesn't exist</li>
              <li>Create the testimonials table if it doesn't exist</li>
              <li>Set up row-level security policies for both tables</li>
              <li>Create necessary functions and triggers</li>
            </ul>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message || result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetup} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Set Up Testimonials"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
