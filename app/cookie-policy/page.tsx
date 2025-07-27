import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"
import { generatePageMetadata } from "@/lib/metadata"

// Make this page explicitly dynamic
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return generatePageMetadata("Cookie Policy", "Cookie policy for our car rental service")
}

export default async function CookiePolicyPage() {
  // Use client component client instead of server client
  const supabase = createClientComponentClient()

  // Fetch cookie policy page content
  // Fix: Remove the double .eq() issue
  const { data: content, error } = await supabase.from("content").select("*").eq("type", "cookie").single()

  if (error) {
    console.error("Error fetching cookie policy page content:", error)
    notFound()
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">{content?.title || "Cookie Policy"}</h1>
      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content?.content || "<p>Content not available</p>" }}
      />

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Last updated: {new Date(content?.updated_at || new Date()).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
