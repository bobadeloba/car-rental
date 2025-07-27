"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw } from "lucide-react"

const apiSettingsSchema = z.object({
  enable_api: z.boolean().default(false),
  api_rate_limit: z.coerce.number().int().min(10).max(1000).default(100),
  api_key: z.string().optional(),
  google_maps_api_key: z.string().optional(),
  allowed_origins: z.string().optional(),
})

type ApiSettingsValues = z.infer<typeof apiSettingsSchema>

interface ApiSettingsProps {
  settings: any
  onSave: (values: ApiSettingsValues) => void
  isLoading: boolean
}

export function ApiSettings({ settings, onSave, isLoading }: ApiSettingsProps) {
  const form = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      enable_api: settings?.enable_api ?? false,
      api_rate_limit: settings?.api_rate_limit || 100,
      api_key: settings?.api_key || "",
      google_maps_api_key: settings?.google_maps_api_key || "",
      allowed_origins: settings?.allowed_origins || "",
    },
  })

  function onSubmit(values: ApiSettingsValues) {
    onSave(values)
  }

  function generateApiKey() {
    const randomString = Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")

    form.setValue("api_key", randomString)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="enable_api"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable API Access</FormLabel>
                <FormDescription>Allow external applications to access your platform via API.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="api_rate_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Rate Limit</FormLabel>
                <FormControl>
                  <Input type="number" min="10" max="1000" {...field} />
                </FormControl>
                <FormDescription>Maximum number of API requests per minute.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateApiKey}
                    title="Generate new API key"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  API key for authentication. Click the refresh button to generate a new key.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="google_maps_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Maps API Key</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>API key for Google Maps integration.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="allowed_origins"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Origins (CORS)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="https://example.com, https://app.example.com"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Comma-separated list of domains allowed to access your API.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save API Settings"}
        </Button>
      </form>
    </Form>
  )
}
