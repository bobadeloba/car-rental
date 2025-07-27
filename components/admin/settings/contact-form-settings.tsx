"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  contact_form_title: z.string().min(2).max(50),
  contact_form_description: z.string().max(200).optional().or(z.literal("")),
  contact_form_success_message: z.string().min(2).max(200),
  contact_form_email_field_label: z.string().min(2).max(50),
  contact_form_name_field_label: z.string().min(2).max(50),
  contact_form_message_field_label: z.string().min(2).max(50),
  contact_form_submit_button_text: z.string().min(2).max(50),
  contact_form_show_phone: z.boolean().default(true),
  contact_form_phone_field_label: z.string().min(2).max(50),
  contact_form_enable_captcha: z.boolean().default(true),
})

export function ContactFormSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_form_title: "Contact Us",
      contact_form_description: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      contact_form_success_message: "Thank you for your message. We'll get back to you shortly.",
      contact_form_email_field_label: "Email",
      contact_form_name_field_label: "Name",
      contact_form_message_field_label: "Message",
      contact_form_submit_button_text: "Send Message",
      contact_form_show_phone: true,
      contact_form_phone_field_label: "Phone (optional)",
      contact_form_enable_captcha: true,
    },
  })

  // Load settings data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from("admin_settings").select("*").single()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading settings:", error)
          return
        }

        if (data) {
          form.reset({
            contact_form_title: data.contact_form_title || "Contact Us",
            contact_form_description:
              data.contact_form_description ||
              "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
            contact_form_success_message:
              data.contact_form_success_message || "Thank you for your message. We'll get back to you shortly.",
            contact_form_email_field_label: data.contact_form_email_field_label || "Email",
            contact_form_name_field_label: data.contact_form_name_field_label || "Name",
            contact_form_message_field_label: data.contact_form_message_field_label || "Message",
            contact_form_submit_button_text: data.contact_form_submit_button_text || "Send Message",
            contact_form_show_phone: data.contact_form_show_phone !== undefined ? data.contact_form_show_phone : true,
            contact_form_phone_field_label: data.contact_form_phone_field_label || "Phone (optional)",
            contact_form_enable_captcha:
              data.contact_form_enable_captcha !== undefined ? data.contact_form_enable_captcha : true,
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadData()
  }, [form, supabase])

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
        description: "Contact form settings have been updated successfully",
      })
    } catch (error: any) {
      console.error("Error saving contact form settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update contact form settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Form Settings</CardTitle>
        <CardDescription>Customize the appearance and behavior of your contact form</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_form_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact Us" {...field} />
                    </FormControl>
                    <FormDescription>The title displayed at the top of the contact form</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_form_submit_button_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submit Button Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Send Message" {...field} />
                    </FormControl>
                    <FormDescription>Text displayed on the submit button</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_form_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Introductory text explaining the purpose of the contact form</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_form_success_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thank you for your message. We'll get back to you shortly."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>Message shown after successful form submission</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contact_form_name_field_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name Field Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_form_email_field_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Field Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_form_message_field_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Field Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <FormField
                control={form.control}
                name="contact_form_show_phone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>Include Phone Field</FormLabel>
                      <FormDescription>Show a phone number field in the contact form</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_form_phone_field_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Field Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_form_enable_captcha"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 p-4 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel>Enable CAPTCHA</FormLabel>
                    <FormDescription>Add CAPTCHA verification to prevent spam submissions</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
