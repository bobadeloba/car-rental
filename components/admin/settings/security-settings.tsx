"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const securitySettingsSchema = z.object({
  password_min_length: z.coerce.number().int().min(6).max(30).default(8),
  password_require_uppercase: z.boolean().default(true),
  password_require_lowercase: z.boolean().default(true),
  password_require_number: z.boolean().default(true),
  password_require_special: z.boolean().default(true),
  max_login_attempts: z.coerce.number().int().min(1).max(20).default(5),
  lockout_duration_minutes: z.coerce.number().int().min(1).max(1440).default(30),
  session_timeout_minutes: z.coerce.number().int().min(5).max(1440).default(60),
  enable_two_factor_auth: z.boolean().default(false),
  enable_captcha: z.boolean().default(true),
  enable_ip_blocking: z.boolean().default(false),
  jwt_secret: z.string().optional(),
})

type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>

interface SecuritySettingsProps {
  settings: any
  onSave: (values: SecuritySettingsValues) => void
  isLoading: boolean
}

export function SecuritySettings({ settings, onSave, isLoading }: SecuritySettingsProps) {
  const form = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      password_min_length: settings?.password_min_length || 8,
      password_require_uppercase: settings?.password_require_uppercase ?? true,
      password_require_lowercase: settings?.password_require_lowercase ?? true,
      password_require_number: settings?.password_require_number ?? true,
      password_require_special: settings?.password_require_special ?? true,
      max_login_attempts: settings?.max_login_attempts || 5,
      lockout_duration_minutes: settings?.lockout_duration_minutes || 30,
      session_timeout_minutes: settings?.session_timeout_minutes || 60,
      enable_two_factor_auth: settings?.enable_two_factor_auth ?? false,
      enable_captcha: settings?.enable_captcha ?? true,
      enable_ip_blocking: settings?.enable_ip_blocking ?? false,
      jwt_secret: settings?.jwt_secret || "",
    },
  })

  function onSubmit(values: SecuritySettingsValues) {
    onSave(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="password_min_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Password Length</FormLabel>
                <FormControl>
                  <Input type="number" min="6" max="30" {...field} />
                </FormControl>
                <FormDescription>Minimum number of characters required for passwords.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_login_attempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Login Attempts</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="20" {...field} />
                </FormControl>
                <FormDescription>Number of failed login attempts before account lockout.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lockout_duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lockout Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="1440" {...field} />
                </FormControl>
                <FormDescription>Duration of account lockout after exceeding max login attempts.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="session_timeout_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Timeout (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="5" max="1440" {...field} />
                </FormControl>
                <FormDescription>Duration of user session before requiring re-login.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jwt_secret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JWT Secret</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormDescription>Secret key used for JWT token generation.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Password Requirements</h3>
            <FormField
              control={form.control}
              name="password_require_uppercase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Require Uppercase</FormLabel>
                    <FormDescription>Require at least one uppercase letter.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_require_lowercase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Require Lowercase</FormLabel>
                    <FormDescription>Require at least one lowercase letter.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_require_number"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Require Number</FormLabel>
                    <FormDescription>Require at least one number.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_require_special"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Require Special Character</FormLabel>
                    <FormDescription>Require at least one special character.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Features</h3>
            <FormField
              control={form.control}
              name="enable_two_factor_auth"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Two-Factor Authentication</FormLabel>
                    <FormDescription>Enable two-factor authentication for users.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_captcha"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>CAPTCHA Protection</FormLabel>
                    <FormDescription>Enable CAPTCHA on login and registration forms.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_ip_blocking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>IP Blocking</FormLabel>
                    <FormDescription>Block suspicious IP addresses automatically.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Security Settings"}
        </Button>
      </form>
    </Form>
  )
}
