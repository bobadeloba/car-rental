"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const notificationSettingsSchema = z.object({
  smtp_host: z.string().optional(),
  smtp_port: z.coerce.number().int().positive().optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_from_email: z.string().email().optional(),
  smtp_from_name: z.string().optional(),
  enable_email_notifications: z.boolean().default(true),
  enable_sms_notifications: z.boolean().default(false),
  enable_push_notifications: z.boolean().default(false),
  sms_api_key: z.string().optional(),
  sms_api_secret: z.string().optional(),
  sms_from_number: z.string().optional(),
  booking_confirmation_template: z.string().optional(),
  booking_cancellation_template: z.string().optional(),
  payment_confirmation_template: z.string().optional(),
})

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>

interface NotificationSettingsProps {
  settings: any
  onSave: (values: NotificationSettingsValues) => void
  isLoading: boolean
}

export function NotificationSettings({ settings, onSave, isLoading }: NotificationSettingsProps) {
  const form = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      smtp_host: settings?.smtp_host || "",
      smtp_port: settings?.smtp_port || 587,
      smtp_username: settings?.smtp_username || "",
      smtp_password: settings?.smtp_password || "",
      smtp_from_email: settings?.smtp_from_email || "",
      smtp_from_name: settings?.smtp_from_name || "",
      enable_email_notifications: settings?.enable_email_notifications ?? true,
      enable_sms_notifications: settings?.enable_sms_notifications ?? false,
      enable_push_notifications: settings?.enable_push_notifications ?? false,
      sms_api_key: settings?.sms_api_key || "",
      sms_api_secret: settings?.sms_api_secret || "",
      sms_from_number: settings?.sms_from_number || "",
      booking_confirmation_template:
        settings?.booking_confirmation_template ||
        "Dear {{name}},\n\nYour booking (ID: {{booking_id}}) has been confirmed for {{car_name}} from {{start_date}} to {{end_date}}.\n\nTotal: {{total_amount}}\n\nThank you for choosing our service!",
      booking_cancellation_template:
        settings?.booking_cancellation_template ||
        "Dear {{name}},\n\nYour booking (ID: {{booking_id}}) for {{car_name}} has been cancelled.\n\nIf you have any questions, please contact our support team.",
      payment_confirmation_template:
        settings?.payment_confirmation_template ||
        "Dear {{name}},\n\nWe have received your payment of {{amount}} for booking ID: {{booking_id}}.\n\nThank you for your business!",
    },
  })

  function onSubmit(values: NotificationSettingsValues) {
    onSave(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="enable_email_notifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Notifications</FormLabel>
                  <FormDescription>Send email notifications to users.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enable_sms_notifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">SMS Notifications</FormLabel>
                  <FormDescription>Send SMS notifications to users.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enable_push_notifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Push Notifications</FormLabel>
                  <FormDescription>Send push notifications to users.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="email-settings">
            <AccordionTrigger>Email Settings (SMTP)</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 md:grid-cols-2 mt-4">
                <FormField
                  control={form.control}
                  name="smtp_host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="587" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <FormControl>
                        <Input placeholder="noreply@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_from_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Car Rental Platform" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sms-settings">
            <AccordionTrigger>SMS Settings</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 md:grid-cols-2 mt-4">
                <FormField
                  control={form.control}
                  name="sms_api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMS API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Your SMS API key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sms_api_secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMS API Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sms_from_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="templates">
            <AccordionTrigger>Email Templates</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="booking_confirmation_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Confirmation Template</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter booking confirmation template..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Available variables: {`{{name}}`}, {`{{booking_id}}`}, {`{{car_name}}`}, {`{{start_date}}`},{" "}
                        {`{{end_date}}`}, {`{{total_amount}}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="booking_cancellation_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Cancellation Template</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter booking cancellation template..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Available variables: {`{{name}}`}, {`{{booking_id}}`}, {`{{car_name}}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_confirmation_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Confirmation Template</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter payment confirmation template..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Available variables: {`{{name}}`}, {`{{booking_id}}`}, {`{{amount}}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Notification Settings"}
        </Button>
      </form>
    </Form>
  )
}
