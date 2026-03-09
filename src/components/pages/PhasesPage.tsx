import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, GitBranch } from "lucide-react"
import { toast } from "sonner"
import { phasesAPI } from "@/services/api"
import type { PhaseResponse } from "@/types"
import { usePhasesStore } from "@/stores/phasesStore"
import { cn } from "@/utils/cn"
import { card, states } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
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
      <div className="p-4 sm:p-6 md:p-8">
        <div className={states.error}>{error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-preto">
            Phases
          </h1>
          <InfoTooltip content="Phases define the stages of a project workflow. Set up dependencies to enforce ordering between phases." />
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Phase
        </Button>
      </div>

      {phases.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No phases yet"
          description="Phases represent stages in your project workflow, like 'Planning', 'Data Collection', or 'Review'. Create your first phase to get started."
          actionLabel="Create Phase"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-6">
          {/* Phase Graph — full width, prominent */}
          <div className={card.padded}>
            <h2 className="text-sm font-semibold text-verde mb-4 flex items-center gap-1">
              Dependency Graph
              <InfoTooltip content="Visual representation of phase ordering. Arrows flow from prerequisite to dependent phase. Click a node to manage its dependencies." />
            </h2>
            <PhaseFlowGraph
              phases={phases}
              dependencies={allDeps}
              selectedPhaseId={selectedPhaseId}
              onSelectPhase={setSelectedPhaseId}
              minHeight={480}
            />
          </div>

          {/* Table + Dependency Panel side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Phase Table */}
            <div className={card.padded}>
              <h2 className="text-sm font-semibold text-verde mb-4 flex items-center gap-1">
                All Phases
                <InfoTooltip content="Click a phase in the graph to manage its dependencies." />
              </h2>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-areia/20">
                      <th className="text-left px-3 py-2.5 text-verde font-medium">
                        Name
                      </th>
                      <th className="text-left px-3 py-2.5 text-verde font-medium hidden sm:table-cell">
                        Description
                      </th>
                      <th className="text-center px-3 py-2.5 text-verde font-medium">
                        Deps
                      </th>
                      <th className="text-right px-3 py-2.5 text-verde font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {phases.map((phase) => {
                      const depCount = (allDeps.get(phase.id) ?? []).length
                      return (
                        <tr
                          key={phase.id}
                          className={cn(
                            "border-t border-areia/10 hover:bg-surface-alt/50 transition-colors cursor-pointer",
                            selectedPhaseId === phase.id && "bg-surface-alt",
                          )}
                          onClick={() => setSelectedPhaseId(selectedPhaseId === phase.id ? null : phase.id)}
                        >
                          <td className="px-3 py-3 font-medium text-preto">
                            {phase.name}
                          </td>
                          <td className="px-3 py-3 text-verde/70 hidden sm:table-cell max-w-[200px] truncate">
                            {phase.description || "\u2014"}
                          </td>
                          <td className="px-3 py-3 text-center text-verde/70">
                            {depCount}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openEditDialog(phase) }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(phase) }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dependency Panel */}
            <div>
              {selectedPhase ? (
                <DependencyPanel
                  selectedPhase={selectedPhase}
                  phases={phases}
                  dependencies={allDeps.get(selectedPhaseId!) ?? []}
                  onAddDependency={handleAddDependency}
                  onRemoveDependency={handleRemoveDependency}
                />
              ) : (
                <div className={cn(card.padded, "flex items-center justify-center text-sm text-verde/50")} style={{ minHeight: 120 }}>
                  Select a phase to manage its dependencies
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhase ? "Edit Phase" : "New Phase"}
            </DialogTitle>
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
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingPhase
                  ? "Save Changes"
                  : "Create Phase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
