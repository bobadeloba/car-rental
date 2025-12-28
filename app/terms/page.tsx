import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Terms and Conditions", "Terms and conditions for using our car rental service")
}

export default async function TermsPage() {
  const supabase = await createServerClient()

  // Fetch terms page content
  const { data: content, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", "terms")
    .eq("language", "en")
    .single()

  if (error) {
    console.error("Error fetching terms page content:", error)
    notFound()
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">{content?.title || "Terms and Conditions"}</h1>
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
