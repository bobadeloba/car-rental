import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CarCardSkeletonProps {
  className?: string
}

export function CarCardSkeleton({ className }: CarCardSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground shadow", className)}>
      <div className="relative">
        <Skeleton className="h-48 w-full" />
        <div className="absolute inset-0">
          <svg
            className="h-full w-full text-muted-foreground/10"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M10,45 L20,25 L30,15 L70,15 L80,25 L90,45" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="30" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="70" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
