import { getSupabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit } from "lucide-react"
import UserBookings from "@/components/admin/users/user-bookings"
import UserDocuments from "@/components/admin/users/user-documents"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()
  const { data: user } = await supabase.from("users").select("*").eq("id", id).single()

  if (!user) {
    return {
      title: "User Not Found | Admin Dashboard",
      description: "The requested user could not be found",
    }
  }

  return {
    title: `${user.full_name} | Admin Dashboard`,
    description: `User details for ${user.full_name}`,
  }
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  // Fetch user details
  const { data: user } = await supabase.from("users").select("*").eq("id", id).single()

  if (!user) {
    notFound()
  }

  // Fetch user bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, cars(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch user documents
  const { data: documents } = await supabase
    .from("user_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">User Profile: {user.full_name}</h1>
        <Button asChild>
          <Link href={`/admin/users/${user.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit User
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&size=128`}
                  alt={user.full_name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="font-medium">{user.full_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                <p className="font-medium">{user.phone_number || "Not provided"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loyalty Points</p>
                <p className="font-medium">{user.loyalty_points}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="font-medium">{format(new Date(user.created_at), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserBookings bookings={bookings || []} userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>User Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserDocuments documents={documents || []} userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
