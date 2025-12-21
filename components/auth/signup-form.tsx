"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { CarLoader } from "@/components/ui/car-loader"
import Link from "next/link"
import SocialAuthButtons from "./social-auth-buttons"

const formSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().optional(),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

interface SignUpFormProps {
  redirectUrl?: string
}

export default function SignUpForm({ redirectUrl }: SignUpFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (authError) {
        throw authError
      }

      // Insert user data into the users table
      if (authData.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          phone_number: data.phone || null,
          role: "customer",
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      })

      // Redirect to the dashboard or specified redirect URL
      router.push(redirectUrl || "/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Social Authentication Buttons */}
      <SocialAuthButtons redirectUrl={redirectUrl} mode="signup" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your.email@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" placeholder="+1 (555) 123-4567" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CarLoader size="sm" />
            <p className="text-sm text-gray-500 mt-2">Preparing your account...</p>
          </div>
        ) : (
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        )}

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href={redirectUrl ? `/auth/signin?redirect=${redirectUrl}` : "/auth/signin"}
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
