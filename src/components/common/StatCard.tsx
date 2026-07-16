import type { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  subtitle?: string
  iconBg?: string
  iconColor?: string
  accent?: string
  highlight?: boolean
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor = "text-fg-subtle",
  highlight,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-elevated rounded-[18px] shadow-[var(--shadow-card)] p-5 flex flex-col gap-1 transition-all duration-200 hover:shadow-[var(--shadow-md)]",
        highlight && "ring-1 ring-accent/25",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-fg-subtle">
          {label}
        </span>
        <Icon className={cn("h-4 w-4 shrink-0", highlight ? "text-accent" : iconColor)} strokeWidth={1.75} />
      </div>
      <span
        className={cn(
          "text-[30px] font-bold leading-tight tabular-nums",
          highlight ? "text-accent" : "text-fg-strong",
        )}
      >
        {value.toLocaleString()}
      </span>
      {subtitle && <span className="text-xs text-fg-muted">{subtitle}</span>}
    </div>
  )
}
