import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/utils/cn"
import type { JourneyBuilder } from "./useJourneyBuilder"
import { RegistryPhasesTab } from "./RegistryPhasesTab"
import { RegistryCategoriesTab } from "./RegistryCategoriesTab"

interface RegistryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  builder: JourneyBuilder
  stepNums: Record<string, string>
}

export function RegistryDialog({ open, onOpenChange, builder, stepNums }: RegistryDialogProps) {
  const [tab, setTab] = useState<"phases" | "cats">("phases")
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTab("phases")
      setEditingId(null)
    }
    onOpenChange(next)
  }

  const segClass = (on: boolean) =>
    cn(
      "cursor-pointer rounded-full px-3.5 py-1.5 text-[0.78125rem] font-semibold transition-colors",
      on ? "bg-elevated text-fg-strong shadow-[var(--shadow-sm)]" : "text-fg-muted",
    )

  const handleAddCategory = async () => {
    const id = await builder.addCategory()
    if (id) {
      setTab("cats")
      setEditingId(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-label="Phase and category registry"
        className="flex max-h-[calc(100vh-2.5rem)] flex-col gap-0 overflow-hidden rounded-[1.375rem] p-0 sm:p-0 sm:max-w-[49.375rem]"
      >
        <div className="flex flex-none items-center gap-3.5 border-b border-line py-[0.9375rem] pl-[1.125rem] pr-12">
          <span className="flex flex-col gap-px">
            <DialogTitle className="text-[0.9375rem] font-bold text-fg-strong">
              Registry
            </DialogTitle>
            <span className="text-[0.71875rem] text-fg-subtle">
              {builder.journey?.name ?? "—"} · {builder.phases.length} phases ·{" "}
              {builder.categories.length} categories
            </span>
          </span>
          <span className="flex gap-0.5 rounded-full bg-muted p-[0.1875rem]">
            <button
              onClick={() => {
                setTab("phases")
                setEditingId(null)
              }}
              aria-pressed={tab === "phases"}
              className={segClass(tab === "phases")}
            >
              Phases
            </button>
            <button
              onClick={() => {
                setTab("cats")
                setEditingId(null)
              }}
              aria-pressed={tab === "cats"}
              className={segClass(tab === "cats")}
            >
              Categories
            </button>
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[1.125rem] pb-[1.125rem] pt-3.5">
          {tab === "phases" ? (
            <RegistryPhasesTab
              phases={builder.phases}
              stepNums={stepNums}
              categories={builder.categories}
              categoryFor={builder.categoryFor}
              onTitle={(id, name) => builder.updatePhaseField(id, { name })}
              onCategory={(id, categoryId) =>
                builder.updatePhaseField(id, { category_id: categoryId }, true)
              }
              onUploadIcon={builder.uploadPhaseIcon}
              onMove={(id, dir) => void builder.reorderPhase(id, dir)}
              onDelete={(id) => void builder.deletePhase(id)}
              onAddPhase={() => void builder.addPhase()}
            />
          ) : (
            <RegistryCategoriesTab
              categories={builder.categories}
              editingId={editingId}
              onToggleEdit={(id) => setEditingId((cur) => (cur === id ? null : id))}
              onName={(id, name) => builder.updateCategory(id, { name })}
              onColor={(id, color) => builder.updateCategory(id, { color }, true)}
              onIcon={(id, icon) => builder.updateCategory(id, { icon }, true)}
              onDelete={(id) => void builder.deleteCategory(id)}
              onAddCategory={() => void handleAddCategory()}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
