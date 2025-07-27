import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
      authentication: {
        hasUser: !!user,
        userEmail: user?.email,
        userRole: user?.user_metadata?.role,
        authError: authError?.message,
      },
      database: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      },
    }

    // Test database connection
    try {
      const { data: testQuery, error: testError } = await supabase.from("page_views").select("count").limit(1)

      debugInfo.database.connection = testError ? `Error: ${testError.message}` : "Success"
      debugInfo.database.hasPageViews = !!testQuery
    } catch (error) {
      debugInfo.database.connection = `Exception: ${error.message}`
    }

    // Test views
    try {
      const { data: viewTest, error: viewError } = await supabase.from("page_view_stats").select("count").limit(1)

      debugInfo.database.hasViews = !viewError
      debugInfo.database.viewError = viewError?.message
    } catch (error) {
      debugInfo.database.viewException = error.message
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
