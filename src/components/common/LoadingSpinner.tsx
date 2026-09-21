import { Loader2 } from "lucide-react"
import { cn } from "@/utils/cn"
import { states } from "@/styles"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn(states.loading, className)}>
      <Loader2 className={cn("animate-spin text-accent", sizeClasses[size])} />
    </div>
  )
}
