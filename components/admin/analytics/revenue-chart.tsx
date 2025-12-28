"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenueChartProps {
  data: Array<{
    amount: number
    created_at: string
  }> | null
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">No revenue data available</div>
    )
  }

  // Process data to group by month
  const monthlyData = data.reduce(
    (acc, item) => {
      const date = new Date(item.created_at)
      const month = date.getMonth()

      if (!acc[month]) {
        acc[month] = {
          month: month,
          monthName: date.toLocaleString("default", { month: "short" }),
          revenue: 0,
        }
      }

      acc[month].revenue += Number(item.amount)
      return acc
    },
    {} as Record<number, { month: number; monthName: string; revenue: number }>,
  )

  // Convert to array and sort by month
  const chartData = Object.values(monthlyData).sort((a, b) => a.month - b.month)

  return (
    <ChartContainer
      config={{
        revenue: {
          label: "Revenue",
          color: "hsl(var(--chart-1))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="monthName" tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} />
          <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} tickCount={5} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="revenue" name="Revenue" fill="rgb(45, 173, 161)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
