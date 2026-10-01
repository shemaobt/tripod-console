import { Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { PhaseCategory } from "@/types"
import { JOURNEY_STATUS_CONFIG, LEGEND_STATUS_ORDER } from "@/constants/journeyStatus"

interface LegendPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: PhaseCategory[]
}

export function LegendPopover({ open, onOpenChange, categories }: LegendPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-pressed={open}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[0.78125rem] font-semibold text-fg-muted shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted hover:text-fg-strong"
      >
        <Info className="h-[0.8125rem] w-[0.8125rem]" strokeWidth={2} />
        Legend
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[20.625rem] rounded-[1rem] p-[1.125rem]">
        <div className="mb-2.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
          Status
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {LEGEND_STATUS_ORDER.map((key) => {
            const s = JOURNEY_STATUS_CONFIG[key]
            const Icon = s.icon
            return (
              <span key={key} className="flex items-center gap-[0.4375rem] text-[0.75rem] text-fg">
                <span
                  className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full"
                  style={{ background: s.solid }}
                >
                  <Icon className="h-2 w-2 text-[#F6F5EB]" strokeWidth={3} />
                </span>
                {s.label}
              </span>
            )
          })}
        </div>
        <div className="mb-2.5 mt-3.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
          Category
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {categories.map((c) => (
            <span key={c.id} className="flex items-center gap-[0.4375rem] text-[0.75rem] text-fg">
              <span
                className="h-[0.5625rem] w-[0.5625rem] flex-none rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </span>
          ))}
        </div>
        <div className="mt-3.5 border-t border-line pt-2.5 text-[0.6875rem] leading-[1.7] text-fg-subtle">
          Platform admins build journeys — phases, descriptions, dependencies, project assignment.
          Managers update phase status only.
        </div>
      </PopoverContent>
    </Popover>
  )
}
