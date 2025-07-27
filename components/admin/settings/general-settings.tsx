"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  site_name: z.string().min(2).max(50),
  site_description: z.string().max(200).optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  default_currency: z.string().min(1).max(5),
  footer_tagline: z.string().max(200).optional().or(z.literal("")),
})

export function GeneralSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      site_description: "",
      contact_email: "",
      contact_phone: "",
      default_currency: "USD",
      footer_tagline: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) throw userError

      // Check if settings exist
      const { data: existingSettings, error: fetchError } = await supabase.from("admin_settings").select("id").single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      const settingsData = {
        ...values,
        updated_at: new Date().toISOString(),
        updated_by: userData.user?.id,
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase.from("admin_settings").update(settingsData).eq("id", existingSettings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase.from("admin_settings").insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          created_by: userData.user?.id,
        })

        if (error) throw error
      }

      toast({
        title: "Settings updated",
        description: "General settings have been updated successfully",
      })
    } catch (error: any) {
      console.error("Error saving general settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update general settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load settings data
  const loadData = async () => {
    try {
      const { data, error } = await supabase.from("admin_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error)
        return
      }

      if (data) {
        form.reset({
          site_name: data.site_name || "",
          site_description: data.site_description || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          default_currency: data.default_currency || "USD",
          footer_tagline: data.footer_tagline || "",
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  // Load data on component mount
  useState(() => {
    loadData()
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage basic information about your car rental platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Car Rental" {...field} />
                    </FormControl>
                    <FormDescription>The name of your car rental platform</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The default currency for pricing throughout the platform</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="site_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium car rental service" {...field} />
                  </FormControl>
                  <FormDescription>A short description of your platform (used for SEO)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Primary contact email for customers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>Primary contact phone for customers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="footer_tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Tagline</FormLabel>
                  <FormControl>
                    <Input placeholder="Experience luxury driving at affordable prices" {...field} />
                  </FormControl>
                  <FormDescription>A short tagline that appears in the website footer</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
