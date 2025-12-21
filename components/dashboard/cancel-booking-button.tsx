"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

      if (error) throw error

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" className="w-full" onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Cancel Booking
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Cancellation fees may apply depending on how close to the pickup date you
              are cancelling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
