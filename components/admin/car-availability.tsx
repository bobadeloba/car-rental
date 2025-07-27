import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"

interface Car {
  id: string
  make?: string
  brand?: string
  model?: string
  name?: string
  year?: number
  status?: string
  availability_status?: string
}

interface CarAvailabilityProps {
  cars: Car[]
}

export function CarAvailability({ cars }: CarAvailabilityProps) {
  // Function to get the best available car image based on brand and model
  const getCarImage = (car: Car): string => {
    const brand = car.brand || car.make || ""
    const model = car.model || car.name || ""

    // Generate a placeholder image with the car details
    return `/placeholder.svg?height=64&width=64&query=${brand} ${model} luxury car`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Car Availability</CardTitle>
        <Link href="/admin/cars" className="text-sm text-blue-500 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cars.length === 0 ? (
            <p className="text-center text-muted-foreground">No cars available</p>
          ) : (
            cars.map((car) => (
              <div
                key={car.id}
                className="flex flex-col space-y-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Image
                    src={getCarImage(car) || "/placeholder.svg"}
                    alt={`${car.brand || car.make || "Unknown"} ${car.model || car.name || "Car"}`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate font-medium">
                      {car.brand || car.make || "Unknown"} {car.model || car.name || ""} {car.year || ""}
                    </p>
                    <StatusBadge status={car.status || car.availability_status || "unknown"} />
                  </div>
                </div>
                <Link
                  href={`/admin/cars/${car.id}`}
                  className="mt-2 w-full rounded-md bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:mt-0 sm:w-auto"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
