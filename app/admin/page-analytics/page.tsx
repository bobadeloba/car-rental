import type { Metadata } from "next"
import PageViewsDashboard from "@/components/admin/analytics/page-views-dashboard"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Page Analytics | Admin Dashboard",
  description: "View detailed analytics for page views, visitor locations, and device statistics",
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PageAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Page Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track page views, visitor locations, and device statistics across your website.
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <PageViewsDashboard />
      </Suspense>
    </div>
  )
}
