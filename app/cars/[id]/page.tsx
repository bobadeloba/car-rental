import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import CarGallery from "@/components/cars/car-gallery"
import CarSpecifications from "@/components/cars/car-specifications"
import BookingForm from "@/components/cars/booking-form"
import RelatedCars from "@/components/cars/related-cars"
import WhatsappButton from "@/components/whatsapp-button"
import { CarDetailTracker } from "@/components/cars/car-detail-tracker"
import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/metadata"
import { isUUID } from "@/lib/slug-utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createServerClient()

    // Try to find car by slug first, then by UUID
    let car
    if (isUUID(id)) {
      const { data } = await supabase.from("cars").select("*").eq("id", id).single()
      car = data
    } else {
      const { data } = await supabase.from("cars").select("*").eq("slug", id).single()
      car = data
    }

    const title = car ? `${car.brand} ${car.name} - Luxury Car Rental` : "Car Details"
    const description = car
      ? `Rent the ${car.brand} ${car.name} - ${car.details?.substring(0, 150) || "Premium luxury car rental"}...`
      : "View detailed information about this luxury rental car"

    return generatePageMetadata(title, description)
  } catch (error) {
    console.error("Error generating car metadata:", error)
    return generatePageMetadata("Car Details", "View detailed information about this luxury rental car")
  }
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  try {
    let car
    let shouldRedirect = false

    // Check if the ID is a UUID or slug
    if (isUUID(id)) {
      // If it's a UUID, get the car and redirect to slug URL
      const { data, error } = await supabase.from("cars").select("*").eq("id", id).single()

      if (error || !data) {
        console.error("Error fetching car by UUID:", error)
        notFound()
      }

      car = data
      shouldRedirect = true
    } else {
      // If it's a slug, get the car directly
      const { data, error } = await supabase.from("cars").select("*").eq("slug", id).single()

      if (error || !data) {
        console.error("Error fetching car by slug:", error)
        notFound()
      }

      car = data
    }

    // Redirect UUID URLs to slug URLs for SEO
    if (shouldRedirect && car.slug) {
      redirect(`/cars/${car.slug}`)
    }

    // Ensure price_per_day is a valid number
    const validPricePerDay = typeof car.price_per_day === "number" && !isNaN(car.price_per_day) ? car.price_per_day : 0

    // Get unavailable dates
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, start_date, end_date")
      .eq("car_id", car.id)
      .in("status", ["confirmed", "pending"])

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CarDetailTracker carId={car.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CarGallery images={car.images || []} carName={`${car.brand} ${car.name}`} />

            <div>
              <h1 className="text-3xl font-bold mb-2">
                {car.brand} {car.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{car.details}</p>

              <CarSpecifications specs={car.specs || {}} />
            </div>

            <div className="lg:hidden">
              <BookingForm carId={car.id} pricePerDay={validPricePerDay} existingBookings={bookings || []} />
            </div>

            <RelatedCars currentCarId={car.id} category={car.category} />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingForm carId={car.id} pricePerDay={validPricePerDay} existingBookings={bookings || []} />
            </div>
          </div>
        </div>

        <WhatsappButton />
      </div>
    )
  } catch (error) {
    console.error("Error in car detail page:", error)
    notFound()
  }
}
