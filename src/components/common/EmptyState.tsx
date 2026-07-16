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
      <div className="rounded-[16px] bg-muted p-5 mb-5">
        <Icon className="h-9 w-9 text-fg-subtle" strokeWidth={1.75} />
      </div>
      <h3 className="text-[17px] font-semibold text-fg-strong mb-2">{title}</h3>
      <p className="text-sm text-fg-muted max-w-sm mb-6 text-center leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
