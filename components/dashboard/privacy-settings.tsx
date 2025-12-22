"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PrivacySettings {
  share_rental_history: boolean
  share_profile_data: boolean
  allow_marketing_cookies: boolean
  allow_analytics_cookies: boolean
  allow_location_tracking: boolean
}

export default function PrivacySettings({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [settings, setSettings] = useState<PrivacySettings>({
    share_rental_history: false,
    share_profile_data: false,
    allow_marketing_cookies: true,
    allow_analytics_cookies: true,
    allow_location_tracking: false,
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsFetching(true)

        // Check if privacy_settings table exists
        const { data: tableExists } = await supabase.from("privacy_settings").select("*").limit(1).maybeSingle()

        // If table doesn't exist yet, we'll create it later when saving
        if (tableExists === null) {
          setIsFetching(false)
          return
        }

        // Fetch user's privacy settings
        const { data, error } = await supabase.from("privacy_settings").select("*").eq("user_id", userId).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setSettings({
            share_rental_history: data.share_rental_history,
            share_profile_data: data.share_profile_data,
            allow_marketing_cookies: data.allow_marketing_cookies,
            allow_analytics_cookies: data.allow_analytics_cookies,
            allow_location_tracking: data.allow_location_tracking,
          })
        }
      } catch (error) {
        console.error("Error fetching privacy settings:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [userId, supabase])

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // First, check if the record exists
      const { data, error: fetchError } = await supabase
        .from("privacy_settings")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from("privacy_settings")
          .update({
            share_rental_history: settings.share_rental_history,
            share_profile_data: settings.share_profile_data,
            allow_marketing_cookies: settings.allow_marketing_cookies,
            allow_analytics_cookies: settings.allow_analytics_cookies,
            allow_location_tracking: settings.allow_location_tracking,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("privacy_settings").insert({
          user_id: userId,
          share_rental_history: settings.share_rental_history,
          share_profile_data: settings.share_profile_data,
          allow_marketing_cookies: settings.allow_marketing_cookies,
          allow_analytics_cookies: settings.allow_analytics_cookies,
          allow_location_tracking: settings.allow_location_tracking,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would implement a proper account deletion process
      // This would include:
      // 1. Deleting user data from all tables
      // 2. Anonymizing booking history if needed for business records
      // 3. Deleting the auth user

      // For this example, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Account deletion requested",
        description:
          "Your account deletion request has been submitted. You will receive an email confirmation shortly.",
      })

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process account deletion. Please try again.",
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
        <h3 className="text-lg font-medium">Data Sharing</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share_rental_history" className="font-medium">
                Share Rental History
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow us to share your rental history with partner companies
              </p>
            </div>
            <Switch
              id="share_rental_history"
              checked={settings.share_rental_history}
              onCheckedChange={() => handleToggle("share_rental_history")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share_profile_data" className="font-medium">
                Share Profile Data
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow us to share your profile information with partner companies
              </p>
            </div>
            <Switch
              id="share_profile_data"
              checked={settings.share_profile_data}
              onCheckedChange={() => handleToggle("share_profile_data")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cookies & Tracking</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_marketing_cookies" className="font-medium">
                Marketing Cookies
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow cookies for personalized marketing and advertisements
              </p>
            </div>
            <Switch
              id="allow_marketing_cookies"
              checked={settings.allow_marketing_cookies}
              onCheckedChange={() => handleToggle("allow_marketing_cookies")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_analytics_cookies" className="font-medium">
                Analytics Cookies
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow cookies for website analytics and improvements
              </p>
            </div>
            <Switch
              id="allow_analytics_cookies"
              checked={settings.allow_analytics_cookies}
              onCheckedChange={() => handleToggle("allow_analytics_cookies")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_location_tracking" className="font-medium">
                Location Tracking
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow us to track your location for better service
              </p>
            </div>
            <Switch
              id="allow_location_tracking"
              checked={settings.allow_location_tracking}
              onCheckedChange={() => handleToggle("allow_location_tracking")}
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
          "Save Privacy Settings"
        )}
      </Button>

      <div className="border-t pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
