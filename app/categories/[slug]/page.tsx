import { getSupabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import CarsList from "@/components/cars/cars-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params
  const supabase = getSupabaseServer()

  try {
    // Handle UUID format slugs (which would never be valid category names)
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return {
        title: "Category Not Found",
        description: "The requested category could not be found",
      }
    }

    // Convert slug to category name format
    const categoryName = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    // Find the category by name
    const { data: category, error } = await supabase.from("categories").select("*").ilike("name", categoryName).single()

    if (error || !category) {
      // Try to find by ID as fallback
      const { data: categoryById, error: errorById } = await supabase
        .from("categories")
        .select("*")
        .eq("id", slug)
        .single()

      if (errorById || !categoryById) {
        return {
          title: "Category Not Found",
          description: "The requested category could not be found",
        }
      }

      return {
        title: `${categoryById.name} | Car Rental`,
        description:
          categoryById.description || `Browse our collection of ${categoryById.name.toLowerCase()} available for rent`,
      }
    }

    return {
      title: `${category.name} | Car Rental`,
      description: category.description || `Browse our collection of ${category.name.toLowerCase()} available for rent`,
    }
  } catch (error) {
    console.error("Error fetching category for metadata:", error)
    return {
      title: "Category Not Found",
      description: "The requested category could not be found",
    }
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const supabase = getSupabaseServer()

  // Handle UUID format slugs (which would never be valid category names)
  if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return notFound()
  }

  // Convert slug to category name format
  const categoryName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Find the category by name
  let { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .ilike("name", categoryName)
    .single()

  // If not found by name, try by ID
  if (categoryError || !category) {
    const { data: categoryById, error: errorById } = await supabase
      .from("categories")
      .select("*")
      .eq("id", slug)
      .single()

    if (errorById || !categoryById) {
      console.error("Category not found:", categoryError?.message || "No category data")
      return notFound()
    }

    category = categoryById
  }

  // Get cars in this category - using a direct join query
  const { data: cars, error: carsError } = await supabase
    .from("cars")
    .select(`
      *,
      car_categories!inner(category_id)
    `)
    .eq("car_categories.category_id", category.id)
    .order("name")

  if (carsError) {
    console.error("Error fetching cars by category:", carsError)
    // Continue with empty cars array instead of failing
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/cars">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to all cars
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{category.description}</p>}
        </div>

        {cars && cars.length > 0 ? (
          <CarsList cars={cars} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No cars available in this category</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're currently updating our inventory. Please check back soon or explore other categories.
            </p>
            <Button asChild>
              <Link href="/cars">Browse All Cars</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
