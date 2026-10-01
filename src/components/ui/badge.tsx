import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-muted text-fg-muted",
        success: "bg-st-ok/15 text-st-ok",
        error: "bg-accent-soft text-on-accent-soft",
        active: "bg-st-ok/15 text-st-ok",
        inactive: "bg-muted text-fg-muted",
        admin: "bg-inverse text-on-dark",
        manager: "bg-telha text-on-dark",
        member: "bg-secondary-strong text-on-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
