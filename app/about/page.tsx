import { createClientComponentClient } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import Image from "next/image"
import { generatePageMetadata } from "@/lib/metadata"
import { PageTracker } from "@/components/analytics/page-tracker"

// Mark this page as dynamic to prevent static rendering issues with cookies
export const dynamic = "force-dynamic"

// Use generateMetadata instead of static metadata
export async function generateMetadata() {
  return generatePageMetadata("About Us", "Learn more about our car rental service, our mission, and our team")
}

export default async function AboutPage() {
  // Use createClientComponentClient instead of createServerClient
  const supabase = createClientComponentClient()

  // Fetch about page content
  const { data: content, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", "about")
    .eq("language", "en")
    .single()

  if (error) {
    console.error("Error fetching about page content:", error)
    notFound()
  }

  // Use a placeholder image that's guaranteed to work
  const heroImageUrl = "/luxury-car-showroom.png"

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <PageTracker pageTitle="About Us" />
      {/* Hero section with updated background image */}
      <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
        <Image
          src={heroImageUrl || "/placeholder.svg"}
          alt="Our Luxury Car Showroom"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{content?.title || "About Us"}</h1>
        </div>
      </div>

      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content?.content || "<p>Content not available</p>" }}
      />
    </div>
  )
}
