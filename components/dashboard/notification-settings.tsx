"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface NotificationPreferences {
  email_booking_updates: boolean
  email_promotions: boolean
  sms_booking_updates: boolean
  sms_promotions: boolean
  push_booking_updates: boolean
  push_promotions: boolean
}

export default function NotificationSettings({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_booking_updates: true,
    email_promotions: true,
    sms_booking_updates: true,
    sms_promotions: false,
    push_booking_updates: true,
    push_promotions: false,
  })

  useEffect(() => {
    async function fetchPreferences() {
      try {
        setIsFetching(true)

        // Check if notification_preferences table exists
        const { data: tableExists } = await supabase.from("notification_preferences").select("*").limit(1).maybeSingle()

        // If table doesn't exist yet, we'll create it later when saving
        if (tableExists === null) {
          setIsFetching(false)
          return
        }

        // Fetch user's notification preferences
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setPreferences({
            email_booking_updates: data.email_booking_updates,
            email_promotions: data.email_promotions,
            sms_booking_updates: data.sms_booking_updates,
            sms_promotions: data.sms_promotions,
            push_booking_updates: data.push_booking_updates,
            push_promotions: data.push_promotions,
          })
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchPreferences()
  }, [userId, supabase])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // First, check if the record exists
      const { data, error: fetchError } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from("notification_preferences")
          .update({
            email_booking_updates: preferences.email_booking_updates,
            email_promotions: preferences.email_promotions,
            sms_booking_updates: preferences.sms_booking_updates,
            sms_promotions: preferences.sms_promotions,
            push_booking_updates: preferences.push_booking_updates,
            push_promotions: preferences.push_promotions,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("notification_preferences").insert({
          user_id: userId,
          email_booking_updates: preferences.email_booking_updates,
          email_promotions: preferences.email_promotions,
          sms_booking_updates: preferences.sms_booking_updates,
          sms_promotions: preferences.sms_promotions,
          push_booking_updates: preferences.push_booking_updates,
          push_promotions: preferences.push_promotions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_booking_updates" className="font-medium">
                Booking Updates
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your bookings via email</p>
            </div>
            <Switch
              id="email_booking_updates"
              checked={preferences.email_booking_updates}
              onCheckedChange={() => handleToggle("email_booking_updates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_promotions" className="font-medium">
                Promotions and Offers
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive promotional offers and discounts via email
              </p>
            </div>
            <Switch
              id="email_promotions"
              checked={preferences.email_promotions}
              onCheckedChange={() => handleToggle("email_promotions")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">SMS Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_booking_updates" className="font-medium">
                Booking Updates
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your bookings via SMS</p>
            </div>
            <Switch
              id="sms_booking_updates"
              checked={preferences.sms_booking_updates}
              onCheckedChange={() => handleToggle("sms_booking_updates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_promotions" className="font-medium">
                Promotions and Offers
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive promotional offers and discounts via SMS
              </p>
            </div>
            <Switch
              id="sms_promotions"
              checked={preferences.sms_promotions}
              onCheckedChange={() => handleToggle("sms_promotions")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push_booking_updates" className="font-medium">
                Booking Updates
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive updates about your bookings via push notifications
              </p>
            </div>
            <Switch
              id="push_booking_updates"
              checked={preferences.push_booking_updates}
              onCheckedChange={() => handleToggle("push_booking_updates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push_promotions" className="font-medium">
                Promotions and Offers
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive promotional offers and discounts via push notifications
              </p>
            </div>
            <Switch
              id="push_promotions"
              checked={preferences.push_promotions}
              onCheckedChange={() => handleToggle("push_promotions")}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  )
}
