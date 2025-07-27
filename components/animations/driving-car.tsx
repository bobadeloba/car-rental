"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface DrivingCarProps {
  className?: string
  onComplete?: () => void
  duration?: number
}

export function DrivingCar({ className, onComplete, duration = 3000 }: DrivingCarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div ref={containerRef} className={cn("w-full h-24 relative overflow-hidden", className)}>
      <div className="road absolute bottom-0 w-full h-4 bg-gray-700">
        <div className="road-lines"></div>
      </div>
      <div className="car">
        <div className="car-body"></div>
        <div className="car-roof"></div>
        <div className="car-window"></div>
        <div className="car-light"></div>
        <div className="wheel wheel-front"></div>
        <div className="wheel wheel-back"></div>
      </div>
      <style jsx>{`
        .road-lines {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 10%;
          background: repeating-linear-gradient(
            90deg,
            white,
            white 20px,
            transparent 20px,
            transparent 40px
          );
          animation: move-road 0.5s linear infinite;
        }
        
        .car {
          position: absolute;
          bottom: 4px;
          left: 10%;
          width: 100px;
          height: 40px;
          animation: car-drive ${duration / 1000}s linear forwards;
        }
        
        .car-body {
          position: absolute;
          bottom: 0;
          width: 60%;
          height: 40%;
          background: var(--primary);
          border-radius: 10px 20px 0 0;
        }
        
        .car-roof {
          position: absolute;
          bottom: 40%;
          left: 20%;
          width: 40%;
          height: 30%;
          background: var(--primary);
          border-radius: 10px 10px 0 0;
        }
        
        .car-window {
          position: absolute;
          bottom: 45%;
          left: 25%;
          width: 30%;
          height: 20%;
          background: #a8d5ff;
          border-radius: 5px;
        }
        
        .car-light {
          position: absolute;
          bottom: 15%;
          right: 5%;
          width: 8%;
          height: 15%;
          background: #ffdd00;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(255, 221, 0, 0.8);
        }
        
        .wheel {
          position: absolute;
          bottom: -5px;
          width: 20%;
          height: 20%;
          background: #333;
          border-radius: 50%;
          border: 2px solid #666;
          animation: wheel-spin 0.5s linear infinite;
        }
        
        .wheel-front {
          right: 10%;
        }
        
        .wheel-back {
          left: 10%;
        }
        
        @keyframes move-road {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: -40px 0;
          }
        }
        
        @keyframes car-drive {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(${containerRef.current ? containerRef.current.offsetWidth : 1000}px - 100px));
          }
        }
        
        @keyframes wheel-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
