"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ParallaxProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down"
  backgroundImage?: string
}

export function Parallax({ children, className, speed = 0.5, direction = "up", backgroundImage }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const { top } = ref.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      // Calculate how far the element is from the viewport center
      const elementCenter = top + ref.current.offsetHeight / 2
      const viewportCenter = windowHeight / 2
      const distanceFromCenter = elementCenter - viewportCenter

      // Calculate parallax offset based on distance from center
      const parallaxOffset = distanceFromCenter * speed * (direction === "up" ? -1 : 1)

      setOffset(parallaxOffset)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed, direction])

  // Use a confirmed existing image from your project
  const defaultBackground = "/images/banners/luxury-banner-1.png"

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : `url('${defaultBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}
