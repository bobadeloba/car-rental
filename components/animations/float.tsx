"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface FloatProps {
  children: ReactNode
  amplitude?: number
  frequency?: number
  delay?: number
  className?: string
}

export function Float({ children, amplitude = 10, frequency = 5, delay = 0, className = "" }: FloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [`${-amplitude}px`, `${amplitude}px`, `${-amplitude}px`],
      }}
      transition={{
        duration: frequency,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  )
}
