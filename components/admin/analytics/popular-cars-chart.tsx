"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"

interface PopularCarsChartProps {
  data: Array<{
    car_id: string
    cars: {
      id: string
      name: string
      brand: string
    } | null
  }>
}

export default function PopularCarsChart({ data }: PopularCarsChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Process data to count bookings per car
  const carBookings = data.reduce(
    (acc, item) => {
      if (!item.cars) return acc

      const carId = item.car_id
      const carName = `${item.cars.brand} ${item.cars.name}`

      if (!acc[carId]) {
        acc[carId] = {
          id: carId,
          name: carName,
          shortName: `${item.cars.brand.slice(0, 3)} ${item.cars.name.slice(0, 3)}`,
          bookings: 0,
        }
      }

      acc[carId].bookings += 1
      return acc
    },
    {} as Record<string, { id: string; name: string; shortName: string; bookings: number }>,
  )

  // Convert to array, sort by bookings, and take top 10
  const chartData = Object.values(carBookings)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10)

  return (
    <ChartContainer
      config={{
        bookings: {
          label: "Bookings",
          color: "hsl(var(--chart-1))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            left: isMobile ? 60 : 120,
            right: 20,
            top: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey={isMobile ? "shortName" : "name"}
            tickLine={false}
            axisLine={false}
            width={isMobile ? 60 : 120}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="bookings" name="Bookings" fill="var(--color-bookings)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
