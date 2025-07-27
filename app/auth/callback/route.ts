import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=${error}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      const { data: authData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("OAuth callback error:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=oauth_callback_error`)
      }

      if (authData.user) {
        console.log("OAuth user authenticated:", {
          id: authData.user.id,
          email: authData.user.email,
          provider: authData.user.app_metadata?.provider,
        })

        // Check if user exists in our users table
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", authData.user.id)
          .single()

        // If user doesn't exist or query failed (except for "not found"), create a profile
        if (!existingUser && (!userError || userError.code === "PGRST116")) {
          const userData = {
            id: authData.user.id,
            email: authData.user.email || "",
            full_name:
              authData.user.user_metadata?.full_name ||
              authData.user.user_metadata?.name ||
              authData.user.email?.split("@")[0] ||
              "",
            avatar_url: authData.user.user_metadata?.avatar_url || authData.user.user_metadata?.picture || null,
            role: "customer",
            created_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabase.from("users").insert(userData)

          if (insertError) {
            console.error("Error creating user profile:", insertError)
            // Don't fail the login just because profile creation failed
          } else {
            console.log("Created new user profile for OAuth user")
          }
        }

        // Determine redirect destination
        let redirectTo = "/dashboard"

        // Check if user is admin (from existing users)
        if (existingUser?.role === "admin") {
          redirectTo = "/admin"
        }

        // Check for pending booking or custom redirect
        const redirectParam = requestUrl.searchParams.get("redirect_to")
        if (redirectParam) {
          redirectTo = redirectParam
        }

        console.log("Redirecting OAuth user to:", redirectTo)
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      }
    } catch (error) {
      console.error("OAuth processing error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=oauth_processing_error`)
    }
  }

  // If no code or other error, redirect to sign in
  console.log("No OAuth code received, redirecting to sign in")
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin`)
}
