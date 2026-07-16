import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderOpen, Pencil, MapPin, Search } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { ChangeRequestsSection } from "@/components/pages/ChangeRequestsSection"
import { MyChangeRequestsSection } from "@/components/pages/changeRequests/MyChangeRequestsSection"
import { ProjectFormDialog } from "@/components/pages/projects/ProjectFormDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { cn } from "@/utils/cn"
import { timeAgo } from "@/utils/format"

const TILE_STYLES = [
  "bg-azul/20 text-azul",
  "bg-verde-claro/20 text-verde-claro",
  "bg-accent-soft text-on-accent-soft",
]

const MEMBER_STYLES = ["bg-azul", "bg-verde-claro", "bg-quiet"]

function hashIndex(seed: string, len: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % len
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

interface ProjectCardProps {
  project: ProjectResponse
  langName?: string
  langCode?: string
  onOpen: () => void
  onEdit: (e: React.MouseEvent) => void
}

function ProjectCard({ project, langName, langCode, onOpen, onEdit }: ProjectCardProps) {
  const tile = TILE_STYLES[hashIndex(project.id, TILE_STYLES.length)]
  const locationText =
    project.location_display_name ||
    (project.latitude != null && project.longitude != null
      ? `${project.latitude.toFixed(2)}, ${project.longitude.toFixed(2)}`
      : null)
  const metaLine = [locationText, langName].filter(Boolean).join(" · ")
  const memberCount = project.team_size
  const dots = Math.min(memberCount, 3)

  return (
    <article
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col gap-2.5 rounded-[18px] bg-elevated p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${project.name}`}
        className="absolute right-2.5 top-2.5 grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-elevated text-fg-subtle opacity-0 shadow-[var(--shadow-sm)] transition-all hover:bg-muted hover:text-fg-strong group-hover:opacity-100"
      >
        <Pencil className="h-[15px] w-[15px]" strokeWidth={1.75} />
      </button>

      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-10 w-10 flex-none place-items-center rounded-[12px] text-xs font-bold",
              tile
            )}
          >
            {initialsOf(project.name)}
          </span>
          <span className="text-[15px] font-semibold leading-snug text-fg-strong">
            {project.name}
          </span>
        </div>
        {langCode && (
          <span className="flex-none rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] text-fg-muted">
            {langCode}
          </span>
        )}
      </div>

      {metaLine && (
        <span className="inline-flex items-center gap-1.5 text-xs text-fg-subtle">
          <MapPin className="h-[13px] w-[13px] flex-none" strokeWidth={1.75} />
          {metaLine}
        </span>
      )}

      <p className="line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
        {project.description || "No description yet."}
      </p>

      <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {dots > 0 && (
            <div className="flex">
              {Array.from({ length: dots }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "-ml-2 h-[26px] w-[26px] rounded-full border-2 border-elevated first:ml-0",
                    MEMBER_STYLES[i % MEMBER_STYLES.length]
                  )}
                />
              ))}
            </div>
          )}
          <span className="text-[11.5px] text-fg-subtle">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-[11px] text-fg-subtle">Updated {timeAgo(project.updated_at)}</span>
      </div>
    </article>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { isPlatformAdmin, isManager } = useAuth()
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null)

  const { fetch: fetchLanguages, languages } = useLanguagesStore()

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
              langCode={lang?.code?.toUpperCase()}
              onOpen={() => navigate(`/app/projects/${project.id}`)}
              onEdit={(e) => openEditDialog(e, project)}
            />
          )
        })}
      </div>
    )

  const hasTabs = isPlatformAdmin || showManagerRequests

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
            <TabsTrigger value="requests">{isPlatformAdmin ? "Requests" : "My Requests"}</TabsTrigger>
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
