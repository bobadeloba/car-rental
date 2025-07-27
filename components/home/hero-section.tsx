"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroSectionProps {
  companyName: string
  heroImageUrl: string
  heroAltText: string
}

export function HeroSection({ companyName, heroImageUrl, heroAltText }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Set loaded to true after component mounts
    setIsLoaded(true)
  }, [])

  // Use a fallback image if the provided URL fails to load
  const imageSrc = imageError
    ? "/images/banners/luxury-banner-1.png"
    : heroImageUrl || "/images/banners/luxury-banner-1.png"

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={heroAltText || "Luxury car rental"}
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
          unoptimized // Add this to prevent image optimization issues
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <motion.div
          className="max-w-2xl text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Experience Luxury with {companyName || "Premium Car Rentals"}
          </motion.h1>

          <motion.p
            className="text-xl mb-8 text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Discover our premium fleet of luxury vehicles for an unforgettable driving experience.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link href="/cars">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Browse Cars
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
