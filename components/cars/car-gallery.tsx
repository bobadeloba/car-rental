"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CarSpinner } from "@/components/ui/car-spinner"

interface CarGalleryProps {
  images: string[]
  carName: string
}

export default function CarGallery({ images, carName }: CarGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Fallback images if no images are provided or there's an error
  const fallbackImages = [
    "/images/cars/mercedes-s-class.jpg",
    "/images/cars/bmw-7-series.jpg",
    "/images/cars/audi-a8.png",
    "/images/cars/porsche-911.png",
  ]

  // Use provided images or fallbacks
  const displayImages = images && images.length > 0 && !imageError ? images : fallbackImages

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0
    const newIndex = isFirstImage ? displayImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastImage = currentIndex === displayImages.length - 1
    const newIndex = isLastImage ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  const handleImageError = () => {
    setLoading(false)
    setImageError(true)
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <CarSpinner />
          </div>
        )}
        <Image
          src={displayImages[currentIndex] || "/placeholder.svg"}
          alt={`${carName} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {displayImages.map((image, index) => (
          <button
            key={index}
            className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md ${
              index === currentIndex ? "ring-2 ring-primary" : "opacity-70"
            }`}
            onClick={() => goToImage(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${carName} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
