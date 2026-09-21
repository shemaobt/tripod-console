import { useEffect, useState } from "react"
import { Pencil, Trash2, GitBranch } from "lucide-react"
import { toast } from "sonner"
import { phasesAPI } from "@/services/api"
import type { PhaseResponse } from "@/types"
import { usePhasesStore } from "@/stores/phasesStore"
import { cn } from "@/utils/cn"
import { states } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhaseFlowGraph } from "./phases/PhaseFlowGraph"
import { DependencyPanel } from "./phases/DependencyPanel"

const th =
  "px-5 py-3 text-left text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-fg-subtle border-b border-line"
const td = "px-5 py-3 border-b border-line"

export default function PhasesPage() {
  const { phases, dependencies: allDeps, loading, fetch: fetchPhasesData } = usePhasesStore()
  const [error, setError] = useState<string | null>(null)

  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<PhaseResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PhaseResponse | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPhasesData().catch(() => setError("Failed to load phases"))
  }, [fetchPhasesData])

  const selectedPhase = phases.find((p) => p.id === selectedPhaseId) ?? null
  const requiredBy = selectedPhase
    ? phases.filter((p) => (allDeps.get(p.id) ?? []).includes(selectedPhase.id))
    : []

  function openCreateDialog() {
    setEditingPhase(null)
    setFormName("")
    setFormDesc("")
    setDialogOpen(true)
  }

  function openEditDialog(phase: PhaseResponse) {
    setEditingPhase(phase)
    setFormName(phase.name)
    setFormDesc(phase.description ?? "")
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formName.trim()) {
      toast.error("Phase name is required")
      return
    }
    setSaving(true)
    try {
      if (editingPhase) {
        await phasesAPI.update(editingPhase.id, {
          name: formName.trim(),
          description: formDesc.trim() || null,
        })
        toast.success("Phase updated")
      } else {
        await phasesAPI.create({
          name: formName.trim(),
          description: formDesc.trim() || null,
        })
        toast.success("Phase created")
      }
      setDialogOpen(false)
      usePhasesStore.getState().invalidate()
      await fetchPhasesData()
    } catch {
      toast.error(editingPhase ? "Failed to update phase" : "Failed to create phase")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await phasesAPI.delete(deleteTarget.id)
      toast.success("Phase deleted")
      if (selectedPhaseId === deleteTarget.id) setSelectedPhaseId(null)
      setDeleteTarget(null)
      usePhasesStore.getState().invalidate()
      await fetchPhasesData()
    } catch {
      toast.error("Failed to delete phase. It may be in use by projects.")
    }
  }

  async function handleAddDependency(dependsOnId: string) {
    if (!selectedPhaseId) return
    try {
      await phasesAPI.addDependency(selectedPhaseId, dependsOnId)
      toast.success("Dependency added")
      usePhasesStore.getState().invalidate()
      await fetchPhasesData()
    } catch {
      toast.error("Failed to add dependency")
    }
  }

  async function handleRemoveDependency(dependsOnId: string) {
    if (!selectedPhaseId) return
    try {
      await phasesAPI.removeDependency(selectedPhaseId, dependsOnId)
      toast.success("Dependency removed")
      usePhasesStore.getState().invalidate()
      await fetchPhasesData()
    } catch {
      toast.error("Failed to remove dependency")
    }
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
        <div className={states.error}>{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted">
            Content
          </span>
          <h3 className="text-[1.5625rem] font-bold tracking-tight text-fg-strong">Phases</h3>
          <span className="text-[0.78125rem] text-fg-subtle">
            Global catalog — changes affect every project. Editable by admins and managers.
          </span>
        </div>
        <Button size="lg" onClick={openCreateDialog}>
          New phase
        </Button>
      </div>

      {phases.length === 0 ? (
        <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-5 sm:p-6">
          <EmptyState
            icon={GitBranch}
            title="No phases yet"
            description="Phases represent stages in your project workflow, like 'Planning', 'Data Collection', or 'Review'. Create your first phase to get started."
            actionLabel="Create Phase"
            onAction={openCreateDialog}
          />
        </div>
      ) : (
        <div className="space-y-[1.125rem]">
          <div className="grid grid-cols-1 gap-[1.125rem] lg:grid-cols-[1fr_18.75rem] items-start">
            <PhaseFlowGraph
              phases={phases}
              dependencies={allDeps}
              selectedPhaseId={selectedPhaseId}
              onSelectPhase={setSelectedPhaseId}
              minHeight={460}
            />
            <DependencyPanel
              selectedPhase={selectedPhase}
              phases={phases}
              dependencies={selectedPhase ? allDeps.get(selectedPhase.id) ?? [] : []}
              requiredBy={requiredBy}
              onAddDependency={handleAddDependency}
              onRemoveDependency={handleRemoveDependency}
              onEdit={() => selectedPhase && openEditDialog(selectedPhase)}
              onDelete={() => selectedPhase && setDeleteTarget(selectedPhase)}
            />
          </div>

          <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={th}>Phase</th>
                    <th className={th}>Description</th>
                    <th className={th}>Depends on</th>
                    <th className={th}>Projects</th>
                    <th className={cn(th, "text-right")} />
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase) => {
                    const depNames = (allDeps.get(phase.id) ?? [])
                      .map((id) => phases.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")
                    const projectCount = phase.project_ids?.length ?? 0
                    return (
                      <tr
                        key={phase.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted",
                          selectedPhaseId === phase.id && "bg-muted",
                        )}
                        onClick={() => setSelectedPhaseId(phase.id)}
                      >
                        <td className={cn(td, "whitespace-nowrap font-semibold text-fg-strong")}>
                          {phase.name}
                        </td>
                        <td className={cn(td, "text-[0.8125rem] text-fg-muted")}>
                          {phase.description || "—"}
                        </td>
                        <td className={cn(td, "text-[0.78125rem] text-fg-subtle")}>
                          {depNames || "—"}
                        </td>
                        <td className={cn(td, "text-fg-muted")}>
                          {projectCount > 0 ? projectCount : "—"}
                        </td>
                        <td className={cn(td, "whitespace-nowrap text-right")}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(phase)
                              }}
                              className="grid h-[1.875rem] w-[1.875rem] place-items-center rounded-[0.5625rem] text-fg-subtle transition-colors hover:bg-muted hover:text-fg-strong"
                            >
                              <Pencil className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget(phase)
                              }}
                              className="grid h-[1.875rem] w-[1.875rem] place-items-center rounded-[0.5625rem] text-fg-subtle transition-colors hover:bg-accent-soft hover:text-on-accent-soft"
                            >
                              <Trash2 className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhase ? "Edit Phase" : "New Phase"}</DialogTitle>
            <DialogDescription>
              {editingPhase
                ? "Update the phase name and description."
                : "Create a new phase for your project workflow."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phase-name">Name</Label>
              <Input
                id="phase-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Planning, Data Collection, Review"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phase-desc">Description</Label>
              <Textarea
                id="phase-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe what happens during this phase..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingPhase ? "Save Changes" : "Create Phase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Phase"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove the phase and all its dependency relationships. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
