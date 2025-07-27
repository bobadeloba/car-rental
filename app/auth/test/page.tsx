"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getCurrentUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === "SIGNED_IN") {
        toast({
          title: "Authentication Successful!",
          description: `Signed in as ${session?.user?.email}`,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/auth/test`,
      },
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Google Auth Test</CardTitle>
          <CardDescription>Test Google authentication integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Authenticated!</h3>
                <p className="text-sm text-green-600">Email: {user.email}</p>
                <p className="text-sm text-green-600">Provider: {user.app_metadata?.provider || "email"}</p>
                <p className="text-sm text-green-600">User ID: {user.id}</p>
              </div>
              <Button onClick={signOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Not authenticated</p>
              <Button onClick={signInWithGoogle} className="w-full">
                Sign In with Google
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
