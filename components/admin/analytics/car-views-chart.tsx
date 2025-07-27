"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp } from "lucide-react"

interface CarViewsChartProps {
  data: Array<{
    date: string
    views: number
  }>
}

export default function CarViewsChart({ data }: CarViewsChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const totalViews = data.reduce((sum, item) => sum + item.views, 0)
  const avgViews = Math.round(totalViews / data.length)
  const maxViews = Math.max(...data.map((item) => item.views))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
            <span>Total: {totalViews.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span>Avg: {avgViews}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span>Peak: {maxViews}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant={chartType === "line" ? "default" : "outline"} size="sm" onClick={() => setChartType("line")}>
            Line
          </Button>
          <Button variant={chartType === "area" ? "default" : "outline"} size="sm" onClick={() => setChartType("area")}>
            Area
          </Button>
        </div>
      </div>

      <ChartContainer
        config={{
          views: {
            label: "Views",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                fontSize={12}
                tickMargin={8}
              />
              <YAxis fontSize={12} tickMargin={8} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                        <p className="text-chart-2">Views: {payload[0].value}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={{ fill: "var(--color-views)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                fontSize={12}
                tickMargin={8}
              />
              <YAxis fontSize={12} tickMargin={8} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                        <p className="text-chart-2">Views: {payload[0].value}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                fill="var(--color-views)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
