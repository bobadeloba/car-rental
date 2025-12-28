import { redirect } from "next/navigation"
import CarForm from "@/components/admin/cars/car-form"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Add New Car | Admin Dashboard", "Add a new car to your fleet")
}

export default async function NewCarPage() {
  const supabase = await createServerClient()

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return redirect("/auth/signin?callbackUrl=/admin/cars/new")
    }

    // Check if user is an admin - with error handling
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error("User data fetch error:", userError)
        throw userError
      }

      if (!userData || userData.role !== "admin") {
        return redirect("/unauthorized?message=You must be an admin to access this page")
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      // Fallback to a generic error page
      return redirect("/unauthorized?message=Error verifying permissions")
    }

    return (
      <div className="space-y-6 p-6">
        <Breadcrumbs items={[{ label: "Cars Management", href: "/admin/cars" }, { label: "Add New Car" }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/cars">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Cars
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Add New Car</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
          <div className="p-6">
            <CarForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in NewCarPage:", error)
    return redirect("/unauthorized?message=An unexpected error occurred")
  }
}
