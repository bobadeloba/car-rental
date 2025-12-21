import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env-check"

// Server-side Supabase client with enhanced error handling
export async function createServerClient() {
  try {
    const cookieStore = await cookies()

    return createSupabaseServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
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
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  } as any
}

// Keep the original functions for backward compatibility
export const getSupabaseServer = createServerClient
export const getServerSupabaseClient = createServerClient

export const createServerComponentClient = createServerClient
export const createRouteHandlerClient = createServerClient
