import { useState } from "react"
import { X, Plus } from "lucide-react"
import type { PhaseResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DependencyPanelProps {
  selectedPhase: PhaseResponse | null
  phases: PhaseResponse[]
  dependencies: string[]
  requiredBy: PhaseResponse[]
  onAddDependency: (dependsOnId: string) => void
  onRemoveDependency: (dependsOnId: string) => void
  onEdit: () => void
  onDelete: () => void
}

const cardClass = "bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-5 min-h-[13.75rem]"
const sectionLabel = "text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-fg-subtle"

export function DependencyPanel({
  selectedPhase,
  phases,
  dependencies,
  requiredBy,
  onAddDependency,
  onRemoveDependency,
  onEdit,
  onDelete,
}: DependencyPanelProps) {
  const [addOpen, setAddOpen] = useState(false)

  if (!selectedPhase) {
    return (
      <div className={cardClass}>
        <div className="flex flex-col gap-1.5 pt-1.5">
          <h4 className="text-[0.96875rem] font-semibold text-fg-strong">Dependencies</h4>
          <p className="text-[0.8125rem] text-fg-subtle leading-[1.55]">
            Select a phase in the graph to inspect and edit its dependencies, or
            create a new phase for the whole ecosystem.
          </p>
        </div>
      </div>
    )
  }

  const depPhases = phases.filter((p) => dependencies.includes(p.id))
  const availablePhases = phases.filter(
    (p) => p.id !== selectedPhase.id && !dependencies.includes(p.id),
  )
  const projectCount = selectedPhase.project_ids?.length ?? 0
  const usedLine =
    projectCount > 0
      ? `Used in ${projectCount} project${projectCount !== 1 ? "s" : ""}`
      : "Not used by any project yet"

  function pick(id: string) {
    setAddOpen(false)
    onAddDependency(id)
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <h4 className="text-[0.96875rem] font-semibold text-fg-strong">
            {selectedPhase.name}
          </h4>
          {selectedPhase.description ? (
            <p className="text-[0.78125rem] text-fg-muted leading-[1.5]">
              {selectedPhase.description}
            </p>
          ) : (
            <p className="text-[0.78125rem] text-fg-subtle italic">No description</p>
          )}
          <span className="text-[0.71875rem] text-fg-subtle">{usedLine}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Depends on</span>
          {depPhases.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {depPhases.map((dep) => (
                <span
                  key={dep.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted pl-3 pr-1.5 py-[0.3125rem] text-xs text-fg"
                >
                  {dep.name}
                  <button
                    type="button"
                    onClick={() => onRemoveDependency(dep.id)}
                    title="Remove dependency"
                    className="grid h-[1.125rem] w-[1.125rem] place-items-center rounded-full text-fg-subtle transition-colors hover:bg-accent-soft hover:text-on-accent-soft"
                  >
                    <X className="h-[0.6875rem] w-[0.6875rem]" strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-fg-subtle">No dependencies.</span>
          )}

          {availablePhases.length > 0 && (
            <Popover open={addOpen} onOpenChange={setAddOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1.5 text-[0.78125rem] font-semibold text-accent hover:underline"
                >
                  <Plus className="h-[0.8125rem] w-[0.8125rem]" strokeWidth={2} />
                  Add dependency
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="max-h-[13.75rem] w-[14.375rem] overflow-auto p-1.5"
              >
                {availablePhases.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pick(p.id)}
                    className="block w-full rounded-lg px-2.5 py-2 text-left text-[0.8125rem] text-fg transition-colors hover:bg-muted"
                  >
                    {p.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          <span className="text-[0.6875rem] text-fg-subtle">
            Self-dependency and duplicates are rejected (409); cycles are blocked
            client-side.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Required by</span>
          {requiredBy.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {requiredBy.map((r) => (
                <span
                  key={r.id}
                  className="rounded-full bg-muted px-3 py-[0.3125rem] text-xs text-fg-muted"
                >
                  {r.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-fg-subtle">
              Nothing depends on this phase.
            </span>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-line pt-3.5">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline-destructive" size="sm" onClick={onDelete}>
            Delete…
          </Button>
        </div>
      </div>
    </div>
  )
}
