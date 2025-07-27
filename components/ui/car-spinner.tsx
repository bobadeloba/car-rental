"use client"

import { cn } from "@/lib/utils"

interface CarSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CarSpinner({ size = "md", className }: CarSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="car-spinner">
        <div className="car-body"></div>
        <div className="wheel wheel-left"></div>
        <div className="wheel wheel-right"></div>
      </div>
      <style jsx>{`
        .car-spinner {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .car-body {
          position: absolute;
          top: 20%;
          left: 0;
          width: 100%;
          height: 40%;
          background: var(--primary);
          border-radius: 20px;
          animation: car-bounce 1s infinite;
        }
        
        .wheel {
          position: absolute;
          bottom: 10%;
          width: 25%;
          height: 25%;
          background: #333;
          border-radius: 50%;
          border: 3px solid #666;
          animation: wheel-spin 1s infinite linear;
        }
        
        .wheel-left {
          left: 10%;
        }
        
        .wheel-right {
          right: 10%;
        }
        
        @keyframes car-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10%);
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
