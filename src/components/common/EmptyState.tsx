import type { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { states } from "@/styles"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(states.empty, className)}>
      <Icon className="h-12 w-12 text-areia mb-4" />
      <h3 className="text-lg font-semibold text-preto mb-2">{title}</h3>
      <p className="text-sm text-verde max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
