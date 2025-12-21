"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  full_name: string
  email: string
  phone_number: string | null
  avatar_url?: string | null
}

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().optional(),
  language: z.string(),
  currency: z.string(),
  darkMode: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export default function AccountSettings({ user }: { user: User | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      language: "en",
      currency: "USD",
      darkMode: false,
    },
  })

  useEffect(() => {
    // Load settings from local storage
    const language = localStorage.getItem("language") || "en"
    const currency = localStorage.getItem("currency") || "USD"
    const darkMode = localStorage.getItem("darkMode") === "true"

    setValue("language", language)
    setValue("currency", currency)
    setValue("darkMode", darkMode)
  }, [setValue])

  const darkMode = watch("darkMode")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Update user profile in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          full_name: data.full_name,
        },
      })

      if (authError) throw authError

      // Update user data in the users table
      const { error: dbError } = await supabase
        .from("users")
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (dbError) throw dbError

      // Save settings to local storage
      localStorage.setItem("language", data.language)
      localStorage.setItem("currency", data.currency)
      localStorage.setItem("darkMode", data.darkMode.toString())

      // Apply dark mode
      if (data.darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      toast({
        title: "Settings updated",
        description: "Your account settings have been updated successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${user?.id}/avatar.${fileExt}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile_pictures")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data } = supabase.storage.from("profile_pictures").getPublicUrl(filePath)

      // Update the user's avatar_url in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user?.id)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} alt={user?.full_name || "User"} />
          <AvatarFallback className="text-lg">{user ? getInitials(user.full_name) : "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="avatar" className="text-sm font-medium">
            Profile Picture
          </Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: Square image, at least 300x300px</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" {...register("phone_number")} />
        {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <select
          id="language"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("language")}
        >
          <option value="en">English</option>
          <option value="ru">Russian</option>
          <option value="ar">Arabic</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        {errors.language && <p className="text-sm text-red-500">{errors.language.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("currency")}
        >
          <option value="USD">USD - US Dollar</option>
          <option value="AED">AED - UAE Dirham</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="RUB">RUB - Russian Ruble</option>
        </select>
        {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="darkMode">Dark Mode</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enable dark mode for a better viewing experience at night
          </p>
        </div>
        <Switch id="darkMode" checked={darkMode} onCheckedChange={(checked) => setValue("darkMode", checked)} />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  )
}
