"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, TrendingUp, Star } from "lucide-react"

interface CarViewsStatsProps {
  data: Array<{
    id: string
    name: string
    brand: string
    image_url: string
    total_views: number
    views_last_7_days: number
    views_last_30_days: number
    last_viewed_at: string | null
  }>
}

export function CarViewsStats({ data }: CarViewsStatsProps) {
  const topCars = data.slice(0, 5)
  const maxViews = Math.max(...topCars.map((car) => car.total_views))

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Top Performing Cars
        </CardTitle>
        <CardDescription>Most viewed cars with performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCars.map((car, index) => (
            <div key={car.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-card/50">
              <div className="flex-shrink-0">
                <Badge
                  variant={index === 0 ? "default" : index < 3 ? "secondary" : "outline"}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                >
                  {index + 1}
                </Badge>
              </div>

              <div className="flex-grow min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {car.brand} {car.name}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {car.total_views.toLocaleString()}
                  </div>
                </div>

                <Progress value={(car.total_views / maxViews) * 100} className="h-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{car.views_last_7_days} views this week</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {car.views_last_30_days} this month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
