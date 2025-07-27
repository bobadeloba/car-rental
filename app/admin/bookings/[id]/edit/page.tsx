import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import BookingEditForm from "@/components/admin/bookings/booking-edit-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditBookingPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch booking with related data
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users:user_id (id, full_name, email, phone_number),
      cars:car_id (id, name, brand, price_per_day)
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !booking) {
    console.error("Error fetching booking:", error)
    notFound()
  }

  // Fetch all users for dropdown
  const { data: users } = await supabase.from("users").select("id, full_name, email").order("full_name")

  // Fetch all cars for dropdown
  const { data: cars } = await supabase
    .from("cars")
    .select("id, name, brand, price_per_day, availability_status")
    .order("brand")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/bookings/${params.id}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Booking
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Booking</h1>
      </div>

      <BookingEditForm booking={booking} users={users || []} cars={cars || []} />
    </div>
  )
}
