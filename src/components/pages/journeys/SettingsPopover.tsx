import { useState } from "react"
import { Check, Folder, Search, Settings } from "lucide-react"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { Journey, ProjectResponse } from "@/types"

interface SettingsPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  journey: Journey | null
  journeys: Journey[]
  phaseCount: number
  assignedCount: number
  projects: ProjectResponse[]
  onRename: (name: string) => void
  onDescribe: (description: string) => void
  onToggleProject: (projectId: string, on: boolean) => void
  onDelete: () => void
}

const ICON_BTN =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-fg-muted shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted hover:text-fg-strong"

export function SettingsPopover({
  open,
  onOpenChange,
  journey,
  journeys,
  phaseCount,
  assignedCount,
  projects,
  onRename,
  onDescribe,
  onToggleProject,
  onDelete,
}: SettingsPopoverProps) {
  const [query, setQuery] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const setOpen = (next: boolean) => {
    if (next) setQuery("")
    onOpenChange(next)
  }

  const q = query.trim().toLowerCase()
  const filtered = projects.filter((p) => !q || p.name.toLowerCase().includes(q))
  const linkedCount = projects.filter((p) => p.journey_id === journey?.id).length
  const linkedLabel = `${assignedCount} ${assignedCount === 1 ? "project linked" : "projects linked"}`
  const canDelete = journeys.length > 1
  const journeyName = (id: string | null | undefined) =>
    id ? journeys.find((j) => j.id === id)?.name ?? "Unassigned" : "No journey"

  const confirmDescription = journey
    ? `Hard delete of "${journey.name}" and its ${phaseCount} phase${phaseCount === 1 ? "" : "s"}. This cannot be undone.${
        assignedCount > 0
          ? ` Assigned to ${assignedCount} project${assignedCount === 1 ? "" : "s"} — they will be left without a journey and their phase statuses will be removed.`
          : ""
      }`
    : ""

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setOpen(!open)}
              title="Journey settings — rename, description, assigned projects"
              className={ICON_BTN}
            >
              <Settings className="h-4 w-4" strokeWidth={1.9} />
            </button>
            <button
              onClick={() => setOpen(!open)}
              title="Choose which projects follow this journey"
              className="flex h-9 cursor-pointer items-center gap-[0.4375rem] rounded-full bg-elevated px-3.5 text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted"
            >
              <Folder className="h-3.5 w-3.5 text-fg-muted" strokeWidth={1.9} />
              {linkedLabel}
            </button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="flex max-h-[calc(100vh-8rem)] w-[22.5rem] flex-col gap-3.5 overflow-y-auto rounded-[1rem] p-[1.125rem]"
        >
          <div className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
            Journey settings
          </div>
          <div>
            <label
              htmlFor="jn_name"
              className="mb-[0.3125rem] block text-[0.71875rem] font-semibold text-fg-muted"
            >
              Journey name
            </label>
            <input
              id="jn_name"
              value={journey?.name ?? ""}
              onChange={(e) => onRename(e.target.value)}
              className="h-[2.375rem] w-full rounded-[0.625rem] border border-line-strong bg-elevated px-3 text-[0.8125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="jn_desc"
              className="mb-[0.3125rem] block text-[0.71875rem] font-semibold text-fg-muted"
            >
              Description
            </label>
            <textarea
              id="jn_desc"
              value={journey?.description ?? ""}
              onChange={(e) => onDescribe(e.target.value)}
              placeholder="What this journey is for…"
              className="min-h-16 w-full resize-y rounded-[0.625rem] border border-line-strong bg-elevated px-3 py-[0.5625rem] text-[0.78125rem] leading-normal text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <div className="mb-[0.1875rem] text-[0.71875rem] font-semibold text-fg-muted">
              Linked projects
            </div>
            <div className="mb-2 text-[0.6875rem] text-fg-subtle">
              Tick the projects that inherit this journey’s phases. Each project follows exactly
              one journey.
            </div>
            <span className="relative mb-1.5 flex items-center">
              <Search
                className="pointer-events-none absolute left-[0.6875rem] h-[0.8125rem] w-[0.8125rem] text-fg-subtle"
                strokeWidth={2}
              />
              <input
                aria-label="Search projects"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all projects…"
                className="h-[2.125rem] w-full rounded-[0.625rem] border border-line-strong bg-elevated pl-[1.9375rem] pr-3 text-[0.78125rem] text-fg-strong placeholder:text-fg-subtle focus:border-accent focus:outline-none"
              />
            </span>
            <div className="flex max-h-[14.25rem] flex-col overflow-y-auto">
              {filtered.map((p) => {
                const on = p.journey_id === journey?.id
                return (
                  <button
                    key={p.id}
                    onClick={() => onToggleProject(p.id, !on)}
                    aria-pressed={on}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-2.5 py-2 transition-colors hover:bg-muted"
                  >
                    <span
                      className={
                        on
                          ? "flex h-[1.0625rem] w-[1.0625rem] flex-none items-center justify-center rounded-[0.3125rem] bg-accent"
                          : "flex h-[1.0625rem] w-[1.0625rem] flex-none items-center justify-center rounded-[0.3125rem] bg-elevated shadow-[inset_0_0_0_0.09375rem_var(--color-line-strong)]"
                      }
                    >
                      {on && (
                        <Check className="h-[0.6875rem] w-[0.6875rem] text-[#F6F5EB]" strokeWidth={3.2} />
                      )}
                    </span>
                    <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                      {p.name}
                    </span>
                    <span className="ml-auto flex-none text-[0.65625rem] text-fg-subtle">
                      {on ? "This journey" : journeyName(p.journey_id)}
                    </span>
                  </button>
                )
              })}
            </div>
            {filtered.length === 0 && (
              <div className="px-0.5 py-2 text-[0.75rem] text-fg-subtle">
                No project matches “{query}”.
              </div>
            )}
            <div className="mt-2 text-[0.65625rem] text-fg-subtle">
              {projects.length} projects · {linkedCount} linked to this journey
            </div>
          </div>
          {canDelete && (
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-[0.6875rem] text-fg-subtle">
                Phases and assignments are removed.
              </span>
              <button
                onClick={() => setConfirmOpen(true)}
                className="cursor-pointer rounded-full px-4 py-2 text-[0.78125rem] font-bold text-[#A63A2E] shadow-[inset_0_0_0_0.09375rem_#A63A2E66] transition-colors hover:bg-[#F0DCD8]"
              >
                Delete journey
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete journey"
        description={confirmDescription}
        confirmLabel="Delete journey"
        onConfirm={onDelete}
      />
    </>
  )
}
