import { Loader2 } from "lucide-react"
import type { LanguageProjectRef, LanguageResponse } from "@/types"
import { states } from "@/styles"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type LanguageUsage =
  | { status: "checking" }
  | { status: "known"; projects: LanguageProjectRef[] }
  | { status: "unknown" }

interface DeactivateLanguageDialogProps {
  language: LanguageResponse | null
  usage: LanguageUsage
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function usageDescription(name: string, usage: LanguageUsage) {
  if (usage.status === "checking") {
    return `Checking which projects still use "${name}" before you confirm.`
  }
  if (usage.status === "unknown") {
    return `We could not check which projects use "${name}". Deactivating stops it appearing for new projects, and you can reactivate it later.`
  }
  const count = usage.projects.length
  if (count === 0) {
    return `Soft delete — "${name}" stops appearing for new projects and stays in history. You can reactivate it later.`
  }
  return `Soft delete — "${name}" stops appearing for new projects. The ${count} project${count === 1 ? "" : "s"} below ${count === 1 ? "keeps" : "keep"} using it, and you can reactivate it later.`
}

export function DeactivateLanguageDialog({
  language,
  usage,
  deleting,
  onCancel,
  onConfirm,
}: DeactivateLanguageDialogProps) {
  const name = language?.name ?? ""
  const projectsInUse = usage.status === "known" ? usage.projects : []

  return (
    <Dialog
      open={language !== null}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate {name}</DialogTitle>
          <DialogDescription>{usageDescription(name, usage)}</DialogDescription>
        </DialogHeader>
        {usage.status === "checking" && (
          <div className={cn(states.warning, "flex items-center gap-2.5")}>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
            Checking usage…
          </div>
        )}
        {usage.status === "unknown" && (
          <div className={states.error}>
            {`Usage unknown — the check failed, so this dialog cannot tell you which projects use "${name}". Projects already on it keep it, and the API refuses to deactivate a language that is still in use.`}
          </div>
        )}
        {projectsInUse.length > 0 && (
          <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto rounded-[0.75rem] bg-accent-soft px-4 py-3.5">
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.04em] text-on-accent-soft">
              In use — {projectsInUse.length} project{projectsInUse.length === 1 ? "" : "s"}
            </span>
            {projectsInUse.map((project) => (
              <span key={project.id} className="text-[0.8125rem] text-fg-strong">
                · {project.name}
              </span>
            ))}
          </div>
        )}
        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting || usage.status === "checking"}
          >
            {deleting
              ? "Deactivating..."
              : usage.status === "unknown"
                ? "Deactivate anyway"
                : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
