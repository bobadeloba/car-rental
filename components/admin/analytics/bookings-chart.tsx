"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BookingsChartProps {
  data: Array<{
    created_at: string
    status: string
  }> | null
}

export default function BookingsChart({ data }: BookingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">No booking data available</div>
    )
  }

  // Process data to group by month and status
  const monthlyData = data.reduce(
    (acc, item) => {
      if (!item || !item.created_at || !item.status) return acc

      const date = new Date(item.created_at)
      const month = date.getMonth()

      if (!acc[month]) {
        acc[month] = {
          month: month,
          monthName: date.toLocaleString("default", { month: "short" }),
          confirmed: 0,
          pending: 0,
          cancelled: 0,
        }
      }

      if (item.status === "confirmed") {
        acc[month].confirmed += 1
      } else if (item.status === "pending") {
        acc[month].pending += 1
      } else if (item.status === "cancelled") {
        acc[month].cancelled += 1
      }

      return acc
    },
    {} as Record<number, { month: number; monthName: string; confirmed: number; pending: number; cancelled: number }>,
  )

  // Convert to array and sort by month
  const chartData = Object.values(monthlyData).sort((a, b) => a.month - b.month)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">No booking data available</div>
    )
  }

  return (
    <ChartContainer
      config={{
        confirmed: {
          label: "Confirmed",
          color: "hsl(var(--chart-1))",
        },
        pending: {
          label: "Pending",
          color: "hsl(var(--chart-2))",
        },
        cancelled: {
          label: "Cancelled",
          color: "hsl(var(--chart-3))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="monthName" tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} />
          <YAxis tickLine={false} axisLine={false} tickCount={5} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="confirmed"
            name="Confirmed"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cancelled"
            name="Cancelled"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
