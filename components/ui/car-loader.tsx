"use client"

import { cn } from "@/lib/utils"

interface CarLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: "primary" | "secondary" | "white" | "black"
}

export function CarLoader({ className, size = "md", color = "primary" }: CarLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-8",
    md: "w-24 h-12",
    lg: "w-32 h-16",
  }

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    white: "text-white",
    black: "text-black",
  }

  return (
    <div className={cn("relative", sizeClasses[size], colorClasses[color], className)}>
      <div className="car-loader">
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            className="car-body"
            d="M85,30H75L65,10H30L20,30H15C10,30,5,35,5,40v5h90v-5C95,35,90,30,85,30z"
            fill="currentColor"
          />
          <circle className="wheel wheel-left" cx="25" cy="45" r="7" fill="#333" />
          <circle className="wheel wheel-right" cx="75" cy="45" r="7" fill="#333" />
          <path className="car-light" d="M10,35h5v-5h-5C10,30,10,35,10,35z" fill="#FFDD00" />
          <path className="car-window" d="M65,10L55,30h10L65,10z" fill="#A8D5FF" />
        </svg>
        <div className="car-loader-track"></div>
        <div className="car-loader-dots">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="car-loader-dot" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .car-loader {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .car-body {
          animation: car-bounce 1s infinite;
        }
        
        .wheel {
          animation: wheel-spin 1s infinite linear;
          transform-origin: center;
        }
        
        .car-light {
          animation: car-light-flicker 0.5s infinite;
        }
        
        .car-loader-track {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #ddd;
          border-radius: 1px;
        }
        
        .car-loader-dots {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          display: flex;
          justify-content: space-between;
        }
        
        .car-loader-dot {
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
          opacity: 0;
          transform: translateY(0);
          animation: dot-pulse 1s infinite;
        }
        
        @keyframes car-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5%);
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
        
        @keyframes car-light-flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes dot-pulse {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
