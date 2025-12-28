import { createServerClient } from "@/lib/supabase/server"
import BookingsTable from "@/components/admin/bookings/bookings-table"
import BookingsFilter from "@/components/admin/bookings/bookings-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import { generatePageMetadata } from "@/lib/metadata"

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    sortBy?: string
  }
}

export async function generateMetadata() {
  return generatePageMetadata("Bookings Management", "Manage your car rental bookings")
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()

  // Parse query parameters
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10
  const search = searchParams.search || ""
  const status = searchParams.status || ""
  const dateFrom = searchParams.dateFrom || ""
  const dateTo = searchParams.dateTo || ""
  const sortBy = searchParams.sortBy || "latest"

  // Build query
  let query = supabase.from("bookings").select(
    `
      *,
      users:user_id (full_name, email),
      cars:car_id (name, brand)
      `,
    { count: "exact" },
  )

  // Apply filters
  if (search) {
    query = query.or(
      `users.full_name.ilike.%${search}%,users.email.ilike.%${search}%,cars.name.ilike.%${search}%,cars.brand.ilike.%${search}%`,
    )
  }

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (dateFrom) {
    query = query.gte("start_date", dateFrom)
  }

  if (dateTo) {
    query = query.lte("end_date", dateTo)
  }

  // Apply sorting
  switch (sortBy) {
    case "date-asc":
      query = query.order("start_date", { ascending: true })
      break
    case "date-desc":
      query = query.order("start_date", { ascending: false })
      break
    case "price-asc":
      query = query.order("total_price", { ascending: true })
      break
    case "price-desc":
      query = query.order("total_price", { ascending: false })
      break
    case "latest":
    default:
      query = query.order("created_at", { ascending: false })
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: bookings, count, error } = await query.range(from, to)

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Bookings Management" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bookings Management</h1>
        <Button asChild>
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </Button>
      </div>

      <BookingsFilter />

      <BookingsTable bookings={bookings || []} count={count || 0} pageSize={pageSize} currentPage={page} />
    </div>
  )
}
