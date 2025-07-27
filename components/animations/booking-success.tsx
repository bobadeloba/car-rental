"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface BookingSuccessProps {
  className?: string
  onComplete?: () => void
  autoPlay?: boolean
}

export function BookingSuccess({ className, onComplete, autoPlay = true }: BookingSuccessProps) {
  const [isAnimating, setIsAnimating] = useState(autoPlay)

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isAnimating, onComplete])

  return (
    <div className={cn("relative w-64 h-64", className)}>
      <div className={cn("booking-success", isAnimating ? "animating" : "")}>
        <div className="car-container">
          <div className="car">
            <div className="car-body"></div>
            <div className="car-roof"></div>
            <div className="car-window"></div>
            <div className="wheel wheel-left"></div>
            <div className="wheel wheel-right"></div>
          </div>
          <div className="road"></div>
        </div>
        <div className="success-icon">
          <CheckCircle size={48} />
        </div>
        <div className="confetti-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
              }}
            ></div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .booking-success {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .car-container {
          position: absolute;
          width: 100%;
          height: 40%;
          bottom: 20%;
          overflow: hidden;
        }
        
        .car {
          position: absolute;
          bottom: 0;
          left: -20%;
          width: 80px;
          height: 40px;
          opacity: 0;
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
        
        .wheel {
          position: absolute;
          bottom: -5px;
          width: 20%;
          height: 20%;
          background: #333;
          border-radius: 50%;
          border: 2px solid #666;
        }
        
        .wheel-left {
          left: 10%;
        }
        
        .wheel-right {
          right: 10%;
        }
        
        .road {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: #333;
        }
        
        .success-icon {
          color: var(--primary);
          transform: scale(0);
          opacity: 0;
        }
        
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .confetti {
          position: absolute;
          top: -10px;
          width: 10px;
          height: 10px;
          opacity: 0;
        }
        
        .booking-success.animating .car {
          animation: car-drive 2s forwards;
        }
        
        .booking-success.animating .wheel {
          animation: wheel-spin 0.5s linear infinite;
        }
        
        .booking-success.animating .success-icon {
          animation: success-appear 0.5s forwards 1.5s;
        }
        
        .booking-success.animating .confetti {
          animation: confetti-fall 2s forwards 1.5s;
        }
        
        @keyframes car-drive {
          0% {
            left: -20%;
            opacity: 1;
          }
          50% {
            left: 50%;
            transform: translateX(-50%);
            opacity: 1;
          }
          100% {
            left: 120%;
            opacity: 1;
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
        
        @keyframes success-appear {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
