"use client"

import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRightIcon, ListChecks } from "lucide-react"

export interface Tour {
  id: string
  title: string
  imageSrc: string
  pricePerPerson: string
  originalPrice?: string
  discountPercentage?: number
  features: string[]
  partnerLink: string
  whatsappLink: string
}

interface TourCardProps {
  tour: Tour
}

export default function TourCard({ tour }: TourCardProps) {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent navigation if the click target is the "Book Now" button or its child
    if ((e.target as HTMLElement).closest(".book-now-button")) {
      return
    }
    window.open(tour.partnerLink, "_blank")
  }

  const handleBookNowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Prevent card click event from firing
    window.open(tour.whatsappLink, "_blank")
  }

  return (
    <Card
      className="flex flex-col overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all duration-300 cursor-pointer h-full group"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative w-full">
          <Image
            src={tour.imageSrc || "/placeholder.svg"}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-orange-600">
          {tour.title}
        </CardTitle>
        <p className="text-orange-600 font-bold text-md mb-3">{tour.pricePerPerson}</p>

        {tour.originalPrice && tour.discountPercentage && (
          <div className="bg-blue-700 text-white p-3 my-3 text-center rounded-md">
            <span className="line-through text-gray-300 text-sm">{tour.originalPrice}</span>
            <span className="ml-2 text-lg font-bold">Save {tour.discountPercentage}%</span>
          </div>
        )}

        <div className="mt-2 mb-4 text-sm text-gray-600 dark:text-gray-300 space-y-1 flex-grow">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center">
            <ListChecks size={18} className="mr-2 text-orange-500" />
            Includes:
          </h4>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {tour.features.map((feature, index) => (
              <li key={index} className="text-xs">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button
          onClick={handleBookNowClick}
          variant="default"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold book-now-button"
          aria-label={`Book ${tour.title} now`}
        >
          Book Now
          <ChevronRightIcon size={20} className="ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
