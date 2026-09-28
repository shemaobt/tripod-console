import { cn } from "@/utils/cn"
import { states } from "@/styles"
import { Button } from "@/components/ui/button"

export function LoadFailed({
  what,
  onRetry,
  className,
}: {
  what: string
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(states.error, "flex flex-wrap items-center justify-between gap-3", className)}
    >
      <span>
        We couldn't load {what}. This is usually a temporary problem on our side, not
        something you did.
      </span>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
