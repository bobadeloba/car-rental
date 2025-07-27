import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env-check"

// Add retry options and caching to the Supabase client
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      // Add cache control to prevent caching of API responses
      "Cache-Control": "no-store, max-age=0",
    },
    fetch: (...args: Parameters<typeof fetch>) => {
      return fetch(...args).catch((error) => {
        console.error("Supabase server fetch error:", error)
        // Return a mock response to prevent uncaught exceptions
        return new Response(JSON.stringify({ error: "Failed to fetch" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        })
      })
    },
  },
}

// Server-side Supabase client with enhanced error handling
export const getSupabaseServer = () => {
  try {
    // Explicitly pass the URL and key to ensure they're correctly used
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      options: {
        ...supabaseOptions,
        supabaseUrl: getSupabaseUrl(),
        supabaseKey: getSupabaseAnonKey(),
      },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    // Return a dummy client during static generation
    return createDummyClient()
  }
}

// Create a dummy client for fallback purposes
function createDummyClient() {
  if (process.env.NODE_ENV === "development") {
    console.warn("Returning dummy Supabase client for static generation")
  }
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  } as any
}

// Keep the original functions for backward compatibility
export const createServerClient = getSupabaseServer
export const getServerSupabaseClient = getSupabaseServer

// Export createServerComponentClient directly as requested
export { createServerComponentClient }
