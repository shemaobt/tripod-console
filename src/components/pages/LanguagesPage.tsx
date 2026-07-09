import { useEffect, useState } from "react"
import { Languages, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { languagesAPI, changeRequestsAPI } from "@/services/api"
import type { LanguageResponse, LanguageStatsResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ChangeRequestsSection } from "@/components/pages/ChangeRequestsSection"

import { formatDate } from "@/utils/format"

export default function LanguagesPage() {
  const { user, isPlatformAdmin, isManager } = useAuth()
  const canRequestEdit = isManager && !isPlatformAdmin
  const { languages, loading: storeLoading, lastFetched, fetch: fetchLanguages } = useLanguagesStore()
  const loading = storeLoading || (!lastFetched && languages.length === 0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingLang, setEditingLang] = useState<LanguageResponse | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<LanguageResponse | null>(null)
  const [deleteStats, setDeleteStats] = useState<LanguageStatsResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchLanguages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function canDeactivate(lang: LanguageResponse) {
    return isPlatformAdmin || (isManager && lang.created_by === user?.id)
  }

  function openCreateDialog() {
    setEditingLang(null)
    setName("")
    setCode("")
    setDialogOpen(true)
  }

  function openEditDialog(lang: LanguageResponse) {
    setEditingLang(lang)
    setName(lang.name)
    setCode(lang.code)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim() || code.trim().length !== 3) return
    setSaving(true)
    try {
      if (editingLang) {
        if (isPlatformAdmin) {
          await languagesAPI.update(editingLang.id, {
            name: name.trim(),
            code: code.trim().toLowerCase(),
          })
          toast.success("Language updated")
          useLanguagesStore.getState().invalidate()
          await fetchLanguages()
        } else {
          await changeRequestsAPI.create({
            kind: "edit_language",
            language_id: editingLang.id,
            name: name.trim(),
            code: code.trim().toLowerCase(),
          })
          toast.success("Edit request submitted for a platform admin to review")
        }
      } else if (isPlatformAdmin) {
        await languagesAPI.create({ name: name.trim(), code: code.trim().toLowerCase() })
        toast.success("Language created")
        useLanguagesStore.getState().invalidate()
        await fetchLanguages()
      } else {
        await changeRequestsAPI.create({
          kind: "create_language",
          name: name.trim(),
          code: code.trim().toLowerCase(),
        })
        toast.success("Request submitted for a platform admin to review")
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("A language with this code already exists")
      } else if (status === 403) {
        toast.error("You can only request edits for languages used by your projects")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function openDeleteDialog(lang: LanguageResponse) {
    setDeleteTarget(lang)
    setDeleteStats(null)
    try {
      const { data } = await languagesAPI.stats(lang.id)
      setDeleteStats(data)
    } catch {
      setDeleteStats(null)
    }
  }

  const blockedByProjects = (deleteStats?.project_count ?? 0) > 0

  async function handleDeactivate() {
    if (!deleteTarget || deleteStats === null || blockedByProjects) return
    setDeleting(true)
    try {
      await languagesAPI.delete(deleteTarget.id)
      toast.success("Language deactivated")
      setDeleteTarget(null)
      useLanguagesStore.getState().invalidate()
      await fetchLanguages()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("This language is used by projects and cannot be deactivated")
      } else if (status === 403) {
        toast.error("You can only deactivate languages you created")
      } else {
        toast.error("Failed to deactivate language")
      }
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
            Languages
            <InfoTooltip content="Manage the translation target languages for your projects." />
          </h1>
          <p className="text-sm text-verde/60 mt-1">
            {languages.length} language{languages.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl">
          <Plus className="h-4 w-4" />
          New Language
        </Button>
      </div>

      {isPlatformAdmin && (
        <ChangeRequestsSection
          kinds={["create_language", "edit_language"]}
          title="Language requests"
          description="Managers' requests to create or edit a language. Accept to apply the change or reject."
        />
      )}

      {languages.length === 0 ? (
        <EmptyState
          icon={Languages}
          title="No languages yet"
          description="Languages define the translation targets for your projects. Create one to get started."
          actionLabel="Create Language"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="group relative rounded-2xl border border-areia/20 bg-surface p-5 shadow-sm hover:shadow-md hover:border-telha/30 transition-all duration-200 cursor-default"
            >
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {(isPlatformAdmin || canRequestEdit) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEditDialog(lang)}
                    aria-label={`Edit ${lang.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDeactivate(lang) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => openDeleteDialog(lang)}
                    aria-label={`Deactivate ${lang.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-azul/15 to-azul/5 flex items-center justify-center mx-auto">
                <span className="text-2xl font-mono font-bold text-azul">
                  {lang.code}
                </span>
              </div>
              <p className="text-sm font-medium text-preto text-center mt-3">
                {lang.name}
              </p>
              <p className="text-xs text-verde/50 text-center mt-1">
                {formatDate(lang.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLang
                ? isPlatformAdmin
                  ? "Edit Language"
                  : "Request Language Edit"
                : isPlatformAdmin
                  ? "Create Language"
                  : "Request New Language"}
            </DialogTitle>
            <DialogDescription>
              {isPlatformAdmin
                ? editingLang
                  ? "Update the language name or code."
                  : "Add a new target language for your translation projects."
                : "Your request will be sent to a platform admin to review before it is applied."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="lang-name">Name</Label>
              <Input
                id="lang-name"
                placeholder="e.g. English"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lang-code">
                <span className="inline-flex items-center">
                  Code
                  <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
                </span>
              </Label>
              <Input
                id="lang-code"
                placeholder="e.g. eng"
                maxLength={3}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="text-xs text-verde/50 mt-1.5">
                Must be exactly 3 characters (ISO 639-3)
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim() || code.trim().length !== 3}
            >
              {saving
                ? !isPlatformAdmin
                  ? "Submitting..."
                  : editingLang
                    ? "Saving..."
                    : "Creating..."
                : !isPlatformAdmin
                  ? "Submit Request"
                  : editingLang
                    ? "Save Changes"
                    : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Language</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? deleteStats === null
                  ? `Checking which projects use "${deleteTarget.name}"...`
                  : blockedByProjects
                    ? `"${deleteTarget.name}" is used by ${deleteStats.project_count} project${deleteStats.project_count !== 1 ? "s" : ""} and cannot be deactivated. Reassign or remove it from these projects first.`
                    : `Deactivating "${deleteTarget.name}" hides it from new project creation. Existing projects are unaffected and it can be restored later.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {blockedByProjects && deleteStats && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-areia/30 bg-surface-alt/50 divide-y divide-areia/20">
              {deleteStats.projects.map((project) => (
                <li key={project.id} className="px-3 py-2 text-sm text-preto">
                  {project.name}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {blockedByProjects ? "Close" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deleteStats === null || blockedByProjects || deleting}
            >
              {deleting ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
