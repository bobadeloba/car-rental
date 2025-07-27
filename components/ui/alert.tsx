import * as React from "react"

import { cn } from "@/lib/utils"

import { CircleAlertIcon as AlertCirclePrimitive } from "lucide-react"

const Alert = React.forwardRef<React.ElementRef<typeof Alert>, React.ComponentPropsWithoutRef<typeof Alert>>(
  ({ className, children, variant, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full rounded-md border",
          variant === "destructive" ? "border-destructive text-destructive" : "border-border",
          className,
        )}
        role="alert"
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<React.ElementRef<typeof Alert>, React.ComponentPropsWithoutRef<typeof Alert>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("font-medium text-sm", className)} {...props} ref={ref} />
  },
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<React.ElementRef<typeof Alert>, React.ComponentPropsWithoutRef<typeof Alert>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("text-sm opacity-70", className)} {...props} ref={ref} />
  },
)
AlertDescription.displayName = "AlertDescription"

const AlertCircle = AlertCirclePrimitive

export { Alert, AlertTitle, AlertDescription, AlertCircle }
