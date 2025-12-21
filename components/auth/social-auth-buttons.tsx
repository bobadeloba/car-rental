"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@/lib/supabase/client"
import { Chrome, Apple } from "lucide-react"

interface SocialAuthButtonsProps {
  redirectUrl?: string
  mode?: "signin" | "signup"
}

export default function SocialAuthButtons({ redirectUrl, mode = "signin" }: SocialAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectUrl ? `?redirect_to=${encodeURIComponent(redirectUrl)}` : ""}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Google auth error:", error)
      setError(error.message || "Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  const handleAppleAuth = async () => {
    setIsAppleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectUrl ? `?redirect_to=${encodeURIComponent(redirectUrl)}` : ""}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Apple auth error:", error)
      setError(error.message || "Apple Sign-In is not available")
      setIsAppleLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or {mode === "signin" ? "sign in" : "sign up"} with
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading || isAppleLoading}
          className="w-full bg-transparent"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4 text-blue-600" />
              Google
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleAppleAuth}
          disabled={isGoogleLoading || isAppleLoading}
          className="w-full bg-transparent"
        >
          {isAppleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          ) : (
            <>
              <Apple className="mr-2 h-4 w-4 text-gray-800" />
              Apple
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
