import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export async function getServerCompanyName(): Promise<string> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching company name:", error)
      return "Kings Rental Cars"
    }

    return data?.app_name || "Kings Rental Cars"
  } catch (error) {
    console.error("Error in getServerCompanyName:", error)
    return "Kings Rental Cars"
  }
}
