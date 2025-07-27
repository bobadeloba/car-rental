"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, CheckCircle } from "lucide-react"
import { processPayment } from "@/lib/payment-service"
import { CarLoader } from "@/components/ui/car-loader"

interface PaymentFormProps {
  bookingId: string
  userId: string
  amount: number
  onSuccess?: () => void
}

const formSchema = z.object({
  paymentMethod: z.enum(["credit_card", "debit_card"]),
  cardholderName: z.string().min(3, "Cardholder name is required"),
  cardNumber: z
    .string()
    .min(13, "Card number must be between 13-19 digits")
    .max(19, "Card number must be between 13-19 digits")
    .refine((val) => /^\d+$/.test(val.replace(/\s/g, "")), "Card number must contain only digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
})

export default function PaymentForm({ bookingId, userId, amount, onSuccess }: PaymentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true)

    try {
      const result = await processPayment(bookingId, userId, {
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        cardholderName: values.cardholderName,
        expiryDate: values.expiryDate,
        cvv: values.cvv,
        amount,
      })

      if (result.success) {
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully.",
        })
        setIsComplete(true)

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        } else {
          // Otherwise redirect to booking details
          setTimeout(() => {
            router.push(`/dashboard/bookings/${bookingId}`)
          }, 2000)
        }
      } else {
        toast({
          title: "Payment failed",
          description: result.error || "There was an error processing your payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Payment error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format card number with spaces for readability
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  if (isComplete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold">Payment Successful</h3>
            <p className="mb-6 text-gray-500">Your payment of ${amount.toFixed(2)} has been processed successfully.</p>
            <Button onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}>View Booking Details</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your payment to confirm your booking</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="credit_card" />
                        </FormControl>
                        <FormLabel className="font-normal">Credit Card</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="debit_card" />
                        </FormControl>
                        <FormLabel className="font-normal">Debit Card</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="4111 1111 1111 1111"
                        {...field}
                        value={formatCardNumber(field.value)}
                        onChange={(e) => {
                          field.onChange(formatCardNumber(e.target.value))
                        }}
                        maxLength={19}
                      />
                    </FormControl>
                    <FormDescription>Enter your 16-digit card number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          {...field}
                          value={formatExpiryDate(field.value)}
                          onChange={(e) => {
                            field.onChange(formatExpiryDate(e.target.value))
                          }}
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          {...field}
                          type="password"
                          maxLength={4}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, "")
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${amount.toFixed(2)}</span>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <CarLoader size="md" />
                <p className="text-gray-600 dark:text-gray-400">Processing your payment...</p>
              </div>
            ) : (
              <Button type="submit" className="w-full" disabled={isProcessing}>
                <CreditCard className="mr-2 h-4 w-4" /> Pay ${amount.toFixed(2)}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <p className="text-xs text-gray-500">
          Your payment information is secure. We use encryption to protect your data.
        </p>
      </CardFooter>
    </Card>
  )
}
