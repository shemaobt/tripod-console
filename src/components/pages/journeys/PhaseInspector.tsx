import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, Circle, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { phasesAPI } from "@/services/api"
import type {
  DerivedPhaseStatus,
  PhaseCategory,
  PhaseResponse,
  PhaseStatus,
  PhaseStatusLogEntry,
} from "@/types"
import { PHASE_STATUSES } from "@/types"
import { CATEGORY_ICONS, JOURNEY_STATUS_CONFIG } from "@/constants/journeyStatus"
import { orbGrad, soft } from "@/utils/color"
import { cn } from "@/utils/cn"
import { collectReachable } from "./layout"
import { StatusHistory } from "./StatusHistory"
import type { CategoryVisual } from "./useJourneyBuilder"

interface PhaseInspectorProps {
  phase: PhaseResponse
  isAdmin: boolean
  hasProject: boolean
  hasLinkedProjects: boolean
  projectName: string | null
  phases: PhaseResponse[]
  deps: Record<string, string[]>
  kids: Record<string, string[]>
  stepNums: Record<string, string>
  logs: Record<string, PhaseStatusLogEntry[]>
  categories: PhaseCategory[]
  categoryFor: (categoryId: string | null) => CategoryVisual
  storedStatus: (phaseId: string) => PhaseStatus
  derivedStatus: (phaseId: string) => DerivedPhaseStatus
  onClose: () => void
  onSelectPhase: (id: string) => void
  onTitle: (value: string) => void
  onDescription: (value: string) => void
  onCategory: (categoryId: string) => void
  onToggleDep: (dependsOnId: string) => void
  onUploadIcon: () => void
  onClearIcon: () => void
  onRequestStatus: (to: PhaseStatus) => void
  onDelete: () => void
}

const EYEBROW = "text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted"

