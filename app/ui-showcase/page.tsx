"use client"

import { useState } from "react"
import { CarSpinner } from "@/components/ui/car-spinner"
import { DrivingCar } from "@/components/animations/driving-car"
import { Speedometer } from "@/components/ui/speedometer"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { KeyFob } from "@/components/animations/key-fob"
import { CarLoader } from "@/components/ui/car-loader"
import { FuelGauge } from "@/components/ui/fuel-gauge"
import { PageLoader } from "@/components/ui/page-loader"
import { BookingSuccess } from "@/components/animations/booking-success"
import { CarCardSkeleton } from "@/components/ui/car-card-skeleton"
import { Button } from "@/components/ui/button"
import { Car, Fuel, Gauge, Key, LayoutDashboard, Loader } from "lucide-react"

export default function UIShowcasePage() {
  const [showPageLoader, setShowPageLoader] = useState(false)
  const [speedValue, setSpeedValue] = useState(65)
  const [fuelValue, setFuelValue] = useState(75)

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Car Rental UI Components</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Car Spinner */}
        <DashboardCard title="Car Spinner" icon={<Loader />} className="flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6">
            <CarSpinner size="sm" />
            <CarSpinner size="md" />
            <CarSpinner size="lg" />
          </div>
        </DashboardCard>

        {/* Driving Car */}
        <DashboardCard
          title="Driving Car Animation"
          icon={<Car />}
          className="flex flex-col items-center justify-center p-6"
        >
          <DrivingCar className="w-full" duration={5000} />
        </DashboardCard>

        {/* Speedometer */}
        <DashboardCard title="Speedometer" icon={<Gauge />} className="flex flex-col items-center justify-center p-6">
          <Speedometer value={speedValue} max={120} label="mph" />
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setSpeedValue(Math.max(0, speedValue - 10))}>
              -10
            </Button>
            <Button size="sm" onClick={() => setSpeedValue(Math.min(120, speedValue + 10))}>
              +10
            </Button>
          </div>
        </DashboardCard>

        {/* Dashboard Cards */}
        <DashboardCard
          title="Dashboard Card Variants"
          icon={<LayoutDashboard />}
          className="flex flex-col items-center justify-center p-6"
        >
          <div className="grid grid-cols-2 gap-4 w-full">
            <DashboardCard title="Default" className="h-24">
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </DashboardCard>

            <DashboardCard title="Luxury" variant="luxury" className="h-24">
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-gray-300">Premium</p>
            </DashboardCard>

            <DashboardCard title="Sport" variant="sport" className="h-24">
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-gray-300">Sports</p>
            </DashboardCard>

            <DashboardCard title="Eco" variant="eco" className="h-24">
              <p className="text-2xl font-bold">16</p>
              <p className="text-xs text-gray-300">Economy</p>
            </DashboardCard>
          </div>
        </DashboardCard>

        {/* Key Fob */}
        <DashboardCard
          title="Key Fob Animation"
          icon={<Key />}
          className="flex flex-col items-center justify-center p-6"
        >
          <KeyFob autoPlay={false} />
          <p className="text-sm text-center mt-4 text-muted-foreground">Click to animate</p>
        </DashboardCard>

        {/* Car Loader */}
        <DashboardCard title="Car Loader" icon={<Car />} className="flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6">
            <CarLoader size="sm" />
            <CarLoader size="md" />
            <CarLoader size="lg" />
          </div>
        </DashboardCard>

        {/* Fuel Gauge */}
        <DashboardCard title="Fuel Gauge" icon={<Fuel />} className="flex flex-col items-center justify-center p-6">
          <FuelGauge value={fuelValue} />
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setFuelValue(Math.max(0, fuelValue - 10))}>
              -10%
            </Button>
            <Button size="sm" onClick={() => setFuelValue(Math.min(100, fuelValue + 10))}>
              +10%
            </Button>
          </div>
        </DashboardCard>

        {/* Page Loader Button */}
        <DashboardCard title="Page Loader" icon={<Loader />} className="flex flex-col items-center justify-center p-6">
          <Button onClick={() => setShowPageLoader(true)}>Show Page Loader</Button>
          {showPageLoader && <PageLoader duration={5000} onComplete={() => setShowPageLoader(false)} />}
        </DashboardCard>

        {/* Booking Success */}
        <DashboardCard
          title="Booking Success Animation"
          icon={<Car />}
          className="flex flex-col items-center justify-center p-6"
        >
          <BookingSuccess autoPlay={false} />
          <p className="text-sm text-center mt-4 text-muted-foreground">Auto-plays on booking success</p>
        </DashboardCard>

        {/* Car Card Skeleton */}
        <DashboardCard
          title="Car Card Skeleton"
          icon={<Car />}
          className="flex flex-col items-center justify-center p-6"
        >
          <CarCardSkeleton className="w-full" />
        </DashboardCard>
      </div>
    </div>
  )
}
