import { useState } from "react"
import { cn } from "@/utils/cn"
import { states } from "@/styles"
import { Button } from "@/components/ui/button"

export function LoadFailed({
  what,
  onRetry,
  className,
}: {
  what: string
  onRetry: () => unknown
  className?: string
}) {
  const [retrying, setRetrying] = useState(false)

  async function retry() {
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      role="alert"
      className={cn(states.error, "flex flex-wrap items-center justify-between gap-3", className)}
    >
      <span>
        Something went wrong while loading {what}. Try again, and if it keeps happening, let
        your administrator know.
      </span>
      <Button size="sm" variant="outline" onClick={retry} disabled={retrying}>
        {retrying ? "Trying..." : "Try again"}
      </Button>
    </div>
  )
}
