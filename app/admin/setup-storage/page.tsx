"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SetupStoragePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [buckets, setBuckets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkBuckets()
  }, [])

  const checkBuckets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/storage/init", {
        method: "GET",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check storage buckets")
      }

      setBuckets(data.buckets || [])
    } catch (error: any) {
      console.error("Error checking buckets:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeBuckets = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/storage/init", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize storage buckets")
      }

      toast({
        title: "Success",
        description: "Storage buckets initialized successfully",
      })

      // Refresh the buckets list
      await checkBuckets()
    } catch (error: any) {
      console.error("Error initializing buckets:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const initializeWithoutAdminCheck = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/storage/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize storage buckets")
      }

      toast({
        title: "Success",
        description: "Storage buckets initialized successfully",
      })

      // Refresh the buckets list
      await checkBuckets()
    } catch (error: any) {
      console.error("Error in initial setup:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const requiredBuckets = ["assets", "media", "profile-pictures", "documents"]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Storage Setup</h1>

      <Card>
        <CardHeader>
          <CardTitle>Storage Buckets</CardTitle>
          <CardDescription>
            This page helps you set up the necessary storage buckets for your application.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p className="font-semibold">Error: {error}</p>

              {error.includes("Admin access required") && (
                <div className="mt-2 text-sm">
                  <p>This could be happening because:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Your user account doesn't have admin privileges in the database</li>
                    <li>The profiles table structure is different than expected</li>
                    <li>The profiles table hasn't been created yet</li>
                  </ul>
                  <div className="mt-3 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200">
                    <p className="font-medium">Troubleshooting steps:</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Make sure you're logged in with an admin account</li>
                      <li>Check if your user has the role "admin" in the profiles table</li>
                      <li>If this is initial setup, you may need to run the database migrations first</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={checkBuckets}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mb-4">
                The following storage buckets are required for your application to function properly:
              </p>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Bucket Name</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredBuckets.map((bucketName) => {
                      const exists = buckets.some((b) => b.name === bucketName)
                      return (
                        <tr key={bucketName} className="border-t">
                          <td className="px-4 py-2">{bucketName}</td>
                          <td className="px-4 py-2">
                            {exists ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span>Created</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                <span>Missing</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {buckets.length > 0 && requiredBuckets.every((name) => buckets.some((b) => b.name === name)) ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-md">
                  <p>All required storage buckets are set up correctly.</p>
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
                  <p>
                    Some required storage buckets are missing. Click the "Initialize Buckets" button below to create
                    them.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={checkBuckets} disabled={isLoading || isInitializing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button onClick={initializeBuckets} disabled={isLoading || isInitializing}>
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>Initialize Buckets</>
              )}
            </Button>
          </div>

          {error && error.includes("Admin access required") && (
            <div className="w-full pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                If you're having issues with admin permissions, you can try the initial setup option:
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={initializeWithoutAdminCheck}
                disabled={isLoading || isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>Initial Setup (Bypass Admin Check)</>
                )}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
