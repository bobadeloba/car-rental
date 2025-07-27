import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: create a new client each time
    return createClientComponentClient<Database>()
  }

  // Client-side: reuse the same client
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }

  return supabaseClient
}

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
