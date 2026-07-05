import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderOpen, Plus, Pencil, MapPin } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI, languagesAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"

import { formatDate } from "@/utils/format"

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { isManager, managedOrgId } = useAuth()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProject, setEditingProject] =
    useState<ProjectResponse | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [languageId, setLanguageId] = useState("")

  const [langDialogOpen, setLangDialogOpen] = useState(false)
  const [newLangName, setNewLangName] = useState("")
  const [newLangCode, setNewLangCode] = useState("")
  const [creatingLang, setCreatingLang] = useState(false)

  const { languages, loading: languagesLoading, fetch: fetchLanguages, invalidate: invalidateLanguages, getLanguageName } = useLanguagesStore()

  async function fetchProjects() {
    try {
      const params = isManager && managedOrgId
        ? { organization_id: managedOrgId }
        : undefined
      const { data } = await projectsAPI.list(params)
      setProjects(data)
    } catch {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  function openCreateDialog() {
    setEditingProject(null)
    setName("")
    setDescription("")
    setLanguageId("")
    setDialogOpen(true)
    if (languages.length === 0) fetchLanguages()
  }

  function openEditDialog(e: React.MouseEvent, project: ProjectResponse) {
    e.stopPropagation()
    setEditingProject(project)
    setName(project.name)
    setDescription(project.description ?? "")
    setLanguageId(project.language_id)
    setDialogOpen(true)
    if (languages.length === 0) fetchLanguages()
  }

  async function handleSave() {
    if (!name.trim() || !languageId) return
    setSaving(true)
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, {
          name: name.trim(),
          description: description.trim() || null,
          language_id: languageId,
        })
        toast.success("Project updated")
      } else {
        await projectsAPI.create({
          name: name.trim(),
          description: description.trim() || undefined,
          language_id: languageId,
        })
        toast.success("Project created")
      }
      setDialogOpen(false)
      await fetchProjects()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("A project with this name already exists")
      } else {
        toast.error(
          editingProject
            ? "Failed to update project"
            : "Failed to create project",
        )
      }
    } finally {
      setSaving(false)
    }
  }

  function openLanguageDialog() {
    setNewLangName("")
    setNewLangCode("")
    setLangDialogOpen(true)
  }

  async function handleCreateLanguage() {
    if (!newLangName.trim() || !newLangCode.trim()) return
    setCreatingLang(true)
    try {
      const { data } = await languagesAPI.create({
        name: newLangName.trim(),
        code: newLangCode.trim(),
      })
      invalidateLanguages()
      await fetchLanguages()
      setLanguageId(data.id)
      setLangDialogOpen(false)
      toast.success("Language created")
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("A language with this code already exists")
      } else {
        toast.error("Failed to create language")
      }
    } finally {
      setCreatingLang(false)
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
            Projects
            <InfoTooltip content="Projects represent translation or language documentation efforts for a specific language." />
          </h1>
          <p className="text-sm text-verde/60 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Projects are translation or documentation efforts tied to a language and location. Create one to get started."
          actionLabel="Create Project"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl border border-areia/20 bg-surface p-5 shadow-sm hover:shadow-md hover:border-telha/30 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/app/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-azul/15 to-azul/5 shrink-0">
                    <FolderOpen className="h-4 w-4 text-azul" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-preto truncate">{project.name}</p>
                    <Badge variant="default" className="mt-1 text-[10px]">
                      {getLanguageName(project.language_id)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-2"
                  onClick={(e) => openEditDialog(e, project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {project.description && (
                <p className="text-xs text-verde/60 line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-verde/50">
                {project.latitude != null && project.longitude != null && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {project.location_display_name || `${project.latitude}, ${project.longitude}`}
                  </span>
                )}
                <span className="tabular-nums ml-auto">{formatDate(project.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Create Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update this project's details."
                : "Projects represent translation or documentation efforts tied to a language."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Arara Language Documentation"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of this project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Language</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={openLanguageDialog}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New language
                </Button>
              </div>
              {languagesLoading ? (
                <p className="text-sm text-verde">Loading languages...</p>
              ) : (
                <Select value={languageId} onValueChange={setLanguageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name} ({lang.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
              disabled={saving || !name.trim() || !languageId}
            >
              {saving
                ? editingProject
                  ? "Saving..."
                  : "Creating..."
                : editingProject
                  ? "Save"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={langDialogOpen} onOpenChange={setLangDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Language</DialogTitle>
            <DialogDescription>
              Add a new language without leaving the project form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-lang-name">Name</Label>
              <Input
                id="new-lang-name"
                placeholder="e.g. Portuguese"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-lang-code">Code</Label>
              <Input
                id="new-lang-code"
                placeholder="e.g. pt"
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setLangDialogOpen(false)}
              disabled={creatingLang}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLanguage}
              disabled={creatingLang || !newLangName.trim() || !newLangCode.trim()}
            >
              {creatingLang ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
