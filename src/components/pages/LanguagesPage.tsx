import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Languages } from "lucide-react"
import { toast } from "sonner"
import { languagesAPI, changeRequestsAPI, projectsAPI } from "@/services/api"
import type { LanguageProjectRef, LanguageResponse, ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { useRequestCountsStore } from "@/stores/requestCountsStore"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { LanguagesHeader } from "./languages/LanguagesHeader"
import { LanguagesTabs } from "./languages/LanguagesTabs"
import { LanguagesTable } from "./languages/LanguagesTable"
import { LanguageFormDialog, type LanguageFormState } from "./languages/LanguageFormDialog"
import { DeactivateLanguageDialog, type LanguageUsage } from "./languages/DeactivateLanguageDialog"

const emptyForm: LanguageFormState = { name: "", code: "", description: "" }

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
  const [form, setForm] = useState<LanguageFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<LanguageResponse | null>(null)
  const [deleteUsage, setDeleteUsage] = useState<LanguageUsage>({ status: "checking" })
  const [deleting, setDeleting] = useState(false)
  const [allLanguages, setAllLanguages] = useState<LanguageResponse[]>([])
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectResponse[] | null>(null)
  const usageRequestRef = useRef<string | null>(null)

  useEffect(() => {
    fetchLanguages()
    projectsAPI
      .list()
      .then(({ data }) => setProjects(data))
      .catch(() => {
        setProjects(null)
        toast.error("Failed to load projects")
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const projectsByLanguage = useMemo(() => {
    const byLanguage = new Map<string, LanguageProjectRef[]>()
    for (const project of projects ?? []) {
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
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(lang: LanguageResponse) {
    setEditingLang(lang)
    setForm({ name: lang.name, code: lang.code, description: "" })
    setDialogOpen(true)
  }

  async function handleSave() {
    const name = form.name.trim()
    const code = form.code.trim().toLowerCase()
    if (!name || code.length !== 3) return
    setSaving(true)
    try {
      if (editingLang) {
        if (isPlatformAdmin) {
          await languagesAPI.update(editingLang.id, { name, code })
          toast.success("Language updated")
          await refreshLanguages()
        } else {
          await changeRequestsAPI.create({
            kind: "edit_language",
            language_id: editingLang.id,
            name,
            code,
          })
          toast.success("Edit request submitted for a platform admin to review")
        }
      } else if (isPlatformAdmin) {
        await languagesAPI.create({ name, code })
        toast.success("Language created")
        await refreshLanguages()
      } else {
        await changeRequestsAPI.create({
          kind: "create_language",
          name,
          code,
          description: form.description.trim() || undefined,
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
    setDeleteUsage({ status: "checking" })
    usageRequestRef.current = lang.id
    try {
      const { data } = await languagesAPI.stats(lang.id)
      if (usageRequestRef.current !== lang.id) return
      setDeleteUsage({ status: "known", projects: data.projects })
    } catch {
      if (usageRequestRef.current !== lang.id) return
      setDeleteUsage(
        projects === null
          ? { status: "unknown" }
          : { status: "known", projects: projectsByLanguage.get(lang.id) ?? [] },
      )
    }
  }

  function closeDeleteDialog() {
    usageRequestRef.current = null
    setDeleteTarget(null)
  }

  async function handleDeactivate() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await languagesAPI.delete(deleteTarget.id)
      toast.success("Language deactivated")
      closeDeleteDialog()
      await refreshLanguages()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        toast.error("Only platform admins can deactivate languages")
      } else if (status === 409) {
        toast.error("The API refused to deactivate a language that is in use")
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
      <LanguagesTable
        languages={displayLanguages}
        projectsByLanguage={projectsByLanguage}
        currentUserId={user?.id}
        canEdit={isPlatformAdmin || canRequestEdit}
        canDeactivate={canDeactivate}
        reactivatingId={reactivatingId}
        onEdit={openEditDialog}
        onDeactivate={openDeleteDialog}
        onReactivate={handleReactivate}
      />
    )

  return (
    <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <LanguagesHeader
        languageCount={languages.length}
        isPlatformAdmin={isPlatformAdmin}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
        onCreate={openCreateDialog}
      />

      {isPlatformAdmin || canRequestEdit ? (
        <LanguagesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isPlatformAdmin={isPlatformAdmin}
          onReviewed={handleReviewed}
        >
          {languagesView}
        </LanguagesTabs>
      ) : (
        languagesView
      )}

      <LanguageFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingLang}
        isPlatformAdmin={isPlatformAdmin}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
      />

      <DeactivateLanguageDialog
        language={deleteTarget}
        usage={deleteUsage}
        deleting={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={handleDeactivate}
      />
    </div>
  )
}
