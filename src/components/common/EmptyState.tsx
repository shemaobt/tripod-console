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
      <div className="rounded-2xl bg-surface-alt/60 p-5 mb-5">
        <Icon className="h-10 w-10 text-areia" />
      </div>
      <h3 className="text-lg font-semibold text-preto mb-2">{title}</h3>
      <p className="text-sm text-verde/70 max-w-sm mb-6 text-center leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
