"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

type Testimonial = {
  id: string
  full_name: string
  rating: number
  comment: string
  created_at: string
}

// Sample testimonials to show when none are available
const sampleTestimonials = [
  {
    id: "sample-1",
    full_name: "John Smith",
    rating: 5,
    comment: "Exceptional service and beautiful cars. The delivery was on time and the car was in perfect condition.",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    full_name: "Sarah Johnson",
    rating: 5,
    comment:
      "I rented a luxury car for my anniversary and it made our day special. The staff was very professional and helpful.",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    full_name: "Michael Brown",
    rating: 4,
    comment: "Great experience overall. The car was clean and well-maintained. Will definitely use this service again.",
    created_at: new Date().toISOString(),
  },
]

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        if (!supabase) {
          throw new Error("Supabase client not available")
        }

        // First try to use the view
        let { data, error } = await supabase
          .from("approved_testimonials")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(9)

        // If the view doesn't exist, try the direct query
        if (error && error.message.includes("does not exist")) {
          console.log("approved_testimonials view doesn't exist, trying direct query")

          // Try a direct query with only the fields we need
          const response = await supabase
            .from("testimonials")
            .select("id, full_name, rating, comment, created_at")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(9)

          data = response.data
          error = response.error
        }

        if (error) {
          console.error("Error fetching testimonials:", error)
          setError("Failed to load testimonials")
          // Use sample data instead of returning
          setTestimonials(sampleTestimonials)
          setUsingSampleData(true)
          return
        }

        if (!data || data.length === 0) {
          console.log("No testimonials found, using sample data")
          setTestimonials(sampleTestimonials)
          setUsingSampleData(true)
        } else {
          console.log("Fetched testimonials:", data)
          setTestimonials(data)
          setUsingSampleData(false)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
        // Use sample data on error
        setTestimonials(sampleTestimonials)
        setUsingSampleData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  // Show loading skeleton
  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center mb-12">
            Don't just take our word for it. Here's what our customers have to say about their experience.
          </p>

          <div className="max-w-4xl mx-auto">
            <Card className="h-64 animate-pulse">
              <CardContent className="p-6 flex flex-col h-full"></CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">What Our Customers Say</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center mb-12">
          Don't just take our word for it. Here's what our customers have to say about their experience.
        </p>

        {usingSampleData && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error
                    ? "We're currently experiencing issues loading testimonials. Showing sample testimonials instead."
                    : "No customer testimonials yet. Showing sample testimonials."}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/testimonials">
                    <Plus className="mr-2 h-4 w-4" /> Add Your Testimonial
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative">
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="transition-transform duration-500 ease-in-out flex"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <Card className="h-full mx-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                            )}
                          />
                        ))}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 flex-grow mb-6 text-lg italic">
                        "{testimonial.comment}"
                      </p>

                      <div className="mt-auto flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 relative overflow-hidden">
                          <Image
                            src="/diverse-user-avatars.png"
                            alt="User avatar"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{testimonial.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === currentIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600",
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/testimonials">View All Testimonials</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
