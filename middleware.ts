import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files, API routes, and auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return res
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected admin routes
    if (pathname.startsWith("/admin")) {
      if (!session) {
        return NextResponse.redirect(new URL("/auth/signin?redirect=" + pathname, req.url))
      }

      // Check if user has admin role
      try {
        const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (userData?.role !== "admin") {
          return NextResponse.redirect(new URL("/unauthorized", req.url))
        }
      } catch (error) {
        console.error("Error checking admin role:", error)
        // If we can't verify the role, redirect to unauthorized
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Protected dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL("/auth/signin?redirect=" + pathname, req.url))
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
