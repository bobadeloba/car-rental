import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import { ChevronLeft, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { generatePageMetadata } from "@/lib/metadata"

interface PageProps {
  params: Promise<{ id: string }> // Made params a Promise for Next.js 15+
}

export async function generateMetadata({ params }: PageProps) {
  return generatePageMetadata(`Car Details | Admin Dashboard`, "View and manage car details")
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params

  // Redirect to the new car page if the ID is "new"
  if (id === "new") {
    redirect("/admin/cars/new")
  }

  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin/cars/" + id)
  }

  // Check if user is an admin
  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (!user || user.role !== "admin") {
    redirect("/unauthorized?message=You must be an admin to access this page")
  }

  // Fetch car details
  const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error || !car) {
    console.error("Error fetching car:", error)
    notFound()
  }

  // Fetch active bookings for this car
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select(`
      id, 
      start_date, 
      end_date, 
      status,
      users:user_id (full_name, email)
    `)
    .eq("car_id", id)
    .in("status", ["confirmed", "pending"])
    .order("start_date", { ascending: true })

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"

    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "rented":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "reserved":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Cars Management", href: "/admin/cars" }, { label: `${car.brand} ${car.name}` }]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/cars">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Cars
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Car Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/cars/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Car
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {car.brand} {car.name}
                  </CardTitle>
                  <CardDescription>{car.category}</CardDescription>
                </div>
                <Badge className={`${getStatusColor(car.availability_status || car.status)} capitalize`}>
                  {car.availability_status || car.status || "Unknown"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-md overflow-hidden mb-6">
                {car.main_image || car.image ? (
                  <Image
                    src={car.main_image || car.image || "/placeholder.svg"}
                    alt={`${car.brand} ${car.name}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{car.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily Rate</p>
                      <p className="font-medium">{formatCurrency(car.price_per_day)}</p>
                    </div>
                    {car.specs?.seats && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Seats</p>
                        <p className="font-medium">{car.specs.seats}</p>
                      </div>
                    )}
                    {car.specs?.transmission && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transmission</p>
                        <p className="font-medium">{car.specs.transmission}</p>
                      </div>
                    )}
                    {car.specs?.fuel && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                        <p className="font-medium">{car.specs.fuel}</p>
                      </div>
                    )}
                  </div>
                </div>

                {car.specs?.optional_equipment && car.specs.optional_equipment.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium">Features</h3>
                    <ul className="grid grid-cols-2 gap-2 mt-2">
                      {car.specs.optional_equipment.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="h-4 w-4 text-green-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {car.images && car.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium">Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {car.images.map((image: string, index: number) => (
                        <div key={index} className="aspect-video relative rounded-md overflow-hidden">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${car.brand} ${car.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
              <CardDescription>Current and upcoming bookings for this car</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBookings && activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div key={booking.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.users?.full_name || "Unknown User"}</p>
                          <p className="text-sm text-gray-500">{booking.users?.email || "No email"}</p>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} capitalize`}>
                          {booking.status || "Unknown"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="font-medium">From:</span>{" "}
                          {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">To:</span>{" "}
                          {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-sm text-primary hover:underline">
                          View Booking Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active bookings for this car.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
