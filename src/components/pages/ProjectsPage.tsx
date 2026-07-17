import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderOpen, Search } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { useRequestCountsStore } from "@/stores/requestCountsStore"
import { ChangeRequestsSection } from "@/components/pages/ChangeRequestsSection"
import { MyChangeRequestsSection } from "@/components/pages/changeRequests/MyChangeRequestsSection"
import { ProjectFormDialog } from "@/components/pages/projects/ProjectFormDialog"
import { ProjectCard } from "@/components/pages/projects/ProjectCard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { isPlatformAdmin, isManager } = useAuth()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null)

  const { fetch: fetchLanguages, languages } = useLanguagesStore()
  const {
    counts,
    fetch: fetchRequestCounts,
    refresh: refreshRequestCounts,
  } = useRequestCountsStore()

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

  useEffect(() => {
    if (isPlatformAdmin) fetchRequestCounts()
  }, [isPlatformAdmin, fetchRequestCounts])

  function openCreateDialog() {
    setEditingProject(null)
    setDialogOpen(true)
  }

  function openEditDialog(e: React.MouseEvent, project: ProjectResponse) {
    e.stopPropagation()
    setEditingProject(project)
    setDialogOpen(true)
  }

  function handleReviewed() {
    fetchProjects()
    refreshRequestCounts()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const langOf = (id: string) => languages.find((l) => l.id === id)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? projects.filter((p) => {
        const lang = langOf(p.language_id)
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.location_display_name ?? "").toLowerCase().includes(q) ||
          (lang ? `${lang.name} ${lang.code}`.toLowerCase().includes(q) : false)
        )
      })
    : projects

  const projectsView =
    projects.length === 0 ? (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Projects are translation or documentation efforts tied to a language and location. Create one to get started."
        actionLabel="Create Project"
        onAction={openCreateDialog}
      />
    ) : filtered.length === 0 ? (
      <div className="rounded-[18px] bg-elevated px-6 py-16 text-center text-sm text-fg-subtle shadow-[var(--shadow-card)]">
        No projects match “{query}”.
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => {
          const lang = langOf(project.language_id)
          return (
            <ProjectCard
              key={project.id}
              project={project}
              langName={lang?.name}
              langCode={lang?.code}
              onOpen={() => navigate(`/app/projects/${project.id}`)}
              onEdit={(e) => openEditDialog(e, project)}
            />
          )
        })}
      </div>
    )

  const hasTabs = isPlatformAdmin || showManagerRequests
  const requestBadgeCount = isPlatformAdmin ? counts.projectChanges : 0

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-14 pt-8 sm:px-10">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Content
          </span>
          <h3 className="text-[25px] font-bold tracking-tight text-fg-strong">Projects</h3>
          <span className="text-[12.5px] text-fg-subtle">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-muted px-4 py-2.5 sm:w-[240px] sm:flex-none">
            <Search className="h-[15px] w-[15px] flex-none text-fg-subtle" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full bg-transparent text-[13.5px] text-fg-strong outline-none placeholder:text-fg-subtle"
            />
          </div>
          <Button onClick={openCreateDialog}>
            {isPlatformAdmin ? "New project" : "Request project"}
          </Button>
        </div>
      </div>

      {hasTabs ? (
        <Tabs defaultValue="projects">
          <TabsList className="mb-[18px]">
            <TabsTrigger value="projects">All projects</TabsTrigger>
            <TabsTrigger value="requests">
              {isPlatformAdmin ? "Requests" : "My Requests"}
              {requestBadgeCount > 0 && (
                <span className="rounded-full bg-telha px-1.5 py-px text-[10px] font-bold text-on-dark">
                  {requestBadgeCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">{projectsView}</TabsContent>

          <TabsContent value="requests">
            {isPlatformAdmin ? (
              <ChangeRequestsSection
                kinds={["create_project"]}
                emptyLabel="Managers' requests to create a project appear here. Accept to create it (optionally granting the requester manager access) or reject."
                onReviewed={handleReviewed}
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
