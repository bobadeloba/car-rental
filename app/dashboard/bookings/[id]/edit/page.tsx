import { notFound, redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { BookingEditForm } from "@/components/dashboard/booking-edit-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCompanyName } from "@/lib/company-name"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const companyName = await getCompanyName()

  return {
    title: `Edit Booking | ${companyName}`,
    description: "Edit your car rental booking details",
  }
}

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard/bookings")
  }

  const userId = session.user.id

  // Fetch booking data
  const { data: booking, error } = await supabase
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
    .eq("id", params.id)
    .eq("user_id", userId)
    .single()

  if (error || !booking) {
    console.error("Error fetching booking:", error)
    notFound()
  }

  // Fetch available cars for dropdown
  const { data: cars } = await supabase
    .from("cars")
    .select("id, name, brand, price_per_day, availability_status")
    .order("brand", { ascending: true })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/bookings">Bookings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/bookings/${params.id}`}>Booking Details</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Booking</h1>
        <BookingEditForm booking={booking} cars={cars || []} />
      </div>
    </div>
  )
}
