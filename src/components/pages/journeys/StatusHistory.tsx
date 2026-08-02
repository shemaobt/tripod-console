import { ArrowRight } from "lucide-react"
import type { PhaseStatusLogEntry } from "@/types"
import { JOURNEY_STATUS_CONFIG } from "@/constants/journeyStatus"
import { formatStatusTimestamp } from "@/utils/format"

interface StatusHistoryProps {
  entries: PhaseStatusLogEntry[]
}

export function StatusHistory({ entries }: StatusHistoryProps) {
  return (
    <div className="border-t border-line pt-3.5">
      <div className="mb-2.5 flex items-baseline gap-2">
        <div className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
          Status history
        </div>
        <span className="font-mono text-[0.625rem] text-fg-subtle">{entries.length}</span>
      </div>
      {entries.length === 0 && (
        <div className="text-[0.78125rem] leading-[1.6] text-fg-subtle">
          No status changes recorded yet. The next change will ask for a note.
        </div>
      )}
      {entries.map((entry, i) => {
        const from = JOURNEY_STATUS_CONFIG[entry.from_status] ?? JOURNEY_STATUS_CONFIG.not_started
        const to = JOURNEY_STATUS_CONFIG[entry.to_status] ?? JOURNEY_STATUS_CONFIG.not_started
        const who = `${entry.changed_by_name} · ${entry.is_admin_author ? "Platform admin" : "Project manager"}`
        return (
          <div key={entry.id} className="relative flex gap-[0.6875rem] pb-4">
            {i < entries.length - 1 && (
              <span className="absolute bottom-px left-1 top-[0.9375rem] w-[0.09375rem] bg-line" />
            )}
            <span
              className="relative mt-[0.3125rem] h-[0.5625rem] w-[0.5625rem] flex-none rounded-full"
              style={{ background: to.solid }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[0.3125rem]">
              <div className="flex flex-wrap items-center gap-[0.4375rem]">
                <span className="text-[0.65625rem] font-semibold text-fg-subtle">{from.label}</span>
                <ArrowRight className="h-[0.6875rem] w-[0.6875rem] flex-none text-fg-subtle" strokeWidth={2.2} />
                <span
                  className="rounded-full px-[0.5625rem] py-[0.15625rem] text-[0.65625rem] font-bold"
                  style={{ background: to.soft, color: to.text }}
                >
                  {to.label}
                </span>
              </div>
              {entry.note ? (
                <p className="m-0 font-serif text-[0.78125rem] leading-[1.6] text-fg">
                  {entry.note}
                </p>
              ) : (
                <span className="text-[0.75rem] italic text-fg-subtle">No note left.</span>
              )}
              <span className="text-[0.65625rem] text-fg-subtle">
                {who} · {formatStatusTimestamp(entry.created_at)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
