"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface KeyFobProps {
  className?: string
  onComplete?: () => void
  autoPlay?: boolean
}

export function KeyFob({ className, onComplete, autoPlay = true }: KeyFobProps) {
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

  const handleClick = () => {
    if (!isAnimating) {
      setIsAnimating(true)
    }
  }

  return (
    <div className={cn("relative w-40 h-60 cursor-pointer", className)} onClick={handleClick}>
      <div className={cn("key-fob", isAnimating ? "animating" : "")}>
        <div className="key-fob-body"></div>
        <div className="key-fob-buttons">
          <div className="key-fob-button key-fob-lock"></div>
          <div className="key-fob-button key-fob-unlock"></div>
          <div className="key-fob-button key-fob-trunk"></div>
          <div className="key-fob-button key-fob-panic"></div>
        </div>
        <div className="key-fob-logo"></div>
        <div className="key-fob-keyring"></div>
        <div className="key-fob-signal"></div>
      </div>
      <style jsx>{`
        .key-fob {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
        }
        
        .key-fob.animating {
          animation: key-fob-press 3s forwards;
        }
        
        .key-fob-body {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 80%;
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .key-fob-buttons {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 40%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 10px;
        }
        
        .key-fob-button {
          background: #333;
          border-radius: 5px;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .key-fob-button::after {
          content: '';
          position: absolute;
          width: 70%;
          height: 70%;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0.7;
        }
        
        .key-fob-lock::after {
          content: '🔒';
        }
        
        .key-fob-unlock::after {
          content: '🔓';
        }
        
        .key-fob-trunk::after {
          content: '📦';
        }
        
        .key-fob-panic::after {
          content: '🚨';
        }
        
        .key-fob-logo {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 15%;
          background: var(--primary);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        .key-fob-logo::after {
          content: 'YOLO';
          font-size: 10px;
          letter-spacing: 1px;
        }
        
        .key-fob-keyring {
          position: absolute;
          top: 80%;
          left: 50%;
          transform: translateX(-50%);
          width: 20%;
          height: 20%;
          border: 3px solid #666;
          border-radius: 50%;
        }
        
        .key-fob-signal {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
        }
        
        .key-fob.animating .key-fob-unlock {
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }
        
        .key-fob.animating .key-fob-signal {
          animation: key-fob-signal 2s forwards 0.5s;
        }
        
        @keyframes key-fob-press {
          0% {
            transform: rotateX(0);
          }
          10% {
            transform: rotateX(20deg);
          }
          20% {
            transform: rotateX(0);
          }
          100% {
            transform: rotateX(0);
          }
        }
        
        @keyframes key-fob-signal {
          0% {
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.7);
          }
          10% {
            opacity: 1;
            box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0);
          }
          100% {
            opacity: 0;
            box-shadow: 0 0 0 30px rgba(var(--primary-rgb), 0);
          }
        }
      `}</style>
    </div>
  )
}
