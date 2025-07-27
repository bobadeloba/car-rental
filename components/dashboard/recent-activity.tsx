"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/date-utils"

interface Activity {
  id: string
  created_at: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  cars: {
    id: string
    name: string
    brand: string
    images: string[]
  }
}

interface RecentActivityProps {
  userId: string
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("bookings")
          .select("*, cars(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          throw error
        }

        setActivities(data)
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError("Failed to load recent activity")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchActivities()
    }
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <p className="text-gray-500 dark:text-gray-400">Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={activity.cars?.images?.[0] || "/placeholder.svg?height=200&width=300&query=car"}
                    alt={activity.cars?.name || "Car"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.cars?.brand || "Unknown"} {activity.cars?.name || "Car"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(activity.created_at)}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{activity.status}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{formatCurrency(activity.total_price)}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/bookings/${activity.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No recent activity found.</p>
            <Button asChild>
              <Link href="/cars">Browse Cars</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
