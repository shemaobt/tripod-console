import { useCallback, useEffect, useMemo, useState } from "react"
import { Languages, Plus, Pencil, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { languagesAPI, changeRequestsAPI, projectsAPI } from "@/services/api"
import type {
  LanguageProjectRef,
  LanguageResponse,
  LanguageStatsResponse,
  ProjectResponse,
} from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { useRequestCountsStore } from "@/stores/requestCountsStore"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import { MyChangeRequestsSection } from "@/components/pages/changeRequests/MyChangeRequestsSection"

import { formatDate } from "@/utils/format"

export default function LanguagesPage() {
  const { user, isPlatformAdmin, isManager } = useAuth()
  const canRequestEdit = isManager && !isPlatformAdmin
  const { languages, loading: storeLoading, lastFetched, fetch: fetchLanguages } = useLanguagesStore()
  const loading = (storeLoading || !lastFetched) && languages.length === 0
  const [activeTab, setActiveTab] = useState("languages")
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingLang, setEditingLang] = useState<LanguageResponse | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<LanguageResponse | null>(null)
  const [deleteStats, setDeleteStats] = useState<LanguageStatsResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [allLanguages, setAllLanguages] = useState<LanguageResponse[]>([])
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectResponse[]>([])

  useEffect(() => {
    fetchLanguages()
    projectsAPI
      .list()
      .then(({ data }) => setProjects(data))
      .catch(() => setProjects([]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const projectsByLanguage = useMemo(() => {
    const byLanguage = new Map<string, LanguageProjectRef[]>()
    for (const project of projects) {
      const refs = byLanguage.get(project.language_id) ?? []
      refs.push({ id: project.id, name: project.name })
      byLanguage.set(project.language_id, refs)
    }
    return byLanguage
  }, [projects])

  const loadAllLanguages = useCallback(async () => {
    if (!isPlatformAdmin) return
    try {
      const { data } = await languagesAPI.list({ include_inactive: true })
      setAllLanguages(data)
    } catch {
      toast.error("Failed to load inactive languages")
    }
  }, [isPlatformAdmin])

  useEffect(() => {
    if (showInactive) loadAllLanguages()
  }, [showInactive, loadAllLanguages])

  function refreshLanguages() {
    useLanguagesStore.getState().invalidate()
    if (showInactive) loadAllLanguages()
    return fetchLanguages()
  }

  function handleReviewed() {
    refreshLanguages()
    useRequestCountsStore.getState().refresh()
  }

  const canDeactivate = isPlatformAdmin

  function openCreateDialog() {
    setEditingLang(null)
    setName("")
    setCode("")
    setDescription("")
    setDialogOpen(true)
  }

  function openEditDialog(lang: LanguageResponse) {
    setEditingLang(lang)
    setName(lang.name)
    setCode(lang.code)
    setDescription("")
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
          await refreshLanguages()
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
        await refreshLanguages()
      } else {
        await changeRequestsAPI.create({
          kind: "create_language",
          name: name.trim(),
          code: code.trim().toLowerCase(),
          description: description.trim() || undefined,
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

  const blockers = deleteTarget
    ? (deleteStats?.projects ?? projectsByLanguage.get(deleteTarget.id) ?? [])
    : []
  const usedByProjects = blockers.length > 0

  async function handleDeactivate() {
    if (!deleteTarget || deleting || usedByProjects) return
    setDeleting(true)
    try {
      await languagesAPI.delete(deleteTarget.id)
      toast.success("Language deactivated")
      setDeleteTarget(null)
      await refreshLanguages()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        toast.error("Only platform admins can deactivate languages")
      } else if (status === 409) {
        toast.error("This language is used by projects and cannot be deactivated")
      } else {
        toast.error("Failed to deactivate language")
      }
    } finally {
      setDeleting(false)
    }
  }

  async function handleReactivate(lang: LanguageResponse) {
    if (reactivatingId) return
    setReactivatingId(lang.id)
    try {
      await languagesAPI.reactivate(lang.id)
      toast.success("Language reactivated")
      await refreshLanguages()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        toast.error("Only platform admins can reactivate languages")
      } else {
        toast.error("Failed to reactivate language")
      }
    } finally {
      setReactivatingId(null)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const displayLanguages = showInactive ? allLanguages : languages.filter((lang) => lang.is_active)
  const thClass =
    "text-left px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-fg-subtle border-b border-line"
  const tdClass = "px-5 py-3 border-b border-line"
  const segClass = "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
  const segActive = "bg-elevated text-fg-strong shadow-[var(--shadow-sm)]"
  const iconBtn = "w-[30px] h-[30px] rounded-[9px] inline-grid place-items-center transition-colors"

  const languagesView =
    languages.length === 0 ? (
      <EmptyState
        icon={Languages}
        title="No languages yet"
        description="Languages define the translation targets for your projects. Create one to get started."
        actionLabel={isPlatformAdmin ? "Create Language" : "Request Language"}
        onAction={openCreateDialog}
      />
    ) : (
      <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={thClass}>Language</th>
              <th className={thClass}>Code</th>
              <th className={thClass}>Projects</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
              <th className={cn(thClass, "text-right")} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {displayLanguages.map((lang) => (
              <tr
                key={lang.id}
                className={cn(
                  "transition-colors",
                  lang.is_active ? "hover:bg-muted" : "bg-muted hover:bg-quiet",
                )}
              >
                <td className={cn(tdClass, "font-semibold text-fg-strong")}>{lang.name}</td>
                <td className={tdClass}>
                  <span className="font-mono text-xs bg-muted rounded-md px-2 py-0.5 text-fg-muted">
                    {lang.code}
                  </span>
                </td>
                <td className={cn(tdClass, "text-fg-muted")}>
                  {projectsByLanguage.get(lang.id)?.length ?? 0}
                </td>
                <td className={tdClass}>
                  <span className="inline-flex items-center gap-2 text-[13px] text-fg-muted">
                    <span className={cn("w-2 h-2 rounded-full", lang.is_active ? "bg-st-ok" : "bg-st-idle")} />
                    {lang.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={cn(tdClass, "text-fg-subtle text-[12.5px]")}>
                  {formatDate(lang.created_at)}
                  {lang.created_by === user?.id ? " · You" : ""}
                </td>
                <td className={cn(tdClass, "text-right whitespace-nowrap")}>
                  {(isPlatformAdmin || canRequestEdit) && (
                    <button
                      type="button"
                      onClick={() => openEditDialog(lang)}
                      title="Edit"
                      aria-label={`Edit ${lang.name}`}
                      className={cn(iconBtn, "text-fg-subtle hover:bg-muted hover:text-fg-strong")}
                    >
                      <Pencil className="w-[15px] h-[15px]" strokeWidth={1.75} />
                    </button>
                  )}
                  {canDeactivate && lang.is_active && (
                    <button
                      type="button"
                      onClick={() => openDeleteDialog(lang)}
                      title="Deactivate"
                      aria-label={`Deactivate ${lang.name}`}
                      className={cn(iconBtn, "text-fg-subtle hover:bg-accent-soft hover:text-on-accent-soft")}
                    >
                      <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.75} />
                    </button>
                  )}
                  {canDeactivate && !lang.is_active && (
                    <button
                      type="button"
                      onClick={() => handleReactivate(lang)}
                      disabled={reactivatingId !== null}
                      title="Reactivate"
                      aria-label={`Reactivate ${lang.name}`}
                      className={cn(
                        iconBtn,
                        "text-fg-subtle hover:bg-st-ok/15 hover:text-st-ok disabled:opacity-50",
                      )}
                    >
                      <RotateCcw className="w-[15px] h-[15px]" strokeWidth={1.75} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted">Content</span>
          <h3 className="text-[25px] font-bold text-fg-strong tracking-tight">Languages</h3>
          <span className="text-[12.5px] text-fg-subtle">
            {languages.length} language{languages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-[18px]">
          {isPlatformAdmin && (
            <div className="flex items-center gap-[9px]">
              <Switch checked={showInactive} onCheckedChange={setShowInactive} aria-label="Include inactive" />
              <span
                className="text-[13px] text-fg-muted cursor-pointer select-none"
                onClick={() => setShowInactive((v) => !v)}
              >
                Include inactive
              </span>
            </div>
          )}
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4" />
            {isPlatformAdmin ? "New language" : "Request language"}
          </Button>
        </div>
      </div>

      {isPlatformAdmin || canRequestEdit ? (
        <>
          <div className="inline-flex bg-muted rounded-full p-[3px] mb-[18px]">
            <button
              type="button"
              onClick={() => setActiveTab("languages")}
              className={cn(segClass, activeTab === "languages" ? segActive : "text-fg-muted")}
            >
              All languages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={cn(segClass, activeTab === "requests" ? segActive : "text-fg-muted")}
            >
              Change requests
            </button>
          </div>
          {activeTab === "languages" ? (
            languagesView
          ) : isPlatformAdmin ? (
            <ChangeRequestsSection
              kinds={["create_language", "edit_language"]}
              emptyLabel="Managers' requests to create or edit a language appear here. Accept to apply the change or reject."
              onReviewed={handleReviewed}
            />
          ) : (
            <MyChangeRequestsSection
              kinds={["create_language", "edit_language"]}
              emptyLabel="When you request a new language or an edit, it appears here with its status. Once a platform admin reviews it, their notes show up too."
            />
          )}
        </>
      ) : (
        languagesView
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
              <Input id="lang-name" placeholder="e.g. English" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lang-code">
                <span className="inline-flex items-center">
                  Code
                  <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
                </span>
              </Label>
              <Input id="lang-code" placeholder="e.g. eng" maxLength={3} value={code} onChange={(e) => setCode(e.target.value)} />
              <p className="text-xs text-fg-subtle mt-1.5">
                Must be exactly 3 characters (ISO 639-3)
              </p>
            </div>
            {!isPlatformAdmin && !editingLang && (
              <div className="space-y-1.5">
                <Label htmlFor="lang-description">
                  Description <span className="font-normal text-fg-subtle">(optional)</span>
                </Label>
                <Textarea
                  id="lang-description"
                  placeholder="Where it is spoken, communities, dialects…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-line pt-4 mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || code.trim().length !== 3}>
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
            <DialogTitle>Deactivate {deleteTarget?.name}</DialogTitle>
            <DialogDescription>
              {usedByProjects
                ? "Blocked — a language in use cannot be deactivated (409 lists the projects)."
                : `Soft delete — "${deleteTarget?.name}" stops appearing for new projects and stays in history. You can reactivate it later.`}
            </DialogDescription>
          </DialogHeader>
          {usedByProjects && (
            <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto rounded-[12px] bg-accent-soft px-4 py-3.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-on-accent-soft">
                In use — deactivation blocked
              </span>
              {blockers.map((project) => (
                <span key={project.id} className="text-[13px] text-fg-strong">
                  · {project.name}
                </span>
              ))}
            </div>
          )}
          <DialogFooter className="border-t border-line pt-4 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deleting || usedByProjects}
            >
              {deleting ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
