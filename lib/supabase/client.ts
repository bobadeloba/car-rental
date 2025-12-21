import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: create a new client each time
    return createSupabaseBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // Client-side: reuse the same client (singleton pattern)
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return supabaseClient
}

export const createBrowserClient = getSupabaseClient
export const createClientComponentClient = getSupabaseClient

// Helper function to sign in with Google
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  return { data, error }
}

// Helper function to handle authentication state changes
export function setupAuthListener(callback: (user: any) => void) {
  const supabase = getSupabaseClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })

  return subscription
}
