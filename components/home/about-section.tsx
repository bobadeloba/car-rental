"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("about-section")
      if (element) {
        const position = element.getBoundingClientRect()
        // If the element is in the viewport
        if (position.top < window.innerHeight && position.bottom >= 0) {
          setIsVisible(true)
        }
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)
    // Check on initial load
    handleScroll()

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="about-section" className="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/luxury-car-showroom.png"
                alt="Luxury car showroom"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-lg z-0"
              style={{
                backgroundImage: "url('/pattern-bg.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "200px", // Smaller size for the decorative element
                backgroundPosition: "center",
                backgroundBlendMode: "overlay",
              }}
            ></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Our Premium Car Rental Service</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              With over 10 years of experience in the luxury car rental industry, we pride ourselves on offering the
              finest selection of premium vehicles for your driving pleasure.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Our mission is to provide an exceptional driving experience with impeccable service, ensuring that every
              journey with us is memorable and enjoyable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-xl">10+</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Years Experience</h3>
                  <p className="text-gray-600 dark:text-gray-400">In luxury car rentals</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-xl">24/7</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customer Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">Always available for you</p>
                </div>
              </div>
            </div>
            <Link href="/about">
              <Button className="bg-primary hover:bg-primary/90">Learn More About Us</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
