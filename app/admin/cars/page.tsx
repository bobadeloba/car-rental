import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Breadcrumbs from "@/components/admin/shared/breadcrumbs"
import CarsTable from "@/components/admin/cars/cars-table"
import CarsFilter from "@/components/admin/cars/cars-filter"
import EmptyState from "@/components/admin/shared/empty-state"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Cars Management", "Manage your car fleet")
}

export default function CarsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse search parameters
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const category = typeof searchParams.category === "string" ? searchParams.category : ""
  const status = typeof searchParams.status === "string" ? searchParams.status : ""
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "created_at:desc"

  // Create a clean searchParams object with the correct types
  const cleanSearchParams = {
    search,
    category,
    status,
    sort,
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Cars", href: "/admin/cars" },
          ]}
        />
        <Link href="/admin/cars/new" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>

      <CarsFilter searchParams={cleanSearchParams} />

      <Suspense fallback={<div>Loading...</div>}>
        <CarsTable
          page={page}
          search={search}
          category={category}
          status={status}
          emptyState={
            <EmptyState
              title="No cars found"
              description="Get started by adding a new car to your fleet."
              link="/admin/cars/new"
              linkText="Add New Car"
            />
          }
        />
      </Suspense>
    </div>
  )
}
