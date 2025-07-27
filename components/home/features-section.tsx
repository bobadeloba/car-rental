"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Clock, MapPin, CreditCard, HeadphonesIcon, ThumbsUp } from "lucide-react"

interface FeaturesSectionProps {
  companyName?: string
}

export function FeaturesSection({ companyName = "Luxury Car Rental" }: FeaturesSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("features-section")
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

  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Fully Insured",
      description: "All our vehicles come with comprehensive insurance for your peace of mind.",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "24/7 Support",
      description: "Our customer service team is available round the clock to assist you.",
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Flexible Pickup",
      description: "Choose from multiple convenient pickup and drop-off locations.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "No Hidden Fees",
      description: "Transparent pricing with no surprise charges or hidden fees.",
    },
    {
      icon: <HeadphonesIcon className="h-10 w-10 text-primary" />,
      title: "Premium Service",
      description: "Experience top-notch service from our professional team.",
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-primary" />,
      title: "Quality Guarantee",
      description: "We guarantee the quality and performance of all our vehicles.",
    },
  ]

  return (
    <section
      id="features-section"
      className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 relative"
      style={{
        backgroundImage: "url('/pattern-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px", // Adjusted to show more of the pattern
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            Why Choose {companyName}
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We offer premium services and exceptional customer care to ensure your journey is perfect
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
