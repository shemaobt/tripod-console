import type { ProjectResponse } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadFailed } from "@/components/common/LoadFailed"

export function ManagerProjectsDialog({
  open,
  onOpenChange,
  projects,
  onRetryProjects,
  loading,
  selectedIds,
  onSelectedIdsChange,
  saving,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: ProjectResponse[] | null
  onRetryProjects: () => void
  loading: boolean
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  saving: boolean
  onConfirm: () => void
}) {
  function toggle(projectId: string) {
    onSelectedIdsChange(
      selectedIds.includes(projectId)
        ? selectedIds.filter((id) => id !== projectId)
        : [...selectedIds, projectId],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select projects this user will manage</DialogTitle>
          <DialogDescription>
            Managers oversee specific projects. Select at least one project to
            grant this user the manager role.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-fg-muted">Loading projects...</p>
        ) : projects === null ? (
          <LoadFailed what="the projects" onRetry={onRetryProjects} />
        ) : projects.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No projects available. Create a project before assigning a manager.
          </p>
        ) : (
          <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-xl border border-line">
            {projects.map((project) => (
              <label
                key={project.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-accent"
                  checked={selectedIds.includes(project.id)}
                  onChange={() => toggle(project.id)}
                />
                <span className="text-sm text-fg-strong">{project.name}</span>
              </label>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={saving || selectedIds.length === 0}>
            {saving ? "Saving..." : "Make Manager"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
