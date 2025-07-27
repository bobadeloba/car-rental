import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env-check"

/**
 * Creates a Supabase client with error handling for direct database access
 * This is used for server-side operations outside of Next.js components
 */
export function createSafeClient() {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return createDummyClient()
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return createDummyClient()
  }
}

/**
 * Creates a dummy client that returns empty data for fallback
 */
function createDummyClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    storage: {
      from: () => ({
        list: () => Promise.resolve({ data: [], error: null }),
      }),
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
  } as any
}
