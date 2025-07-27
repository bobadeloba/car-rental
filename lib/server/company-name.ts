import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export async function getCompanyName(): Promise<string> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from("admin_settings")
      .select("app_name, site_name")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching company name:", error)
      return "Kings Rental Cars"
    }

    return data?.site_name || data?.app_name || "Kings Rental Cars"
  } catch (error) {
    console.error("Error in getCompanyName:", error)
    return "Kings Rental Cars"
  }
}
