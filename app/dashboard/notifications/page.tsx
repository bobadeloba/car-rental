import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import NotificationList from "@/components/notifications/notification-list"
import { getCompanyName } from "@/lib/company-name"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: {}
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const companyName = await getCompanyName()

  return {
    title: `Notifications | ${companyName}`,
    description: "View your notifications",
  }
}

export default async function NotificationsPage() {
  const supabase = getSupabaseServer()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/notifications")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with important information about your bookings and account
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <NotificationList userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
