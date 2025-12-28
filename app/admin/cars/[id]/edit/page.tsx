import { notFound, redirect } from "next/navigation"
import CarForm from "@/components/admin/cars/car-form"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { generatePageMetadata } from "@/lib/metadata"

interface EditCarPageProps {
  params: Promise<{ id: string }> // Made params a Promise for Next.js 15+
}

export async function generateMetadata({ params }: EditCarPageProps) {
  return generatePageMetadata("Edit Car | Admin Dashboard", "Edit car details")
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin?callbackUrl=/admin/cars/" + id + "/edit")
  }

  // Check if user is an admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/unauthorized?message=You must be an admin to access this page")
  }

  // Fetch car data
  const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching car:", error)
    notFound()
  }

  if (!car) {
    console.error("Car not found")
    notFound()
  }

  console.log("Car data fetched for edit:", car)

  return (
    <div className="space-y-6 p-6">
      <Breadcrumbs
        items={[
          { label: "Cars Management", href: "/admin/cars" },
          { label: `${car.brand} ${car.name}`, href: `/admin/cars/${id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/cars/${id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Car Details
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Car</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
        <div className="p-6">
          <CarForm car={car} />
        </div>
      </div>
    </div>
  )
}
