"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FixPermissionsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const fixPermissions = async () => {
    try {
      setStatus("loading")
      setMessage("Checking and fixing admin permissions...")

      const response = await fetch("/api/admin/check-permissions")
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
        setDetails(data)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to fix permissions")
        setDetails(data)
      }
    } catch (error) {
      setStatus("error")
      setMessage("An unexpected error occurred")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Fix Admin Permissions</CardTitle>
          <CardDescription>
            Use this utility to fix admin permissions if you're having trouble accessing admin pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mb-4 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {details && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm font-medium mb-2">Details:</p>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fixPermissions} disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing permissions...
              </>
            ) : (
              "Fix Admin Permissions"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
