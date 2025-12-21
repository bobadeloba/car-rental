import { createServerClient } from "@/lib/supabase/server"

export async function getServerCompanyName(): Promise<string> {
  try {
    const supabase = await createServerClient()

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
