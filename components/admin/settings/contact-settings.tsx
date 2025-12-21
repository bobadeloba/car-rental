"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const contactSettingsSchema = z.object({
  site_address_line1: z.string().min(1, {
    message: "Address line 1 is required.",
  }),
  site_address_line2: z.string().optional(),
  site_address_city: z.string().min(1, {
    message: "City is required.",
  }),
  site_address_state: z.string().optional(),
  site_address_country: z.string().min(1, {
    message: "Country is required.",
  }),
  site_address_postal: z.string().optional(),
  social_facebook: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  social_twitter: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  social_instagram: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  social_youtube: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

interface ContactSettingsProps {
  settings?: any
  userId: string
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function ContactSettings({ settings, userId, onSave, isLoading = false }: ContactSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const defaultValues = {
    site_address_line1: settings?.site_address_line1 || "",
    site_address_line2: settings?.site_address_line2 || "",
    site_address_city: settings?.site_address_city || "",
    site_address_state: settings?.site_address_state || "",
    site_address_country: settings?.site_address_country || "",
    site_address_postal: settings?.site_address_postal || "",
    social_facebook: settings?.social_facebook || "",
    social_twitter: settings?.social_twitter || "",
    social_instagram: settings?.social_instagram || "",
    social_youtube: settings?.social_youtube || "",
  }

  const form = useForm<z.infer<typeof contactSettingsSchema>>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues,
  })

  async function onSubmit(values: z.infer<typeof contactSettingsSchema>) {
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
        description: "Your contact settings have been updated successfully",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Location Address</h3>
            <p className="text-sm text-muted-foreground">
              This address will be displayed in the contact section of your website.
            </p>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name="site_address_line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="123 Rental Street" {...field} />
                </FormControl>
                <FormDescription>The first line of your address (street, building).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="site_address_line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Suite 100" {...field} />
                </FormControl>
                <FormDescription>Additional address information if needed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="site_address_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Cartown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site_address_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="CT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="site_address_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site_address_postal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal/ZIP Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Social Media Links</h3>
            <p className="text-sm text-muted-foreground">
              Add your social media profile URLs. These will be used in the footer and contact sections.
            </p>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name="social_facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/yourcompany" {...field} />
                </FormControl>
                <FormDescription>Your Facebook page URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="https://twitter.com/yourcompany" {...field} />
                </FormControl>
                <FormDescription>Your Twitter profile URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/yourcompany" {...field} />
                </FormControl>
                <FormDescription>Your Instagram profile URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/c/yourcompany" {...field} />
                </FormControl>
                <FormDescription>Your YouTube channel URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading || isSaving}>
          {(isLoading || isSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Contact Settings
        </Button>
      </form>
    </Form>
  )
}

export default ContactSettings
