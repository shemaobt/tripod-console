import { useState } from "react"
import { ChevronDown, ChevronUp, Circle, Image, Plus, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { phasesAPI } from "@/services/api"
import type { PhaseCategory, PhaseResponse } from "@/types"
import { CATEGORY_ICONS } from "@/constants/journeyStatus"
import { orbGrad } from "@/utils/color"
import { cn } from "@/utils/cn"
import type { CategoryVisual } from "./useJourneyBuilder"

interface RegistryPhasesTabProps {
  phases: PhaseResponse[]
  stepNums: Record<string, string>
  categories: PhaseCategory[]
  categoryFor: (categoryId: string | null) => CategoryVisual
  onTitle: (id: string, value: string) => void
  onCategory: (id: string, categoryId: string) => void
  onUploadIcon: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  onDelete: (id: string) => void
  onAddPhase: () => void
}

const ROW_BTN =
  "flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-[0.5rem] text-fg-muted transition-colors hover:bg-elevated hover:text-fg-strong"

export function RegistryPhasesTab({
  phases,
  stepNums,
  categories,
  categoryFor,
  onTitle,
  onCategory,
  onUploadIcon,
  onMove,
  onDelete,
  onAddPhase,
}: RegistryPhasesTabProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ id: string; count: number } | null>(null)
  const target = phases.find((p) => p.id === deleteId)
  const usedBy =
    usage && usage.id === deleteId ? usage.count : target?.project_ids?.length ?? 0

  const requestDelete = (id: string) => {
    setUsage(null)
    setDeleteId(id)
    phasesAPI
      .get(id)
      .then(({ data }) => setUsage({ id, count: data.project_ids?.length ?? 0 }))
      .catch(() => undefined)
  }
  const confirmDescription = target
    ? `Hard delete of "${target.name}" from this journey. This cannot be undone.${
        usedBy > 0
          ? ` Used by ${usedBy} project${usedBy === 1 ? "" : "s"} — their phase statuses and history will be removed.`
          : ""
      }`
    : ""

  return (
    <div className="flex flex-col gap-[0.4375rem]">
      <div className="mb-px text-[0.71875rem] text-fg-subtle">
        Order sets the step numbers. Dependencies stay as drawn on the canvas.
      </div>
      {phases.map((phase) => {
        const cat = categoryFor(phase.category_id)
        const CatIcon = CATEGORY_ICONS[cat.icon] ?? Circle
        return (
          <div
            key={phase.id}
            className="flex min-w-0 items-center gap-[0.5625rem] rounded-[0.875rem] bg-muted px-2.5 py-2"
          >
            <span className="w-5 flex-none font-mono text-[0.625rem] font-bold tracking-[0.08em] text-fg-subtle">
              {stepNums[phase.id]}
            </span>
            <span
              className="relative flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full text-on-dark shadow-[0_0.1875rem_0.375rem_-0.125rem_rgba(10,7,3,0.3)]"
              style={{ background: orbGrad(cat.color) }}
            >
              {phase.icon_url ? (
                <img
                  src={phase.icon_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <CatIcon className="relative h-[0.9375rem] w-[0.9375rem]" strokeWidth={1.9} />
              )}
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_33%_24%,rgba(255,255,255,0.3),rgba(255,255,255,0)_58%)]" />
            </span>
            <input
              aria-label="Phase title"
              value={phase.name}
              onChange={(e) => onTitle(phase.id, e.target.value)}
              className="h-[2.125rem] min-w-0 flex-1 rounded-[0.625rem] border border-line-strong bg-elevated px-2.5 text-[0.8125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
            />
            <span className="relative flex flex-none items-center">
              <select
                aria-label="Phase category"
                value={phase.category_id ?? ""}
                onChange={(e) => {
                  if (e.target.value) onCategory(phase.id, e.target.value)
                }}
                className="h-[2.125rem] w-[9.375rem] cursor-pointer appearance-none rounded-[0.625rem] border border-line-strong bg-elevated pl-2.5 pr-7 text-[0.78125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
              >
                {phase.category_id === null && <option value="">Uncategorized</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 h-3 w-3 text-fg-subtle"
                strokeWidth={2}
              />
            </span>
            <button
              onClick={() => onUploadIcon(phase.id)}
              title={phase.icon_url ? "Replace icon image" : "Upload icon image"}
              aria-label="Upload icon image"
              className={cn(ROW_BTN, phase.icon_url && "text-accent")}
            >
              <Image className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={1.9} />
            </button>
            <span className="flex flex-none gap-0.5">
              <button
                onClick={() => onMove(phase.id, -1)}
                title="Move earlier"
                aria-label="Move earlier"
                className={ROW_BTN}
              >
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.1} />
              </button>
              <button
                onClick={() => onMove(phase.id, 1)}
                title="Move later"
                aria-label="Move later"
                className={ROW_BTN}
              >
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.1} />
              </button>
              <button
                onClick={() => requestDelete(phase.id)}
                title="Delete phase"
                aria-label="Delete phase"
                className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-[0.5rem] text-[#A63A2E] transition-colors hover:bg-[#F0DCD8]"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
              </button>
            </span>
          </div>
        )
      })}
      <button
        onClick={onAddPhase}
        className="mt-[0.1875rem] flex cursor-pointer items-center gap-2 self-start rounded-full px-3.5 py-[0.5625rem] text-[0.78125rem] font-bold text-accent transition-colors hover:bg-accent-soft"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        Add phase
      </button>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title="Delete phase"
        description={confirmDescription}
        confirmLabel="Delete phase"
        onConfirm={() => {
          if (deleteId) onDelete(deleteId)
        }}
      />
    </div>
  )
}
