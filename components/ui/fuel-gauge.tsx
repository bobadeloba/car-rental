"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FuelGaugeProps {
  value: number
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function FuelGauge({ value, className, size = "md", animated = true }: FuelGaugeProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        if (currentValue < value) {
          setCurrentValue((prev) => Math.min(prev + 1, value))
        } else if (currentValue > value) {
          setCurrentValue((prev) => Math.max(prev - 1, value))
        }
      }, 20)

      return () => clearTimeout(timer)
    } else {
      setCurrentValue(value)
    }
  }, [currentValue, value, animated])

  const percentage = Math.max(0, Math.min(100, currentValue))
  const angle = percentage * 1.8 - 90 // -90 to 90 degrees

  const sizeClasses = {
    sm: "w-24 h-16",
    md: "w-32 h-20",
    lg: "w-48 h-28",
  }

  // Determine color based on fuel level
  const getColor = () => {
    if (percentage <= 20) return "#ef4444" // Red for low fuel
    if (percentage <= 40) return "#f97316" // Orange for medium-low
    return "#22c55e" // Green for good level
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="fuel-gauge">
        <div className="fuel-gauge-dial">
          <div className="fuel-gauge-ticks">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="fuel-gauge-tick"
                style={{
                  transform: `rotate(${i * 45 - 90}deg)`,
                  backgroundColor: i === 0 ? "#ef4444" : i < 2 ? "#f97316" : "#22c55e",
                }}
              />
            ))}
          </div>
          <div
            className="fuel-gauge-needle"
            style={{
              transform: `rotate(${angle}deg)`,
              backgroundColor: getColor(),
            }}
          />
          <div className="fuel-gauge-center" />
        </div>
        <div className="fuel-gauge-label">
          <div className="fuel-gauge-icon">⛽</div>
          <div className="fuel-gauge-value" style={{ color: getColor() }}>
            {percentage}%
          </div>
        </div>
      </div>
      <style jsx>{`
        .fuel-gauge {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .fuel-gauge-dial {
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
        
        .fuel-gauge-ticks {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .fuel-gauge-tick {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 3px;
          height: 15%;
          transform-origin: bottom center;
        }
        
        .fuel-gauge-needle {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 3px;
          height: 80%;
          transform-origin: bottom center;
          transition: transform 0.3s ease-out;
          z-index: 10;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .fuel-gauge-center {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 15px;
          height: 15px;
          background: #333;
          border-radius: 50%;
          z-index: 20;
        }
        
        .fuel-gauge-label {
          margin-top: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        
        .fuel-gauge-icon {
          font-size: ${size === "lg" ? "1.25rem" : size === "md" ? "1rem" : "0.875rem"};
        }
        
        .fuel-gauge-value {
          font-size: ${size === "lg" ? "1rem" : size === "md" ? "0.875rem" : "0.75rem"};
          font-weight: bold;
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  )
}
