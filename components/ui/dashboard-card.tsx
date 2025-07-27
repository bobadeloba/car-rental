"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string
  icon?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
  variant?: "default" | "luxury" | "sport" | "eco"
}

export function DashboardCard({
  title,
  icon,
  className,
  contentClassName,
  children,
  variant = "default",
}: DashboardCardProps) {
  const variantClasses = {
    default: "bg-white dark:bg-gray-800",
    luxury: "bg-gradient-to-br from-gray-900 to-gray-800 text-white",
    sport: "bg-gradient-to-br from-red-600 to-red-800 text-white",
    eco: "bg-gradient-to-br from-green-600 to-green-700 text-white",
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-lg", variantClasses[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
      <div className="dashboard-card-decoration">
        <div className="dashboard-card-line"></div>
        <div className="dashboard-card-circle"></div>
      </div>
      <style jsx>{`
        .dashboard-card-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          overflow: hidden;
          opacity: 0.1;
          pointer-events: none;
        }
        
        .dashboard-card-line {
          position: absolute;
          top: 20px;
          right: -20px;
          width: 100px;
          height: 2px;
          background: currentColor;
          transform: rotate(45deg);
        }
        
        .dashboard-card-circle {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          border: 2px solid currentColor;
          border-radius: 50%;
        }
      `}</style>
    </Card>
  )
}
