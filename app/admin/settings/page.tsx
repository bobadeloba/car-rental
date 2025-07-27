import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AdminSettings } from "@/components/admin/settings/admin-settings"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Breadcrumbs } from "@/components/admin/shared/breadcrumbs"

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
  description: "Configure system settings for your car rental platform",
}

export default async function SettingsPage() {
  // Get the Supabase client
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin/settings")
  }

  // Fetch general settings from the database without joining to users table
  let settings = null
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select(`
      id, 
      site_name, 
      site_description, 
      contact_email, 
      contact_phone, 
      default_currency,
      footer_tagline,
      site_address_line1,
      site_address_line2,
      site_address_city,
      site_address_state,
      site_address_postal,
      site_address_country,
      social_facebook,
      social_twitter,
      social_instagram,
      social_youtube,
      logo_url,
      app_name,
      whatsapp_phone
    `)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching settings:", error)
    } else {
      settings = data
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
  }

  const breadcrumbItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="w-full max-w-full overflow-hidden">
      <AdminPageHeader title="Settings" description="Configure system settings for your car rental platform" />

      <div className="container px-2 sm:px-4 mx-auto w-full">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="w-full mt-6 overflow-hidden">
          <AdminSettings />
        </div>
      </div>
    </div>
  )
}
