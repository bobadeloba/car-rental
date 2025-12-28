import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReviewForm from "@/components/dashboard/review-form"

export const metadata = {
  title: "Add Review | Kings Rental Cars",
  description: "Share your experience with a rental car",
}

export default async function AddReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await getSupabaseServer()
  const carId = params.carId as string | undefined

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/reviews/add")
  }

  // If carId is provided, get car details
  let car = null
  if (carId) {
    const { data } = await supabase.from("cars").select("*").eq("id", carId).single()
    car = data
  }

  // Get user's cars from completed bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, cars(*)")
    .eq("user_id", session.user.id)
    .eq("status", "completed")
    .order("end_date", { ascending: false })

  // Extract unique cars from bookings
  const rentedCars = bookings
    ? Array.from(new Map(bookings.map((booking) => [booking.cars.id, booking.cars])).values())
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experience with a rental car to help other customers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{car ? `Review for ${car.brand} ${car.name}` : "Select a car to review"}</CardTitle>
          <CardDescription>Please provide honest feedback about your rental experience</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm userId={session.user.id} selectedCarId={carId} rentedCars={rentedCars} />
        </CardContent>
      </Card>
    </div>
  )
}
