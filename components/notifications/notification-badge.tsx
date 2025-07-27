"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotificationBadge({ userId }: { userId: string }) {
  const supabase = createClientComponentClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel("notification_count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error
      setUnreadCount(count || 0)
    } catch (error) {
      console.error("Error fetching unread notifications count:", error)
    }
  }

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/dashboard/notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Link>
    </Button>
  )
}
