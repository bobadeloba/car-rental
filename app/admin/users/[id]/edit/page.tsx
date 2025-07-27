import { getSupabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import UserEditForm from "@/components/admin/users/user-edit-form"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const { data: user } = await supabase.from("users").select("*").eq("id", params.id).single()

  if (!user) {
    return {
      title: "User Not Found | Admin Dashboard",
      description: "The requested user could not be found",
    }
  }

  return {
    title: `Edit ${user.full_name} | Admin Dashboard`,
    description: `Edit user details for ${user.full_name}`,
  }
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  // Fetch user details
  const { data: user } = await supabase.from("users").select("*").eq("id", params.id).single()

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={`/admin/users/${user.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to User Details
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Edit User: {user.full_name}</h1>
        <p className="text-gray-600 dark:text-gray-400">Update user information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Edit the user's personal information and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