export function PhaseInspector({
  phase,
  isAdmin,
  hasProject,
  hasLinkedProjects,
  projectName,
  phases,
  deps,
  kids,
  stepNums,
  logs,
  categories,
  categoryFor,
  storedStatus,
  derivedStatus,
  onClose,
  onSelectPhase,
  onTitle,
  onDescription,
  onCategory,
  onToggleDep,
  onUploadIcon,
  onClearIcon,
  onRequestStatus,
  onDelete,
}: PhaseInspectorProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [usage, setUsage] = useState<{ id: string; count: number } | null>(null)
  const cat = categoryFor(phase.category_id)
  const CatIcon = CATEGORY_ICONS[cat.icon] ?? Circle
  const stored = storedStatus(phase.id)
  const derived = derivedStatus(phase.id)
  const status = JOURNEY_STATUS_CONFIG[derived]
  const cancelled = stored === "cancelled"
  const myDeps = deps[phase.id] ?? []
  const descendants = useMemo(() => collectReachable(phase.id, kids), [phase.id, kids])
  const unlocks = kids[phase.id] ?? []
  const others = phases.filter((p) => p.id !== phase.id)
  const unmet = myDeps.filter((d) => storedStatus(d) !== "completed").length
  const usedBy =
    usage && usage.id === phase.id ? usage.count : phase.project_ids?.length ?? 0

  const requestDelete = () => {
    const id = phase.id
    setUsage(null)
    setConfirmOpen(true)
    phasesAPI
      .get(id)
      .then(({ data }) => setUsage({ id, count: data.project_ids?.length ?? 0 }))
      .catch(() => undefined)
  }

  const confirmDescription = `Hard delete of "${phase.name}" from this journey. This cannot be undone.${
    usedBy > 0
      ? ` Used by ${usedBy} project${usedBy === 1 ? "" : "s"} — their phase statuses and history will be removed.`
      : ""
  }`

  return (
    <aside
      aria-label="Phase details"
      data-canvas-ui
      onMouseDown={(e) => e.stopPropagation()}
      className="animate-pop-in absolute bottom-3 right-3 top-3 z-30 flex w-[25rem] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[1.25rem] border border-line bg-elevated shadow-[var(--shadow-lg)]"
    >
      <div className="flex flex-none items-center gap-2 border-b border-line px-[1.125rem] py-[0.9375rem]">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65625rem] font-bold uppercase tracking-[0.08em]"
          style={{ background: soft(cat.color, 0.18), color: cat.color }}
        >
          <CatIcon className="h-[0.6875rem] w-[0.6875rem]" strokeWidth={2} />
          {cat.name}
        </span>
        <span className="font-mono text-[0.65625rem] tracking-[0.1em] text-fg-subtle">
          STEP {stepNums[phase.id]}
        </span>
        <button
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close details"
          className="ml-auto flex h-[1.875rem] w-[1.875rem] cursor-pointer items-center justify-center rounded-[0.5625rem] text-fg-muted transition-colors hover:bg-muted hover:text-fg-strong"
        >
          <X className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-[1.125rem] overflow-y-auto overflow-x-hidden px-[1.125rem] pb-5 pt-4">
        {isAdmin ? (
          <div>
            <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Phase title</div>
            <Input
              aria-label="Phase title"
              value={phase.name}
              onChange={(e) => onTitle(e.target.value)}
            />
          </div>
        ) : (
          <h2
            className={cn(
              "m-0 text-[1.1875rem] font-bold leading-[1.3] text-fg-strong",
              cancelled && "line-through",
            )}
          >
            {phase.name}
          </h2>
        )}

        {isAdmin && !hasProject && (
          <div>
            <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Status</div>
            <div className="rounded-[0.75rem] bg-muted px-3.5 py-3 text-[0.71875rem] leading-[1.6] text-fg-muted">
              {hasLinkedProjects
                ? "Structure only — no project statuses. Pick a project to track its phases."
                : "Statuses are tracked per project. Link a project in Journey settings to record them here."}
            </div>
          </div>
        )}

        {hasProject && (
          <div>
            <div className={cn(EYEBROW, "mb-[0.4375rem]")}>
              {projectName ? `Status · ${projectName}` : "Status"}
            </div>
            <span className="relative flex items-center">
              <span
                className="pointer-events-none absolute left-3 h-2.5 w-2.5 rounded-full"
                style={{ background: status.solid }}
              />
              <select
                aria-label="Phase status"
                value={stored}
                onChange={(e) => {
                  const v = e.target.value as PhaseStatus
                  if (v !== stored) onRequestStatus(v)
                }}
                className="h-10 w-full cursor-pointer appearance-none rounded-[0.75rem] border border-line-strong bg-elevated pl-[1.875rem] pr-8 text-[0.8125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
              >
                {PHASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {JOURNEY_STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 h-[0.8125rem] w-[0.8125rem] text-fg-subtle"
                strokeWidth={2}
              />
            </span>
            {stored === "not_started" && (
              <div
                className="mt-1.5 text-[0.71875rem]"
                style={{ color: derived === "ready" ? "#5F6534" : "#8A6209" }}
              >
                {derived === "ready"
                  ? "All dependencies met — this phase can start."
                  : `Waiting on ${unmet} unfinished ${unmet === 1 ? "dependency." : "dependencies."}`}
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <>
            <div>
              <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Category</div>
              <span className="relative flex items-center">
                <select
                  aria-label="Phase category"
                  value={phase.category_id ?? ""}
                  onChange={(e) => {
                    if (e.target.value) onCategory(e.target.value)
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-[0.75rem] border border-line-strong bg-elevated pl-3.5 pr-8 text-[0.8125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
                >
                  {phase.category_id === null && <option value="">Uncategorized</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 h-[0.8125rem] w-[0.8125rem] text-fg-subtle"
                  strokeWidth={2}
                />
              </span>
            </div>
            <div>
              <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Phase icon</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="relative flex h-[2.875rem] w-[2.875rem] flex-none items-center justify-center overflow-hidden rounded-full shadow-[0_0.375rem_0.75rem_-0.25rem_rgba(10,7,3,0.28)]"
                  style={{ background: orbGrad(cat.color) }}
                >
                  {phase.icon_url ? (
                    <img
                      src={phase.icon_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <CatIcon
                      className="relative h-[1.3125rem] w-[1.3125rem] text-[#F6F5EB]"
                      strokeWidth={1.85}
                    />
                  )}
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_33%_24%,rgba(255,255,255,0.32),rgba(255,255,255,0)_58%)] shadow-[inset_0_-0.3125rem_0.5625rem_rgba(10,7,3,0.22)]" />
                </span>
                <button
                  onClick={onUploadIcon}
                  className="flex cursor-pointer items-center gap-[0.4375rem] rounded-full px-3.5 py-[0.5625rem] text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted"
                >
                  <Upload className="h-3.5 w-3.5 text-fg-muted" strokeWidth={1.9} />
                  {phase.icon_url ? "Replace image" : "Upload image"}
                </button>
                {phase.icon_url && (
                  <button
                    onClick={onClearIcon}
                    className="cursor-pointer rounded-full px-3 py-[0.5625rem] text-[0.78125rem] font-semibold text-fg-muted transition-colors hover:bg-muted hover:text-fg-strong"
                  >
                    Use category icon
                  </button>
                )}
              </div>
              <div className="mt-1.5 text-[0.6875rem] text-fg-subtle">
                PNG, JPG or SVG · square crops best. Falls back to the category icon.
              </div>
            </div>
            <div>
              <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Description</div>
              <Textarea
                aria-label="Phase description"
                value={phase.description ?? ""}
                onChange={(e) => onDescription(e.target.value)}
                placeholder="What happens in this phase…"
                className="min-h-[5.5rem] text-[0.8125rem] leading-[1.55]"
              />
            </div>
          </>
        )}

        {!isAdmin && (
          <div>
            <div className={cn(EYEBROW, "mb-[0.4375rem]")}>Description</div>
            <p className="m-0 font-serif text-[0.8125rem] leading-[1.65] text-fg">
              {phase.description || "No description yet."}
            </p>
          </div>
        )}

        <div>
          <div className={cn(EYEBROW, "mb-[0.1875rem]")}>Dependencies</div>
          {isAdmin ? (
            <>
              <div className="mb-1.5 text-[0.71875rem] text-fg-subtle">
                Phases this one waits for. Faded rows would create a cycle.
              </div>
              {others.map((o) => {
                const on = myDeps.includes(o.id)
                const locked = descendants.has(o.id)
                const od = derivedStatus(o.id)
                return (
                  <button
                    key={o.id}
                    onClick={locked ? undefined : () => onToggleDep(o.id)}
                    aria-pressed={on}
                    title={locked ? "Would create a circular dependency" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[0.625rem] px-2.5 py-2 transition-colors hover:bg-muted",
                      locked ? "cursor-default opacity-35" : "cursor-pointer",
                    )}
                  >
                    <span
                      className={
                        on
                          ? "flex h-[1.0625rem] w-[1.0625rem] flex-none items-center justify-center rounded-[0.3125rem] bg-accent"
                          : "flex h-[1.0625rem] w-[1.0625rem] flex-none items-center justify-center rounded-[0.3125rem] bg-elevated shadow-[inset_0_0_0_0.09375rem_var(--color-line-strong)]"
                      }
                    >
                      {on && (
                        <Check
                          className="h-[0.6875rem] w-[0.6875rem] text-[#F6F5EB]"
                          strokeWidth={3.2}
                        />
                      )}
                    </span>
                    <span className="flex-none font-mono text-[0.65625rem] text-fg-subtle">
                      {stepNums[o.id]}
                    </span>
                    <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                      {o.name}
                    </span>
                    <span
                      className="ml-auto flex-none text-[0.65625rem] font-semibold"
                      style={{ color: JOURNEY_STATUS_CONFIG[od].text }}
                    >
                      {JOURNEY_STATUS_CONFIG[od].label}
                    </span>
                  </button>
                )
              })}
              {others.length === 0 && (
                <div className="py-1 text-[0.78125rem] text-fg-subtle">
                  No other phases in this journey yet.
                </div>
              )}
            </>
          ) : (
            <>
              {myDeps.map((d) => {
                const dep = phases.find((p) => p.id === d)
                if (!dep) return null
                const dd = derivedStatus(d)
                return (
                  <button
                    key={d}
                    onClick={() => onSelectPhase(d)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-2.5 py-2 transition-colors hover:bg-muted"
                  >
                    <span
                      className="h-2 w-2 flex-none rounded-full"
                      style={{ background: JOURNEY_STATUS_CONFIG[dd].solid }}
                    />
                    <span className="flex-none font-mono text-[0.65625rem] text-fg-subtle">
                      {stepNums[d]}
                    </span>
                    <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                      {dep.name}
                    </span>
                    <span className="ml-auto flex-none text-[0.65625rem] text-fg-subtle">
                      {JOURNEY_STATUS_CONFIG[dd].label}
                    </span>
                  </button>
                )
              })}
              {myDeps.length === 0 && (
                <div className="py-1 text-[0.78125rem] text-fg-subtle">
                  Starting phase — no dependencies.
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <div className={cn(EYEBROW, "mb-[0.1875rem]")}>Unlocks</div>
          {unlocks.map((u) => {
            const next = phases.find((p) => p.id === u)
            if (!next) return null
            const ud = derivedStatus(u)
            return (
              <button
                key={u}
                onClick={() => onSelectPhase(u)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[0.625rem] px-2.5 py-2 transition-colors hover:bg-muted"
              >
                <span
                  className="h-2 w-2 flex-none rounded-full"
                  style={{ background: JOURNEY_STATUS_CONFIG[ud].solid }}
                />
                <span className="flex-none font-mono text-[0.65625rem] text-fg-subtle">
                  {stepNums[u]}
                </span>
                <span className="truncate text-[0.8125rem] font-semibold text-fg-strong">
                  {next.name}
                </span>
                <span className="ml-auto flex-none text-[0.65625rem] text-fg-subtle">
                  {JOURNEY_STATUS_CONFIG[ud].label}
                </span>
                <ChevronRight
                  className="h-[0.8125rem] w-[0.8125rem] flex-none text-fg-subtle"
                  strokeWidth={2}
                />
              </button>
            )
          })}
          {unlocks.length === 0 && (
            <div className="py-1 text-[0.78125rem] text-fg-subtle">
              Nothing depends on this phase yet.
            </div>
          )}
        </div>

        {hasProject && <StatusHistory entries={logs[phase.id] ?? []} />}

        {isAdmin && (
          <div className="flex justify-end border-t border-line pt-3.5">
            <button
              onClick={requestDelete}
              className="cursor-pointer rounded-full px-4 py-2 text-[0.78125rem] font-bold text-[#A63A2E] shadow-[inset_0_0_0_0.09375rem_#A63A2E66] transition-colors hover:bg-[#F0DCD8]"
            >
              Delete phase
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete phase"
        description={confirmDescription}
        confirmLabel="Delete phase"
        onConfirm={onDelete}
      />
    </aside>
  )
}
