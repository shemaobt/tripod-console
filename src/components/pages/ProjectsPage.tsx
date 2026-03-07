import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderOpen, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI, languagesAPI } from "@/services/api"
import type { ProjectResponse, LanguageResponse } from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function truncate(text: string | null, maxLen: number): string {
  if (!text) return "—"
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProject, setEditingProject] =
    useState<ProjectResponse | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [languageId, setLanguageId] = useState("")

  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(false)

  async function fetchProjects() {
    try {
      const { data } = await projectsAPI.list()
      setProjects(data)
    } catch {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  async function fetchLanguages() {
    setLanguagesLoading(true)
    try {
      const { data } = await languagesAPI.list()
      setLanguages(data)
    } catch {
      toast.error("Failed to load languages")
    } finally {
      setLanguagesLoading(false)
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

  // Build a language lookup map for display once languages are loaded
  const languageMap = new Map(languages.map((l) => [l.id, l]))

  function renderLanguageCell(langId: string) {
    const lang = languageMap.get(langId)
    if (lang) return `${lang.name} (${lang.code})`
    return langId
  }

  // Fetch languages on mount for table display
  useEffect(() => {
    fetchLanguages()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Projects
          <InfoTooltip content="Projects represent translation or language documentation efforts for a specific language." />
        </h1>
        <Button onClick={openCreateDialog}>
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
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-verde text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50 cursor-pointer"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-preto font-medium">
                    {project.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {truncate(project.description, 60)}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto">
                    {renderLanguageCell(project.language_id)}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openEditDialog(e, project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Create Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Arara Language Documentation"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of this project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
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
          <DialogFooter>
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
    </div>
  )
}
