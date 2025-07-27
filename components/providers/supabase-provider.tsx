"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type SupabaseContextType = {
  supabase: SupabaseClient<Database> | null
}

const SupabaseContext = createContext<SupabaseContextType>({ supabase: null })

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context.supabase === null) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context.supabase
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient())

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>
}
