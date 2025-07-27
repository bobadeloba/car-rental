"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CarCardSkeleton } from "@/components/ui/car-card-skeleton"
import { useState } from "react"
import { Gauge, Zap, Bolt, Users, MessageCircle } from "lucide-react"

interface Car {
  id: string
  name: string
  brand: string
  slug?: string
  price_per_day: number
  images?: string[]
  specs?: {
    fuel?: string
    seats?: number
    speed?: string
    topSpeed?: string
    acceleration?: string
    power?: string
    horsepower?: string
  }
}

interface CarsListProps {
  cars: Car[]
  isLoading?: boolean
  whatsappPhoneNumber?: string | null
}

export default function CarsList({ cars, isLoading, whatsappPhoneNumber }: CarsListProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({})
  const [hoveredCar, setHoveredCar] = useState<string | null>(null)
  const [imageErrorStates, setImageErrorStates] = useState<Record<string, boolean>>({})

  const handleViewDetails = async (car: Car) => {
    // Track the car view when user clicks "View Details"
    try {
      await fetch("/api/track-car-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carId: car.id }),
      })
      console.log(`Tracked view for car: ${car.brand} ${car.name}`)
    } catch (error) {
      console.error(`Error tracking view for car ${car.id}:`, error)
    }
  }

  const getCarUrl = (car: Car) => {
    // Use slug if available, otherwise fall back to ID
    return car.slug ? `/cars/${car.slug}` : `/cars/${car.id}`
  }

  const fallbackImages = [
    "/images/cars/mercedes-s-class.jpg",
    "/images/cars/bmw-7-series.jpg",
    "/images/cars/audi-a8.png",
    "/images/cars/porsche-911.png",
    "/images/cars/range-rover.png",
    "/images/cars/bentley-continental.png",
    "/images/cars/ferrari-roma.png",
    "/images/cars/lamborghini-huracan.png",
  ]

  const getCarImage = (car: Car, index: number, isSecondary = false) => {
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      if (isSecondary && car.images.length > 1 && car.images[1]) {
        return car.images[1]
      }
      if (car.images[0] && typeof car.images[0] === "string" && car.images[0].trim() !== "") {
        return car.images[0]
      }
    }
    return fallbackImages[index % fallbackImages.length]
  }

  const handleImageLoad = (carId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [carId]: false }))
  }

  const handleImageLoadStart = (carId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [carId]: true }))
  }

  const handleWhatsAppBook = (car: Car) => {
    const message = `Hello, I'm interested in booking the ${car.brand || ""} ${car.name || ""}.`
    if (!whatsappPhoneNumber) {
      alert("WhatsApp number is not configured for booking. Please contact support or try again later.")
      console.warn("WhatsApp booking attempted but phone number is missing from props.")
      return
    }
    window.open(`https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CarCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car, index) => {
        const isLoadingImage = imageLoadingStates[car.id]
        const isHovered = hoveredCar === car.id
        const hasSecondImage = car.images && car.images.length > 1
        const currentImage =
          isHovered && hasSecondImage ? getCarImage(car, index, true) : getCarImage(car, index, false)

        const hasImageError = imageErrorStates[`${car.id}_error`]

        const imageKey = currentImage || `fallback-${car.id}-${index}`

        return (
          <Card
            key={car.id}
            className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-500 hover:scale-[1.02] group"
            onMouseEnter={() => setHoveredCar(car.id)}
            onMouseLeave={() => setHoveredCar(null)}
          >
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {(isLoadingImage ||
                (!currentImage && !hasImageError) ||
                (currentImage && currentImage.includes("placeholder")) ||
                hasImageError) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <div className="relative">
                    <div className="w-20 h-10 mb-6 relative">
                      <svg viewBox="0 0 120 60" className="w-full h-full">
                        <defs>
                          <linearGradient id={`carGradient-${car.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <filter id={`glow-${car.id}`}>
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          d="M100,35H90L80,15H35L25,35H20C15,35,10,40,10,45v5h100v-5C110,40,105,35,100,35z"
                          fill={`url(#carGradient-${car.id})`}
                          filter={`url(#glow-${car.id})`}
                          className="animate-pulse"
                        />
                        <circle
                          cx="30"
                          cy="50"
                          r="8"
                          fill="#374151"
                          className="animate-spin origin-center"
                          style={{ animationDuration: "2s" }}
                        />
                        <circle
                          cx="90"
                          cy="50"
                          r="8"
                          fill="#374151"
                          className="animate-spin origin-center"
                          style={{ animationDuration: "2s" }}
                        />
                        <circle cx="15" cy="40" r="3" fill="#fbbf24" className="animate-pulse" />
                        <path d="M80,15L70,35h10L80,15z" fill="#60a5fa" opacity="0.7" />
                        <path d="M50,15L40,35h10L50,15z" fill="#60a5fa" opacity="0.7" />
                      </svg>
                    </div>
                    <div className="flex space-x-2 justify-center mb-4">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-bounce"
                          style={{
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: "1.2s",
                          }}
                        />
                      ))}
                    </div>
                    <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-amber-400 mt-3 text-center font-medium tracking-widest">
                      {hasImageError ? "IMAGE ERROR" : "LOADING LUXURY"}
                    </p>
                  </div>
                </div>
              )}

              <Image
                key={imageKey}
                src={
                  hasImageError
                    ? fallbackImages[index % fallbackImages.length]
                    : currentImage || fallbackImages[index % fallbackImages.length]
                }
                alt={`${car.brand || "Car"} ${car.name || "Model"}`}
                fill
                className={`object-cover transition-all duration-500 ${
                  isHovered ? "scale-110" : "scale-100"
                } ${isLoadingImage && !hasImageError ? "opacity-0" : "opacity-100"}`}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                onLoadingComplete={() => handleImageLoad(car.id)}
                onLoadStart={() => handleImageLoadStart(car.id)}
                onError={() => {
                  console.error(`Error loading image for car ${car.id}: ${currentImage}`)
                  setImageErrorStates((prev) => ({ ...prev, [`${car.id}_error`]: true }))
                  handleImageLoad(car.id)
                }}
              />

              {hasSecondImage && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {isHovered ? "2/2" : "1/2"}
                </div>
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            <CardContent className="p-6 flex-grow">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                {car.brand || "Unknown Brand"} {car.name || "Unknown Model"}
              </h3>
              <p className="text-primary font-bold mb-4 text-lg">${car.price_per_day?.toFixed(2) || "0.00"} / day</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out cursor-default">
                  <Gauge className="h-5 w-5 mb-1.5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="block font-medium text-xs text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors mb-1">
                    Speed
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {car.specs?.speed || car.specs?.topSpeed || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out cursor-default">
                  <Zap className="h-5 w-5 mb-1.5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="block font-medium text-xs text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors mb-1">
                    Acceleration
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {car.specs?.acceleration || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out cursor-default">
                  <Bolt className="h-5 w-5 mb-1.5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="block font-medium text-xs text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors mb-1">
                    Horse Power
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {car.specs?.power || car.specs?.horsepower || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out cursor-default">
                  <Users className="h-5 w-5 mb-1.5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="block font-medium text-xs text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors mb-1">
                    Seats
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {car.specs?.seats || "N/A"}
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleViewDetails(car)}
                  asChild
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 py-3 text-sm font-medium"
                >
                  <Link href={getCarUrl(car)}>View Details</Link>
                </Button>
                <Button
                  onClick={() => handleWhatsAppBook(car)}
                  variant="outline"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors duration-300 py-3 text-sm font-medium flex items-center justify-center gap-2 group"
                  disabled={!whatsappPhoneNumber}
                >
                  <MessageCircle
                    size={18}
                    className="text-green-500 group-hover:text-white transition-colors duration-300"
                  />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
