"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Car {
  id: string
  name: string
  brand: string
  price_per_day: number
  images?: string[]
}

export function FeaturedCars({ cars: initialCars = [] }: { cars?: Car[] }) {
  const [cars, setCars] = useState<Car[]>(initialCars || [])
  const [isLoading, setIsLoading] = useState(initialCars?.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Fallback car images if database images are missing
  const fallbackImages = [
    "/images/cars/mercedes-s-class.jpg",
    "/images/cars/bmw-7-series.jpg",
    "/images/cars/audi-a8.png",
    "/images/cars/porsche-911.png",
    "/images/cars/range-rover.png",
    "/images/cars/bentley-continental.png",
  ]

  useEffect(() => {
    const fetchCars = async () => {
      if (initialCars?.length > 0) {
        setCars(initialCars)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        if (!supabase) {
          throw new Error("Supabase client not available")
        }

        const { data, error } = await supabase
          .from("cars")
          .select("id, name, brand, price_per_day, images")
          .order("price_per_day", { ascending: false })
          .limit(6)

        if (error) {
          throw error
        }

        setCars(data || [])
      } catch (error) {
        console.error("Error fetching featured cars:", error)
        setError("Failed to load featured cars")

        // Create sample cars as fallback
        const sampleCars = [
          { id: "1", name: "S-Class", brand: "Mercedes", price_per_day: 299, images: [] },
          { id: "2", name: "7 Series", brand: "BMW", price_per_day: 279, images: [] },
          { id: "3", name: "A8", brand: "Audi", price_per_day: 259, images: [] },
          { id: "4", name: "911", brand: "Porsche", price_per_day: 349, images: [] },
          { id: "5", name: "Range Rover", brand: "Land Rover", price_per_day: 289, images: [] },
          { id: "6", name: "Continental GT", brand: "Bentley", price_per_day: 399, images: [] },
        ]
        setCars(sampleCars)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [initialCars])

  // Function to get an image for a car (either from DB or fallback)
  const getCarImage = (car: Car, index: number) => {
    if (car.images && car.images.length > 0 && car.images[0]) {
      return car.images[0]
    }
    return fallbackImages[index % fallbackImages.length]
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Luxury Cars</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our selection of premium vehicles available for rent. From sports cars to luxury sedans, we have the
            perfect car for your needs.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, index) => (
              <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={getCarImage(car, index) || "/placeholder.svg"}
                    alt={`${car.brand} ${car.name}`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      // Fallback to a placeholder if the image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=192&width=384&query=luxury+${car.brand}+${car.name}`
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {car.brand} {car.name}
                  </h3>
                  <p className="text-primary font-bold mb-4">${car.price_per_day} / day</p>
                  <Button asChild className="w-full">
                    <Link href={`/cars/${car.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No featured cars available at the moment.</p>
            <Button asChild>
              <Link href="/cars">Browse All Cars</Link>
            </Button>
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/cars">View All Cars</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
