import { Check, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ProjectResponse } from "@/types"
import { cn } from "@/utils/cn"

interface ProjectPillProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: ProjectResponse[]
  currentId: string | null
  onPick: (id: string) => void
}

export function ProjectPill({ open, onOpenChange, projects, currentId, onPick }: ProjectPillProps) {
  if (projects.length === 0) return null
  const current = projects.find((p) => p.id === currentId)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-haspopup="true"
        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-elevated px-3.5 text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted"
      >
        <span className="font-medium text-fg-subtle">Project:</span>
        <span className="max-w-[11rem] truncate">{current?.name ?? "—"}</span>
        <ChevronDown className="h-[0.8125rem] w-[0.8125rem] text-fg-subtle" strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[20.625rem] rounded-[1rem] p-2">
        {projects.map((p) => {
          const active = p.id === currentId
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-3 py-2.5 transition-colors hover:bg-muted",
                active && "bg-muted",
              )}
            >
              <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                {p.name}
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
      </PopoverContent>
    </Popover>
  )
}
