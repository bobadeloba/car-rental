import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
          },
        },
      },
    )

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
