import { getSupabaseServer } from "@/lib/supabase/server"
import UsersTable from "@/components/admin/users/users-table"
import UsersFilter from "@/components/admin/users/users-filter"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { generatePageMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  return generatePageMetadata("Manage Users | Admin Dashboard", "Manage users in the Kings Rental Cars admin dashboard")
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await getSupabaseServer()
  const params = await searchParams

  // Extract filter parameters
  const search = params.search as string | undefined
  const role = params.role as string | undefined
  const sortBy = params.sortBy as string | undefined
  const page = params.page ? Number.parseInt(params.page as string) : 1
  const pageSize = 10

  // Build query
  let query = supabase.from("users").select("*", { count: "exact" })

  // Apply filters
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role) {
    query = query.eq("role", role)
  }

  // Apply sorting
  if (sortBy === "name-asc") {
    query = query.order("full_name", { ascending: true })
  } else if (sortBy === "name-desc") {
    query = query.order("full_name", { ascending: false })
  } else if (sortBy === "loyalty-asc") {
    query = query.order("loyalty_points", { ascending: true })
  } else if (sortBy === "loyalty-desc") {
    query = query.order("loyalty_points", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  // Execute query
  const { data: users, count, error } = await query

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Users Management" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your platform users</p>
        </div>
        <Link href="/admin/users/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>

      <UsersFilter />

      <UsersTable users={users || []} count={count || 0} pageSize={pageSize} currentPage={page} />
    </div>
  )
}
