import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { getSupabaseServer } from "@/lib/supabase/server"

interface Car {
  id: string
  name: string
  brand: string
  price_per_day: number
  images: string[]
  specs: any
  category?: string
}

interface RelatedCarsProps {
  currentCarId: string
  category?: string
  cars?: Car[]
}

export default async function RelatedCars({ currentCarId, category, cars: propCars }: RelatedCarsProps) {
  // If cars are provided as props, use them
  // Otherwise, fetch related cars based on multiple criteria
  let relatedCars = propCars

  if (!relatedCars) {
    const supabase = await getSupabaseServer()
    const query = supabase.from("cars").select("*").neq("id", currentCarId).limit(6)

    // First attempt: Get cars with the same category
    if (category) {
      const { data: categoryMatches } = await query.eq("category", category).limit(3)

      if (categoryMatches && categoryMatches.length >= 3) {
        relatedCars = categoryMatches
      } else if (categoryMatches && categoryMatches.length > 0) {
        // If some category matches found but not enough, get the current car to find other matching criteria
        const { data: currentCar } = await supabase.from("cars").select("*").eq("id", currentCarId).single()

        if (currentCar) {
          // Second attempt: Try to match by brand if we know the current car's brand
          const { data: brandMatches } = await supabase
            .from("cars")
            .select("*")
            .eq("brand", currentCar.brand)
            .neq("id", currentCarId)
            .limit(3 - (categoryMatches?.length || 0))

          // Combine the category matches with brand matches
          relatedCars = [...(categoryMatches || []), ...(brandMatches || [])]

          // Third attempt: If we still don't have enough cars, add some price-range matches
          if (relatedCars.length < 3 && currentCar.price_per_day) {
            // Get cars in a similar price range (±30%)
            const minPrice = currentCar.price_per_day * 0.7
            const maxPrice = currentCar.price_per_day * 1.3

            const { data: priceMatches } = await supabase
              .from("cars")
              .select("*")
              .gte("price_per_day", minPrice)
              .lte("price_per_day", maxPrice)
              .neq("id", currentCarId)
              .not("id", "in", `(${relatedCars.map((car) => `'${car.id}'`).join(",")})`)
              .limit(3 - relatedCars.length)

            relatedCars = [...relatedCars, ...(priceMatches || [])]
          }
        }
      }
    }

    // Final fallback: If we still don't have enough related cars, get random cars
    if (!relatedCars || relatedCars.length < 3) {
      const { data: randomCars } = await supabase.from("cars").select("*").neq("id", currentCarId).limit(3)

      relatedCars = randomCars
    }
  }

  // Ensure no duplicates in related cars
  if (relatedCars) {
    const uniqueIds = new Set()
    relatedCars = relatedCars.filter((car) => {
      if (uniqueIds.has(car.id)) return false
      uniqueIds.add(car.id)
      return true
    })
  }

  // If still no cars, return null or a message
  if (!relatedCars || relatedCars.length === 0) {
    return null
  }

  return (
    <section className="mt-16 relative">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

      {relatedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedCars.map((car) => (
            <Card key={car.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={car.images?.[0] || "/placeholder.svg?height=400&width=600&query=car"}
                  alt={`${car.brand} ${car.name}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold">{car.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{car.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrency(car.price_per_day)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">per day</p>
                  </div>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link href={`/cars/${car.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No related cars found</p>
        </div>
      )}
    </section>
  )
}
