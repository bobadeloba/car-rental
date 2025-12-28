import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { StarIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { TestimonialForm } from "@/components/testimonials/testimonial-form"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata(
    "Customer Testimonials",
    "Read what our customers have to say about their experience with our luxury car rental service.",
  )
}

async function getApprovedTestimonials() {
  const supabase = await getSupabaseServer()

  try {
    // First try to use the view
    const { data: viewData, error: viewError } = await supabase
      .from("approved_testimonials")
      .select("*")
      .order("created_at", { ascending: false })

    // If the view exists and we got data, return it
    if (!viewError) {
      return viewData || []
    }

    // If the view doesn't exist, try a direct query
    if (viewError && viewError.message.includes("does not exist")) {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, full_name, rating, comment, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching testimonials:", error)
        return []
      }

      return data || []
    }

    console.error("Error fetching from approved_testimonials view:", viewError)
    return []
  } catch (error) {
    console.error("Error in getApprovedTestimonials:", error)
    return []
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getApprovedTestimonials()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Customer Testimonials</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
          Don't just take our word for it. Here's what our customers have to say about their experience with our luxury
          car rental service.
        </p>

        {testimonials.length === 0 ? (
          <div className="text-center p-8 border rounded-lg mb-12">
            <h3 className="text-lg font-medium">No testimonials yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          testimonial.rating > i ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 flex-grow mb-4">"{testimonial.comment}"</p>

                  <div className="mt-auto flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 relative overflow-hidden">
                      <Image src="/diverse-user-avatars.png" alt="User avatar" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Share Your Experience</h2>
          <TestimonialForm />
        </div>
      </div>
    </div>
  )
}
