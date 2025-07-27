"use client"

import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentButton() {
  const { toast } = useToast()

  const handlePaymentClick = () => {
    toast({
      title: "Payment Feature in Development",
      description: "We're currently working on integrating our payment system. Thank you for your patience!",
      duration: 5000,
    })
  }

  return (
    <Button onClick={handlePaymentClick}>
      <CreditCard className="mr-2 h-4 w-4" /> Complete Payment
    </Button>
  )
}
