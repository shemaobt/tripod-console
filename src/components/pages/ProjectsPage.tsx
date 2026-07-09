import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderOpen, Plus, Pencil, MapPin, Inbox, ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { ChangeRequestsSection } from "@/components/pages/ChangeRequestsSection"
import { MyChangeRequestsSection } from "@/components/pages/changeRequests/MyChangeRequestsSection"
import { ProjectFormDialog } from "@/components/pages/projects/ProjectFormDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"

import { formatDate } from "@/utils/format"

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { isPlatformAdmin, isManager } = useAuth()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null)

  const { fetch: fetchLanguages, getLanguageName } = useLanguagesStore()

  const showManagerRequests = isManager && !isPlatformAdmin

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

  useEffect(() => {
    fetchProjects()
    fetchLanguages()
  }, [fetchLanguages])

  function openCreateDialog() {
    setEditingProject(null)
    setDialogOpen(true)
  }

  function openEditDialog(e: React.MouseEvent, project: ProjectResponse) {
    e.stopPropagation()
    setEditingProject(project)
    setDialogOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const projectsView = projects.length === 0 ? (
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
            <p className="text-xs text-verde/60 line-clamp-2 mb-3">{project.description}</p>
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
  )

  const hasTabs = isPlatformAdmin || showManagerRequests

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
          {isPlatformAdmin ? "New Project" : "Request Project"}
        </Button>
      </div>

      {hasTabs ? (
        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">
              <FolderOpen className="h-4 w-4 mr-1.5" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="requests">
              {isPlatformAdmin ? (
                <Inbox className="h-4 w-4 mr-1.5" />
              ) : (
                <ClipboardList className="h-4 w-4 mr-1.5" />
              )}
              {isPlatformAdmin ? "Requests" : "My Requests"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">{projectsView}</TabsContent>

          <TabsContent value="requests">
            {isPlatformAdmin ? (
              <ChangeRequestsSection
                kinds={["create_project"]}
                emptyLabel="Managers' requests to create a project appear here. Accept to create it (optionally granting the requester manager access) or reject."
                onReviewed={fetchProjects}
              />
            ) : (
              <MyChangeRequestsSection
                kinds={["create_project"]}
                emptyLabel="When you request a new project, it appears here with its status. Once a platform admin reviews it, their notes show up too."
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        projectsView
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingProject={editingProject}
        isPlatformAdmin={isPlatformAdmin}
        onSaved={fetchProjects}
      />
    </div>
  )
}
