"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

const brandingSettingsSchema = z.object({
  app_name: z.string().min(2, {
    message: "Application name must be at least 2 characters.",
  }),
  logo_url: z.string().optional(),
  whatsapp_phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, {
      message: "Please enter a valid phone number.",
    })
    .optional(),
})

interface BrandingSettingsProps {
  settings?: any
  userId: string
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function BrandingSettings({ settings, userId, onSave, isLoading = false }: BrandingSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const defaultValues = {
    app_name: settings?.app_name || "Premium Car Rentals",
    logo_url: settings?.logo_url || "",
    whatsapp_phone: settings?.whatsapp_phone || "",
  }

  const form = useForm<z.infer<typeof brandingSettingsSchema>>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (settings?.logo_url) {
      setLogoPreview(settings.logo_url)
    }
  }, [settings])

  async function onSubmit(values: z.infer<typeof brandingSettingsSchema>) {
    if (onSave) {
      onSave(values)
      return
    }

    setIsSaving(true)

    try {
      // Check if settings exist
      const { data: existingSettings, error: fetchError } = await supabase.from("admin_settings").select("id").limit(1)

      if (fetchError) {
        throw fetchError
      }

      const settingsData = {
        ...values,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      }

      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        const { error } = await supabase.from("admin_settings").update(settingsData).eq("id", existingSettings[0].id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase.from("admin_settings").insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          created_by: userId,
        })

        if (error) throw error
      }

      toast({
        title: "Settings updated",
        description: "Your branding settings have been updated successfully",
      })
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const fileName = `logo-${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from("logos").upload(fileName, file)

      if (error) {
        if (error.message.includes("permission") || error.message.includes("access")) {
          throw new Error("Permission denied. Make sure the logos bucket has the correct access policies.")
        } else {
          throw error
        }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(data.path)

      // Update form value
      form.setValue("logo_url", publicUrlData.publicUrl)
      setLogoPreview(publicUrlData.publicUrl)

      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Branding Settings</h3>
            <p className="text-sm text-muted-foreground">
              Customize your application branding, logo, and contact information.
            </p>
          </div>
          <Separator />

          <FormField
            control={form.control}
            name="app_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Name</FormLabel>
                <FormControl>
                  <Input placeholder="Car Rental" {...field} />
                </FormControl>
                <FormDescription>This name will appear in the header and browser title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="relative h-20 w-auto border rounded-md overflow-hidden">
                      <Image
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        width={200}
                        height={80}
                        className="object-contain h-full"
                      />
                    </div>
                  )}
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                    </Button>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          form.setValue("logo_url", "")
                          setLogoPreview(null)
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <FormDescription>
                  Upload your company logo (recommended size: 200x80px, max 2MB). This will be used as your site favicon
                  and in metadata.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormDescription>
                  This phone number will be used for the WhatsApp button. Include country code (e.g., +1).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading || isSaving || isUploading}>
          {(isLoading || isSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Branding Settings
        </Button>
      </form>
    </Form>
  )
}

export default BrandingSettings
