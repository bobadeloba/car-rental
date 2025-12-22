"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const formSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password must contain at least one number",
      })
      .refine((password) => /[^A-Za-z0-9]/.test(password), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export default function PasswordSettings() {
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const newPassword = watch("newPassword", "")

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0

    let strength = 0
    // Length check
    if (password.length >= 8) strength += 25
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25
    // Number check
    if (/[0-9]/.test(password)) strength += 25
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 25

    return strength
  }

  // Update password strength when password changes
  useState(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword))
  })

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500"
    if (strength <= 50) return "bg-orange-500"
    if (strength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 25) return "Weak"
    if (strength <= 50) return "Fair"
    if (strength <= 75) return "Good"
    return "Strong"
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // First, verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: data.currentPassword,
      })

      if (signInError) {
        throw new Error("Current password is incorrect")
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) throw updateError

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            {...register("currentPassword")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
            onChange={(e) => {
              register("newPassword").onChange(e)
              setPasswordStrength(calculatePasswordStrength(e.target.value))
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}

        {/* Password strength meter */}
        {newPassword && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">Password strength:</span>
              <span
                className={`text-xs font-medium ${
                  passwordStrength <= 25
                    ? "text-red-500"
                    : passwordStrength <= 50
                      ? "text-orange-500"
                      : passwordStrength <= 75
                        ? "text-yellow-500"
                        : "text-green-500"
                }`}
              >
                {getStrengthText(passwordStrength)}
              </span>
            </div>
            <Progress value={passwordStrength} className={getStrengthColor(passwordStrength)} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
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

      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p>Your password should:</p>
        <ul className="space-y-1">
          <li className="flex items-center">
            {newPassword.length >= 8 ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-4 w-4 text-gray-300" />
            )}
            Be at least 8 characters long
          </li>
          <li className="flex items-center">
            {/[A-Z]/.test(newPassword) ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-4 w-4 text-gray-300" />
            )}
            Include at least one uppercase letter
          </li>
          <li className="flex items-center">
            {/[0-9]/.test(newPassword) ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-4 w-4 text-gray-300" />
            )}
            Include at least one number
          </li>
          <li className="flex items-center">
            {/[^A-Za-z0-9]/.test(newPassword) ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-4 w-4 text-gray-300" />
            )}
            Include at least one special character
          </li>
        </ul>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  )
}
