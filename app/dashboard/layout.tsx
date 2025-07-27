import type React from "react"
import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = getSupabaseServer()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
