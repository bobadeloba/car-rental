import { createSafeClient } from "@/lib/safe-supabase"
import { createServerClient } from "@/lib/supabase/server" // Import for admin client
import CarsList from "@/components/cars/cars-list"
import CarFilters from "@/components/cars/car-filters"
import Image from "next/image"
import { generatePageMetadata } from "@/lib/metadata"
import { PageTracker } from "@/components/analytics/page-tracker"

// Make this page explicitly dynamic
export const dynamic = "force-dynamic"

// Use generateMetadata instead of static metadata
export async function generateMetadata() {
  return generatePageMetadata("Cars", "Browse our collection of luxury and premium cars available for rent")
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createSafeClient() // For general data fetching
  const supabaseAdmin = createServerClient({ admin: true }) // For admin-specific data

  // Fetch WhatsApp phone number from admin settings
  let whatsappPhoneNumber: string | null = null
  try {
    const { data: adminSettingsData, error: adminSettingsError } = await supabaseAdmin
      .from("admin_settings")
      .select("whatsapp_phone")
      .single()

    if (adminSettingsError) {
      console.error("Error fetching admin_settings for WhatsApp:", adminSettingsError.message)
    } else if (adminSettingsData) {
      whatsappPhoneNumber = adminSettingsData.whatsapp_phone
    }
  } catch (e) {
    console.error("Exception fetching admin_settings:", e)
  }

  // Extract filter parameters
  const categoryId = searchParams.category as string | undefined
  const brand = searchParams.brand as string | undefined
  const minPriceParam = searchParams.minPrice ? Number(searchParams.minPrice as string) : undefined
  const maxPriceParam = searchParams.maxPrice ? Number(searchParams.maxPrice as string) : undefined
  const sortBy = searchParams.sortBy as string | undefined

  // Get price range from database
  const { data: priceData } = await supabase
    .from("cars")
    .select("price_per_day")
    .order("price_per_day", { ascending: true })

  // Set default min and max prices based on database values
  const lowestPrice = priceData && priceData.length > 0 ? priceData[0].price_per_day : 100
  const highestPrice = priceData && priceData.length > 0 ? priceData[priceData.length - 1].price_per_day : 5000

  // Use provided price params or defaults from database
  const minPrice = minPriceParam !== undefined ? minPriceParam : lowestPrice
  const maxPrice = maxPriceParam !== undefined ? maxPriceParam : highestPrice

  // Fetch all categories for filter
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Fetch all brands for filter
  const { data: brandsData } = await supabase.from("cars").select("brand").order("brand")
  const uniqueBrands = brandsData ? [...new Set(brandsData.map((car) => car.brand))].filter(Boolean) : []

  // Declare the cars variable
  let cars = []

  // FIXED APPROACH: Query cars based on category
  if (categoryId) {
    // First get the car IDs that belong to this category
    const { data: carCategoryData, error: categoryError } = await supabase
      .from("car_categories")
      .select("car_id")
      .eq("category_id", categoryId)

    if (categoryError) {
      console.error("Error fetching car categories:", categoryError)
    }

    if (carCategoryData && carCategoryData.length > 0) {
      const carIds = carCategoryData.map((item) => item.car_id)

      // Now fetch only the cars that belong to this category
      const { data: categoryCars, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .in("id", carIds)
        .gte("price_per_day", minPrice)
        .lte("price_per_day", maxPrice)
        .order(sortBy === "price-asc" ? "price_per_day" : sortBy === "price-desc" ? "price_per_day" : "name", {
          ascending: sortBy === "price-desc" ? false : true,
        })

      if (brand) {
        cars = categoryCars?.filter((car) => car.brand === brand) || []
      } else {
        cars = categoryCars || []
      }

      if (carsError) {
        console.error("Error fetching cars by category:", carsError)
      }
    }
  } else {
    // If no category is selected, fetch all cars with other filters
    let query = supabase.from("cars").select("*").gte("price_per_day", minPrice).lte("price_per_day", maxPrice)

    if (brand) {
      query = query.eq("brand", brand)
    }

    if (sortBy === "price-asc") {
      query = query.order("price_per_day", { ascending: true })
    } else if (sortBy === "price-desc") {
      query = query.order("price_per_day", { ascending: false })
    } else {
      query = query.order("name", { ascending: true })
    }

    const { data: allCars, error } = await query

    if (error) {
      console.error("Error fetching all cars:", error)
    }

    cars = allCars || []
  }

  // Use a placeholder image that's guaranteed to work
  const heroImageUrl = "/luxury-car-fleet.png"

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageTracker pageTitle="Cars - Browse Our Fleet" />
      {/* Hero section with updated background image */}
      <div className="relative w-full h-64 md:h-80 mb-8">
        <Image
          src={heroImageUrl || "/placeholder.svg"}
          alt="Our Premium Luxury Car Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Fleet</h1>
            <p className="text-xl text-white max-w-2xl mx-auto px-4">
              Browse our extensive collection of premium vehicles and find the perfect car for your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <CarFilters
              brands={uniqueBrands}
              categories={categories || []}
              selectedCategory={categoryId}
              selectedBrand={brand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              lowestPrice={lowestPrice}
              highestPrice={highestPrice}
              sortBy={sortBy}
            />
          </div>

          <div className="w-full lg:w-3/4 min-w-0">
            {cars.length > 0 ? (
              <CarsList cars={cars} whatsappPhoneNumber={whatsappPhoneNumber} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">No cars found</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {categoryId
                    ? "No cars available in this category. Try selecting a different category."
                    : "Try adjusting your filters to find the perfect car."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
