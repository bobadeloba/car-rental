"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const paymentSettingsSchema = z.object({
  payment_gateway: z.string().min(1, {
    message: "Please select a payment gateway.",
  }),
  currency: z.string().min(1, {
    message: "Please select a currency.",
  }),
  enable_stripe: z.boolean().default(true),
  enable_paypal: z.boolean().default(false),
  enable_bank_transfer: z.boolean().default(false),
  enable_cash_payment: z.boolean().default(false),
  deposit_percentage: z.coerce.number().min(0).max(100).default(20),
  tax_percentage: z.coerce.number().min(0).max(100).default(5),
  stripe_public_key: z.string().optional(),
  stripe_secret_key: z.string().optional(),
  stripe_webhook_secret: z.string().optional(),
  paypal_client_id: z.string().optional(),
  paypal_client_secret: z.string().optional(),
  bank_account_details: z.string().optional(),
})

type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>

interface PaymentSettingsProps {
  settings: any
  onSave: (values: PaymentSettingsValues) => void
  isLoading: boolean
}

export function PaymentSettings({ settings, onSave, isLoading }: PaymentSettingsProps) {
  const form = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      payment_gateway: settings?.payment_gateway || "stripe",
      currency: settings?.currency || "USD",
      enable_stripe: settings?.enable_stripe ?? true,
      enable_paypal: settings?.enable_paypal ?? false,
      enable_bank_transfer: settings?.enable_bank_transfer ?? false,
      enable_cash_payment: settings?.enable_cash_payment ?? false,
      deposit_percentage: settings?.deposit_percentage || 20,
      tax_percentage: settings?.tax_percentage || 5,
      stripe_public_key: settings?.stripe_public_key || "",
      stripe_secret_key: settings?.stripe_secret_key || "",
      stripe_webhook_secret: settings?.stripe_webhook_secret || "",
      paypal_client_id: settings?.paypal_client_id || "",
      paypal_client_secret: settings?.paypal_client_secret || "",
      bank_account_details: settings?.bank_account_details || "",
    },
  })

  function onSubmit(values: PaymentSettingsValues) {
    onSave(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="payment_gateway"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Payment Gateway</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment gateway" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The default payment method for your platform.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The currency used for payments.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deposit_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deposit Percentage</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.01" {...field} />
                </FormControl>
                <FormDescription>Percentage of total amount required as deposit.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Percentage</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.01" {...field} />
                </FormControl>
                <FormDescription>Percentage of tax applied to bookings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Methods</h3>
            <FormField
              control={form.control}
              name="enable_stripe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Stripe</FormLabel>
                    <FormDescription>Accept payments via Stripe.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_paypal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>PayPal</FormLabel>
                    <FormDescription>Accept payments via PayPal.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_bank_transfer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Bank Transfer</FormLabel>
                    <FormDescription>Accept payments via bank transfer.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_cash_payment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Cash Payment</FormLabel>
                    <FormDescription>Accept cash payments on pickup.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Stripe Configuration</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="stripe_public_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Public Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stripe_secret_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stripe_webhook_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Webhook Secret</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">PayPal Configuration</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="paypal_client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PayPal Client ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paypal_client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PayPal Client Secret</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Bank Transfer Details</h3>
          <FormField
            control={form.control}
            name="bank_account_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Bank: Example Bank
Account Name: Car Rental Platform
Account Number: 1234567890
Sort Code: 12-34-56
IBAN: GB12ABCD12345612345678"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Bank account details for bank transfers.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Payment Settings"}
        </Button>
      </form>
    </Form>
  )
}
