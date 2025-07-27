import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import BookingDetails from "@/components/admin/bookings/booking-details"
import BookingTimeline from "@/components/admin/bookings/booking-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit } from "lucide-react"
import Link from "next/link"
import { generatePageMetadata } from "@/lib/metadata"

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  return generatePageMetadata(`Booking #${params.id} | Admin Dashboard`, "View and manage booking details")
}

export default async function BookingDetailPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Redirect to the new booking page if the ID is "new"
  if (params.id === "new") {
    return redirect("/admin/bookings/new")
  }

  try {
    // Fetch booking with related data
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        users:user_id (id, full_name, email, phone_number, avatar_url),
        cars:car_id (id, name, brand, images, price_per_day, specs)
      `,
      )
      .eq("id", params.id)
      .single()

    if (error || !booking) {
      console.error("Error fetching booking:", error)
      notFound()
    }

    // Fetch payment information
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", params.id)
      .order("created_at", { ascending: false })
      .maybeSingle()

    // Fetch booking history/timeline
    const { data: timeline } = await supabase
      .from("booking_history")
      .select("*")
      .eq("booking_id", params.id)
      .order("created_at", { ascending: true })

    // Ensure timeline is an array
    const safeTimeline = Array.isArray(timeline) ? timeline : []

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Bookings
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
          </div>
          <Button asChild>
            <Link href={`/admin/bookings/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Booking
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BookingDetails booking={booking} payment={payment} />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
                <CardDescription>History of actions and status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingTimeline timeline={safeTimeline} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in booking detail page:", error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Error loading booking details</h2>
        <p className="text-red-600 mt-2">There was a problem loading this booking. Please try again later.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/admin/bookings">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Bookings
          </Link>
        </Button>
      </div>
    )
  }
}
