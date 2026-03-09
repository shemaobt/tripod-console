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
  iconBg = "bg-azul/15",
  iconColor = "text-azul",
  accent = "from-azul/5 to-transparent",
  highlight,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-surface transition-all duration-200 hover:shadow-md",
        highlight
          ? "border-telha/40 ring-1 ring-telha/15 shadow-sm"
          : "border-areia/20 shadow-sm",
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", accent)} />
      <div className="relative p-6 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-verde/70">{label}</p>
          <p
            className={cn(
              "text-4xl font-bold tracking-tight tabular-nums",
              highlight ? "text-telha" : "text-preto",
            )}
          >
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-verde/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-2xl p-3 shrink-0", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
