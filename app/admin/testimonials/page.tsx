import { Suspense } from "react"
import { getSupabaseServer } from "@/lib/supabase/server"
import AdminTestimonialsTable from "@/components/admin/testimonials/testimonials-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, AlertTriangle } from "lucide-react"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Testimonials Management", "Review and manage customer testimonials")
}

export default async function AdminTestimonialsPage() {
  const supabase = getSupabaseServer()

  // Check if testimonials table exists
  const { error: testimonialError } = await supabase.from("testimonials").select("id").limit(1)

  if (testimonialError && testimonialError.message.includes("does not exist")) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Testimonials Table Missing
            </CardTitle>
            <CardDescription>The testimonials table is required for this feature</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Before managing testimonials, you need to set up the testimonials table.
            </p>
            <Button asChild>
              <Link href="/admin/setup-testimonials">Setup Testimonials Table</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground mt-2">Review, approve, and manage customer testimonials</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Customer Testimonials
          </CardTitle>
          <CardDescription>All testimonials submitted by customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading testimonials...</div>}>
            <AdminTestimonialsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
