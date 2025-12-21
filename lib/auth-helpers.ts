import { createClientComponentClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export async function handleOAuthUser(user: User) {
  const supabase = createClientComponentClient()

  try {
    // Check if user already exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      throw fetchError
    }

    // If user doesn't exist, create profile
    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: "customer",
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating OAuth user profile:", insertError)
        throw insertError
      }

      return { isNewUser: true, role: "customer" }
    }

    return { isNewUser: false, role: existingUser.role }
  } catch (error) {
    console.error("Error handling OAuth user:", error)
    throw error
  }
}

export function getRedirectUrl(role: string, intendedUrl?: string) {
  // If there's an intended URL (like a car booking page), use that
  if (intendedUrl && !intendedUrl.includes("/admin")) {
    return intendedUrl
  }

  // Otherwise, redirect based on role
  return role === "admin" ? "/admin" : "/dashboard"
}
