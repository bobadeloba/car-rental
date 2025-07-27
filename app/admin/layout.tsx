import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ResponsiveLayout } from "@/components/admin/responsive-layout"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/auth/signin?callbackUrl=/admin")
  }

  // If the user is authenticated, they can access the admin panel
  return <ResponsiveLayout sidebar={<AdminSidebar />}>{children}</ResponsiveLayout>
}
