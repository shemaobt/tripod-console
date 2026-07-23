interface StatCardProps {
  label: string
  value: number
  subtitle?: string
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] px-5 py-[1.125rem] flex flex-col gap-[0.1875rem]">
      <span className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-fg-subtle">
        {label}
      </span>
      <span className="text-[1.875rem] font-bold leading-[1.1] tabular-nums text-fg-strong">
        {value.toLocaleString()}
      </span>
      {subtitle && <span className="text-xs text-fg-muted">{subtitle}</span>}
    </div>
  )
}
