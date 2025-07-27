"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SpeedometerProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
  animated?: boolean
}

export function Speedometer({
  value,
  max = 100,
  className,
  showValue = true,
  size = "md",
  label,
  animated = true,
}: SpeedometerProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        if (currentValue < value) {
          setCurrentValue((prev) => Math.min(prev + 1, value))
        }
      }, 20)

      return () => clearTimeout(timer)
    } else {
      setCurrentValue(value)
    }
  }, [currentValue, value, animated])

  const percentage = (currentValue / max) * 100
  const angle = percentage * 1.8 - 90 // -90 to 90 degrees

  const sizeClasses = {
    sm: "w-32 h-20",
    md: "w-48 h-28",
    lg: "w-64 h-36",
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="speedometer-container">
        <div className="speedometer-dial">
          <div className="speedometer-ticks">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="speedometer-tick" style={{ transform: `rotate(${i * 18 - 90}deg)` }} />
            ))}
          </div>
          <div className="speedometer-needle" style={{ transform: `rotate(${angle}deg)` }} />
          <div className="speedometer-center" />
        </div>
        {showValue && (
          <div className="speedometer-value">
            {currentValue}
            {label && <span className="speedometer-label">{label}</span>}
          </div>
        )}
      </div>
      <style jsx>{`
        .speedometer-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .speedometer-dial {
          position: relative;
          width: 100%;
          height: 60%;
          border-top-left-radius: 100%;
          border-top-right-radius: 100%;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          background: #f0f0f0;
          overflow: hidden;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
        }
        
        .speedometer-ticks {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .speedometer-tick {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 2px;
          height: 10%;
          background: #333;
          transform-origin: bottom center;
        }
        
        .speedometer-needle {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 4px;
          height: 80%;
          background: var(--primary);
          transform-origin: bottom center;
          transition: transform 0.3s ease-out;
          z-index: 10;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .speedometer-center {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #333;
          border-radius: 50%;
          z-index: 20;
        }
        
        .speedometer-value {
          margin-top: 10px;
          font-size: ${size === "lg" ? "1.5rem" : size === "md" ? "1.25rem" : "1rem"};
          font-weight: bold;
          color: var(--primary);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .speedometer-label {
          font-size: 0.75rem;
          font-weight: normal;
          color: #666;
        }
      `}</style>
    </div>
  )
}
