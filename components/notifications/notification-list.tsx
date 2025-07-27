"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDistance } from "date-fns"
import { Bell, Check, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationList({ userId }: { userId: string }) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setMarkingAsRead(id)
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

      if (error) throw error

      setNotifications((current) =>
        current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    } finally {
      setMarkingAsRead(null)
    }
  }

  const deleteNotification = async (id: string) => {
    setDeleting(id)
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) throw error

      setNotifications((current) => current.filter((notification) => notification.id !== id))

      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error

      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))

      toast({
        title: "All notifications marked as read",
        description: "All your notifications have been marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No notifications</h3>
        <p className="text-gray-500 dark:text-gray-400">You don't have any notifications yet.</p>
      </div>
    )
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? "bg-background" : "bg-primary/5 dark:bg-primary/10 border-primary/20"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-medium ${notification.read ? "" : "text-primary"}`}>{notification.title}</h3>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingAsRead === notification.id}
                    >
                      {markingAsRead === notification.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => deleteNotification(notification.id)}
                    disabled={deleting === notification.id}
                  >
                    {deleting === notification.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-sm">{notification.message}</p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDistance(new Date(notification.created_at), new Date(), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
