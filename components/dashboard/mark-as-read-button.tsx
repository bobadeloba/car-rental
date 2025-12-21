"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function MarkAsReadButton({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notifications as read",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleMarkAllAsRead} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Mark all as read
    </Button>
  )
}
