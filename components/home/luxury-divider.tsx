"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function LuxuryDivider() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("luxury-divider")
      if (element) {
        const position = element.getBoundingClientRect()
        if (position.top < window.innerHeight && position.bottom >= 0) {
          setIsVisible(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="luxury-divider" className="py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/pattern-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/70 z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-1 bg-white mb-6" />
          <h3 className="text-2xl md:text-3xl font-light text-white text-center italic">
            "Luxury is not a necessity, but the pleasure of refinement."
          </h3>
          <div className="w-24 h-1 bg-white mt-6" />
        </motion.div>
      </div>
    </section>
  )
}
