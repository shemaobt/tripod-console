import { Check, ChevronDown, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Journey } from "@/types"
import { cn } from "@/utils/cn"

interface JourneyMenuPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  journeys: Journey[]
  currentId: string | null
  currentName: string
  phaseCountFor: (j: Journey) => number
  projectCountFor: (jid: string) => number
  onPick: (id: string) => void
  onNew: () => void
}

export function JourneyMenuPopover({
  open,
  onOpenChange,
  journeys,
  currentId,
  currentName,
  phaseCountFor,
  projectCountFor,
  onPick,
  onNew,
}: JourneyMenuPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-haspopup="true"
        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-elevated px-3.5 text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted"
      >
        <span className="font-medium text-fg-subtle">Journey:</span>
        {currentName}
        <ChevronDown className="h-[0.8125rem] w-[0.8125rem] text-fg-subtle" strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[20.625rem] rounded-[1rem] p-2">
        {journeys.map((j) => {
          const projCount = projectCountFor(j.id)
          const active = j.id === currentId
          return (
            <button
              key={j.id}
              onClick={() => onPick(j.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-3 py-2.5 transition-colors hover:bg-muted",
                active && "bg-muted",
              )}
            >
              <span className="flex min-w-0 flex-col gap-px text-left">
                <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                  {j.name}
                </span>
                <span className="text-[0.6875rem] text-fg-subtle">
                  {phaseCountFor(j)} phases · {projCount} {projCount === 1 ? "project" : "projects"}
                </span>
              </span>
              {active && (
                <Check
                  className="ml-auto h-[0.9375rem] w-[0.9375rem] flex-none text-accent"
                  strokeWidth={2.4}
                />
              )}
            </button>
          )
        })}
        <div className="mx-1 mb-0.5 mt-1.5 border-t border-line pt-1.5">
          <button
            onClick={onNew}
            className="flex w-full cursor-pointer items-center gap-2 rounded-[0.625rem] px-3 py-[0.5625rem] text-[0.8125rem] font-bold text-accent transition-colors hover:bg-accent-soft"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            New journey
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
