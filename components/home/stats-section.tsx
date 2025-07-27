"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("stats-section")
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
    <section
      id="stats-section"
      className="py-16 md:py-24 relative"
      style={{
        backgroundImage: "url('/pattern-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px", // Adjusted to show more of the pattern
        backgroundPosition: "center",
        backgroundBlendMode: "normal",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/80" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Numbers Speak for Themselves</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Experience luxury backed by impressive statistics and customer satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md text-center border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-4xl font-bold text-white mb-2">200+</h3>
            <p className="text-white/80">Premium Vehicles</p>
            <p className="text-xs text-white/60 mt-1">Including 45 exotic models</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md text-center border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-4xl font-bold text-white mb-2">1489+</h3>
            <p className="text-white/80">Satisfied Clients</p>
            <p className="text-xs text-white/60 mt-1">With 92% repeat bookings</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md text-center border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-4xl font-bold text-white mb-2">20+</h3>
            <p className="text-white/80">Strategic Partners</p>
            <p className="text-xs text-white/60 mt-1">Across 7 emirates</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md text-center border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-4xl font-bold text-white mb-2">93%</h3>
            <p className="text-white/80">Customer Satisfaction</p>
            <p className="text-xs text-white/60 mt-1">Based on 196+ reviews</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
