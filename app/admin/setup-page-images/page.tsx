"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function SetupPageImagesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup/page-images", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to set up page images")
      }

      setIsSuccess(true)
      toast({
        title: "Success",
        description: "Page images table has been set up successfully",
      })
    } catch (error: any) {
      console.error("Error setting up page images:", error)
      setError(error.message || "An unknown error occurred")
      toast({
        title: "Error",
        description: error.message || "Failed to set up page images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Up Page Images</CardTitle>
          <CardDescription>Create the necessary database table for storing page images.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the <code>page_images</code> table in your database with the proper structure and
            permissions. This table is used to store images for different pages in your application.
          </p>

          {isSuccess ? (
            <div className="bg-green-50 p-4 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800">Setup Complete</h4>
                <p className="text-sm text-green-700 mt-1">
                  The page images table has been successfully created. You can now manage page images in your
                  application.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Setup Failed</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isSuccess ? (
            <Link href="/admin/settings" className="w-full">
              <Button className="w-full">Go to Settings</Button>
            </Link>
          ) : (
            <Button onClick={handleSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting Up...
                </>
              ) : (
                "Set Up Page Images"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
