"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CarLoader } from "@/components/ui/car-loader"
import Link from "next/link"
import SocialAuthButtons from "./social-auth-buttons"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type FormData = z.infer<typeof formSchema>

interface SignInFormProps {
  redirectUrl?: string
}

export default function SignInForm({ redirectUrl }: SignInFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      console.log("Attempting to sign in with:", data.email)

      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error("Authentication error:", error)
        setAuthError(error.message || "Authentication failed. Please check your credentials.")
        return
      }

      if (!authData?.user) {
        console.error("No user returned from authentication")
        setAuthError("Authentication failed. Please try again.")
        return
      }

      console.log("Authentication successful, user ID:", authData.user.id)

      // Get the user's role from the users table
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user role:", userError)
          // If we can't get the role, we'll default to customer
          toast({
            title: "Success",
            description: "You have been signed in successfully",
          })
          router.push("/dashboard")
          return
        }

        toast({
          title: "Success",
          description: "You have been signed in successfully",
        })

        // Check if there's a pending booking in localStorage
        let pendingBooking = null
        try {
          pendingBooking = localStorage.getItem("pendingBooking")
        } catch (e) {
          console.error("Error accessing localStorage:", e)
        }

        if (pendingBooking && redirectUrl?.includes("/cars/")) {
          // If there's a pending booking and we're redirecting to a car page,
          // we'll keep the redirect to complete the booking
          router.push(redirectUrl || "/")
        } else {
          // Check if user is admin and redirect accordingly
          if (userData?.role === "admin") {
            router.push("/admin")
          } else {
            // Otherwise, redirect to user dashboard
            router.push("/dashboard")
          }
        }
      } catch (queryError) {
        console.error("Error in user role query:", queryError)
        // If the query fails, still consider the login successful but redirect to dashboard
        toast({
          title: "Success",
          description: "You have been signed in successfully",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      setAuthError(error.message || "Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Social Authentication Buttons */}
      <SocialAuthButtons redirectUrl={redirectUrl} mode="signin" />

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your.email@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm font-normal"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CarLoader size="sm" />
            <p className="text-sm text-gray-500 mt-2">Starting your engine...</p>
          </div>
        ) : (
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        )}

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={redirectUrl ? `/auth/signup?redirect=${redirectUrl}` : "/auth/signup"}
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
