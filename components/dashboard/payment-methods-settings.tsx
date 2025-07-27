"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Trash2, Plus, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface PaymentMethod {
  id: string
  user_id: string
  card_type: string
  last_four: string
  expiry_month: string
  expiry_year: string
  is_default: boolean
  created_at: string
}

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(16, { message: "Card number must be 16 digits" })
    .max(16, { message: "Card number must be 16 digits" })
    .refine((val) => /^\d+$/.test(val), { message: "Card number must contain only digits" }),
  cardholderName: z.string().min(2, { message: "Cardholder name is required" }),
  expiryMonth: z
    .string()
    .min(1, { message: "Expiry month is required" })
    .max(2, { message: "Expiry month must be 1-2 digits" })
    .refine((val) => /^\d+$/.test(val), { message: "Expiry month must contain only digits" })
    .refine((val) => Number.parseInt(val) >= 1 && Number.parseInt(val) <= 12, {
      message: "Expiry month must be between 1-12",
    }),
  expiryYear: z
    .string()
    .min(4, { message: "Expiry year must be 4 digits" })
    .max(4, { message: "Expiry year must be 4 digits" })
    .refine((val) => /^\d+$/.test(val), { message: "Expiry year must contain only digits" })
    .refine((val) => Number.parseInt(val) >= new Date().getFullYear(), {
      message: "Expiry year must be in the future",
    }),
  cvv: z
    .string()
    .min(3, { message: "CVV must be 3-4 digits" })
    .max(4, { message: "CVV must be 3-4 digits" })
    .refine((val) => /^\d+$/.test(val), { message: "CVV must contain only digits" }),
})

type FormData = z.infer<typeof formSchema>

export default function PaymentMethodsSettings({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [userId])

  const fetchPaymentMethods = async () => {
    try {
      setIsFetching(true)

      // Check if payment_methods table exists
      const { data: tableExists } = await supabase.from("payment_methods").select("*").limit(1).maybeSingle()

      // If table doesn't exist yet, we'll create it later when adding a card
      if (tableExists === null) {
        setIsFetching(false)
        return
      }

      // Fetch user's payment methods
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })

      if (error) throw error

      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // In a real app, you would use a payment processor like Stripe
      // Here we'll just simulate storing the card details securely

      // Get card type based on first digit
      const cardType = getCardType(data.cardNumber)

      // Insert new payment method
      const { error } = await supabase.from("payment_methods").insert({
        user_id: userId,
        card_type: cardType,
        last_four: data.cardNumber.slice(-4),
        expiry_month: data.expiryMonth,
        expiry_year: data.expiryYear,
        is_default: paymentMethods.length === 0, // Make default if it's the first card
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully",
      })

      reset()
      setIsDialogOpen(false)
      fetchPaymentMethods()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)

      const { error } = await supabase.from("payment_methods").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Payment method removed",
        description: "Your payment method has been removed successfully",
      })

      fetchPaymentMethods()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const setAsDefault = async (id: string) => {
    try {
      // First, set all cards to non-default
      const { error: updateError } = await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", userId)

      if (updateError) throw updateError

      // Then set the selected card as default
      const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id)

      if (error) throw error

      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated successfully",
      })

      fetchPaymentMethods()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update default payment method. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCardType = (cardNumber: string) => {
    const firstDigit = cardNumber.charAt(0)

    switch (firstDigit) {
      case "4":
        return "Visa"
      case "5":
        return "Mastercard"
      case "3":
        return "American Express"
      case "6":
        return "Discover"
      default:
        return "Unknown"
    }
  }

  const getCardIcon = (cardType: string) => {
    return <CreditCard className="h-5 w-5" />
  }

  if (isFetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <Card key={method.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      {getCardIcon(method.card_type)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.card_type} •••• {method.last_four}
                        {method.is_default && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expires {method.expiry_month}/{method.expiry_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAsDefault(method.id)}
                        className="flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Set Default</span>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      disabled={deletingId === method.id}
                      className="flex items-center space-x-1"
                    >
                      {deletingId === method.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No payment methods</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't added any payment methods yet.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Payment Method</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new credit or debit card to your account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" {...register("cardNumber")} />
              {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input id="cardholderName" placeholder="John Doe" {...register("cardholderName")} />
              {errors.cardholderName && <p className="text-sm text-red-500">{errors.cardholderName.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month</Label>
                <Input id="expiryMonth" placeholder="MM" {...register("expiryMonth")} />
                {errors.expiryMonth && <p className="text-sm text-red-500">{errors.expiryMonth.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year</Label>
                <Input id="expiryYear" placeholder="YYYY" {...register("expiryYear")} />
                {errors.expiryYear && <p className="text-sm text-red-500">{errors.expiryYear.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" {...register("cvv")} />
                {errors.cvv && <p className="text-sm text-red-500">{errors.cvv.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
