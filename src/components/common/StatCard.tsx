interface StatCardProps {
  label: string
  value: number
  subtitle?: string
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] px-5 py-[18px] flex flex-col gap-[3px]">
      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-fg-subtle">
        {label}
      </span>
      <span className="text-[30px] font-bold leading-[1.1] tabular-nums text-fg-strong">
        {value.toLocaleString()}
      </span>
      {subtitle && <span className="text-xs text-fg-muted">{subtitle}</span>}
    </div>
  )
}
