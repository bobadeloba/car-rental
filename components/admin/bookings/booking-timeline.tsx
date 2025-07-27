"use client"

import { CheckCircle, Clock, XCircle } from "lucide-react"
import { formatPPP } from "@/lib/date-utils"

interface TimelineEvent {
  status: string
  date: string
  description: string
}

interface BookingTimelineProps {
  events: TimelineEvent[]
}

export default function BookingTimeline({ events }: BookingTimelineProps) {
  // Ensure events is an array
  const timelineEvents = Array.isArray(events) ? events : []

  // Sort events by date (newest first)
  const sortedEvents = [...timelineEvents].sort(
    (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
  )

  if (sortedEvents.length === 0) {
    return <p className="text-sm text-gray-500">No timeline events found.</p>
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={index} className="flex">
          <div className="mr-4 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              {event.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : event.status === "cancelled" ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            {index < sortedEvents.length - 1 && <div className="h-full w-px bg-gray-200 dark:bg-gray-800" />}
          </div>
          <div className="pb-8">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {event.date ? formatPPP(new Date(event.date)) : "Date unknown"}
            </div>
            <div className="mt-1 text-base font-semibold">{event.description || "No description"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
