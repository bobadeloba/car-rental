import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import PaymentForm from "@/components/payment/payment-form"
import BookingSummary from "@/components/payment/booking-summary"
import { getCompanyName } from "@/lib/company-name"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const companyName = await getCompanyName()

  return {
    title: `Payment | ${companyName}`,
    description: "Complete your payment to confirm your booking",
  }
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/bookings/" + id + "/payment")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      cars:car_id (
        id,
        name,
        brand,
        price_per_day,
        images
      )
    `)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single()

  if (!booking) {
    notFound()
  }

  // Check if payment is already completed
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", id)
    .eq("payment_status", "completed")
    .maybeSingle()

  if (payment) {
    redirect("/dashboard/bookings/" + id)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete your payment to confirm your booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PaymentForm bookingId={booking.id} userId={session.user.id} amount={booking.total_price} />
        </div>
        <div className="lg:col-span-1">
          <BookingSummary booking={booking} />
        </div>
      </div>
    </div>
  )
}
