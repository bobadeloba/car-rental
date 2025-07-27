import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/dashboard/profile-form"

export default async function ProfilePage() {
  const supabase = getSupabaseServer()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard/profile")
  }

  const userId = session.user.id

  // Fetch user profile
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user:", userError)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
          <ProfileForm userId={userId} initialData={user || {}} />
        </div>
      </div>
    </div>
  )
}
