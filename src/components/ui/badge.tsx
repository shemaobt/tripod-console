import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-areia/30 text-verde border border-areia",
        success: "bg-verde-claro/20 text-verde-claro border border-verde-claro/30",
        error: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40",
        active: "bg-verde-claro/20 text-verde-claro",
        inactive: "bg-areia/30 text-verde",
        admin: "bg-telha/15 text-telha border border-telha/30",
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
