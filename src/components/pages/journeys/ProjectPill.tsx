import { Check, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ProjectResponse } from "@/types"
import { cn } from "@/utils/cn"

interface ProjectPillProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: ProjectResponse[]
  currentId: string | null
  phasesTotal: number
  showTemplate: boolean
  onPick: (id: string) => void
  onPickTemplate: () => void
}

const ROW =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-3 py-2.5 transition-colors hover:bg-muted"
const CHECK = "ml-auto h-[0.9375rem] w-[0.9375rem] flex-none text-accent"

export function ProjectPill({
  open,
  onOpenChange,
  projects,
  currentId,
  phasesTotal,
  showTemplate,
  onPick,
  onPickTemplate,
}: ProjectPillProps) {
  if (projects.length === 0) return null
  const current = projects.find((p) => p.id === currentId)

  const completedLabel = (p: ProjectResponse) =>
    `${p.phases_completed ?? 0} of ${phasesTotal} ${phasesTotal === 1 ? "phase" : "phases"} completed`

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-haspopup="true"
        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-elevated px-3.5 text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted"
      >
        <span className="font-medium text-fg-subtle">Project:</span>
        <span className="max-w-[11rem] truncate">{current?.name ?? "Journey template"}</span>
        <ChevronDown className="h-[0.8125rem] w-[0.8125rem] text-fg-subtle" strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[20.625rem] rounded-[1rem] p-2">
        {showTemplate && (
          <>
            <button
              onClick={onPickTemplate}
              className={cn(ROW, !current && "bg-muted")}
              aria-pressed={!current}
            >
              <span className="flex min-w-0 flex-col items-start gap-px">
                <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                  Journey template
                </span>
                <span className="text-[0.6875rem] text-fg-subtle">
                  Structure only — no project statuses
                </span>
              </span>
              {!current && <Check className={CHECK} strokeWidth={2.4} />}
            </button>
            <div className="mx-3 mb-1 mt-2 border-t border-line pt-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
              Projects on this journey
            </div>
          </>
        )}
        {projects.map((p) => {
          const active = p.id === currentId
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={cn(ROW, active && "bg-muted")}
              aria-pressed={active}
            >
              <span className="flex min-w-0 flex-col items-start gap-px">
                <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                  {p.name}
                </span>
                <span className="text-[0.6875rem] text-fg-subtle">{completedLabel(p)}</span>
              </span>
              {active && <Check className={CHECK} strokeWidth={2.4} />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
