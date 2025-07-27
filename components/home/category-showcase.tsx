"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  description?: string
  slug?: string
  image_url?: string
}

// Sample categories to use as fallback
const sampleCategories = [
  {
    id: "1",
    name: "Luxury Sedans",
    description: "Experience ultimate comfort with our premium luxury sedans",
    slug: "luxury-sedans",
  },
  {
    id: "2",
    name: "Sports Cars",
    description: "Feel the thrill of driving high-performance sports cars",
    slug: "sports-cars",
  },
  {
    id: "3",
    name: "SUVs",
    description: "Spacious and versatile SUVs for any adventure",
    slug: "suvs",
  },
]

export default function CategoryShowcase({ categories: initialCategories = [] }: { categories?: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [isLoading, setIsLoading] = useState(initialCategories?.length === 0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  // Use custom images for all categories
  const categoryImages: Record<string, string> = {
    convertibles: "/luxury-convertible.png",
    coupes: "/luxury-coupe.png",
    "economy cars": "/economy-car.png",
    "electric vehicles": "/electric-luxury-car.png",
    "muscle cars": "/muscle-car.png",
    sedans: "/luxury-black-sedan.png",
    "sports cars": "/sports-car.png",
    "super cars": "/supercar.png",
    suvs: "/premium-luxury-suv.png",
    luxury: "/luxury-car.png",
    // Additional categories with fallbacks
    compact: "/economy-car.png",
    hybrid: "/electric-luxury-car.png",
    minivan: "/family-van.png",
    pickup: "/pickup-truck.png",
    crossover: "/crossover-suv.png",
    classic: "/classic-car.png",
  }

  // Get image for a category with guaranteed working image
  const getCategoryImage = (category: Category) => {
    // If we've had an error with this category before, use placeholder
    if (imageErrors[category.id]) {
      return `/placeholder.svg?height=192&width=384&query=luxury+${category.name}+car`
    }

    // First check if the category has its own image_url
    if (category.image_url) {
      return category.image_url
    }

    // Use our custom images
    return getImageForCategory(category)
  }

  // Get appropriate image based on category name
  const getImageForCategory = (category: Category) => {
    const nameKey = category.name?.toLowerCase()
    if (nameKey && categoryImages[nameKey]) {
      return categoryImages[nameKey]
    }

    // Try to match partial names
    for (const key of Object.keys(categoryImages)) {
      if (nameKey && nameKey.includes(key)) {
        return categoryImages[key]
      }
    }

    // Default luxury car image
    return "/luxury-car-rental.png"
  }

  useEffect(() => {
    const fetchCategories = async () => {
      if (initialCategories?.length > 0) {
        setCategories(initialCategories)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error("Supabase client not available")
        }

        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) {
          throw error
        }

        // Add slug property to each category
        const categoriesWithSlugs =
          data?.map((category) => ({
            ...category,
            slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
          })) || []

        if (categoriesWithSlugs.length > 0) {
          setCategories(categoriesWithSlugs)
        } else {
          // Use sample categories if no data is returned
          setCategories(sampleCategories)
          setError("No categories found, using sample data")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories")
        // Use sample categories as fallback
        setCategories(sampleCategories)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [initialCategories])

  // Handle image error
  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [categoryId]: true,
    }))
  }

  // Generate slug for a category
  const getCategorySlug = (category: Category) => {
    // Use the slug property if it exists
    if (category.slug) {
      return category.slug
    }

    // Otherwise, generate a slug from the name
    return category.name?.toLowerCase().replace(/\s+/g, "-") || category.id
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find the perfect vehicle by category. We offer a wide range of options to suit your needs.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
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
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={getCategoryImage(category) || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(category.id)}
                    unoptimized // Disable image optimization to ensure images work
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                  </p>
                  <Button asChild className="w-full">
                    <Link href={`/categories/${getCategorySlug(category)}`}>View Category</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
