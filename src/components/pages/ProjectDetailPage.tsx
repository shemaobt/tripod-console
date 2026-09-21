import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { languagesAPI, projectsAPI, uploadsAPI } from "@/services/api"
import type { ProjectResponse, LanguageResponse } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguagesStore } from "@/stores/languagesStore"
import { avatarColors, initialsOf } from "@/utils/avatar"
import { cn } from "@/utils/cn"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ProjectInfoForm } from "./projects/ProjectInfoForm"
import { LocationSection } from "./projects/LocationSection"
import { ProjectAccessTab } from "./ProjectAccessTab"
import { ProjectPhasesTab } from "./ProjectPhasesTab"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { isPlatformAdmin, managedProjectIds } = useAuth()

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fallbackLanguage, setFallbackLanguage] = useState<LanguageResponse | null>(null)
  const [failedLanguageId, setFailedLanguageId] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    languages,
    loading: languagesLoading,
    fetch: fetchLanguages,
  } = useLanguagesStore()

  async function fetchProject() {
    if (!projectId) return
    try {
      const { data } = await projectsAPI.get(projectId)
      setProject(data)
    } catch {
      toast.error("Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
    fetchLanguages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const languageId = project?.language_id
  const storeLanguage = languages.find((l) => l.id === languageId)
  const language =
    storeLanguage ?? (fallbackLanguage?.id === languageId ? fallbackLanguage : null)
  const languageLookupFailed = failedLanguageId === languageId

  useEffect(() => {
    if (!languageId || languagesLoading || storeLanguage) return
    if (fallbackLanguage?.id === languageId || failedLanguageId === languageId) return
    let cancelled = false
    languagesAPI
      .get(languageId)
      .then(({ data }) => {
        if (!cancelled) setFallbackLanguage(data)
      })
      .catch(() => {
        if (!cancelled) setFailedLanguageId(languageId)
      })
    return () => {
      cancelled = true
    }
  }, [languageId, languagesLoading, storeLanguage, fallbackLanguage, failedLanguageId])

  async function handleLocationSave(
    lat: number | null,
    lng: number | null,
    displayName: string | null,
  ) {
    if (!projectId) return
    try {
      const { data } = await projectsAPI.updateLocation(projectId, {
        latitude: lat,
        longitude: lng,
        location_display_name: displayName,
      })
      setProject(data)
      toast.success("Location updated")
    } catch {
      toast.error("Failed to update location")
    }
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !projectId) return
    try {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, WebP, or SVG image")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5 MB")
        return
      }
      setImageBusy(true)
      const { data } = await uploadsAPI.image(file, "project-images")
      const { data: updated } = await projectsAPI.update(projectId, {
        image_url: data.url,
      })
      setProject(updated)
      toast.success("Project image updated")
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setImageBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleRemoveImage() {
    if (!projectId) return
    setImageBusy(true)
    try {
      const { data } = await projectsAPI.update(projectId, { image_url: null })
      setProject(data)
      toast.success("Project image removed")
    } catch {
      toast.error("Failed to remove image")
    } finally {
      setImageBusy(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!project) {
    return (
      <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
        <p className="text-fg-muted">Project not found.</p>
      </div>
    )
  }

  const canEdit =
    isPlatformAdmin || (projectId ? managedProjectIds.includes(projectId) : false)
  const tileColors = avatarColors(project.id, project.name)
  const tileClass = cn(
    "grid h-[3.375rem] w-[3.375rem] flex-none place-items-center overflow-hidden rounded-[0.875rem] text-[0.9375rem] font-bold",
    canEdit &&
      "cursor-pointer transition-shadow hover:shadow-[0_0_0_0.1875rem_var(--color-accent-soft)]",
  )
  const tileStyle = project.image_url
    ? undefined
    : { backgroundColor: tileColors.bg, color: tileColors.fg }
  const tileContent = project.image_url ? (
    <img src={project.image_url} alt="" className="h-full w-full object-cover" />
  ) : (
    initialsOf(project.name)
  )
  const languageName =
    language?.name ?? (languageLookupFailed ? "Unknown language" : "")

  return (
    <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <button
        onClick={() => navigate("/app/projects")}
        className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-fg-muted hover:text-fg-strong transition-colors mb-4"
      >
        <ArrowLeft className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
        Projects
      </button>

      <Tabs defaultValue="info">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-[1.125rem]">
          <div className="flex items-center gap-4 min-w-0">
            {canEdit ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageBusy}
                  title={project.image_url ? "Change project image" : "Upload project image"}
                  className={tileClass}
                  style={tileStyle}
                >
                  {tileContent}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleImageFile}
                />
              </>
            ) : (
              <div className={tileClass} style={tileStyle}>
                {tileContent}
              </div>
            )}
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="flex items-center text-[1.5625rem] font-bold text-fg-strong tracking-tight">
                {project.name}
                <InfoTooltip content="View and manage this project's details, location, and access permissions." />
              </h3>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className="font-mono text-[0.71875rem] bg-muted rounded-md px-2 py-0.5 text-fg-muted">
                  {language?.code || "—"}
                </span>
                <span className="text-[0.8125rem] text-fg-muted">{languageName}</span>
                <span className="text-[0.8125rem] text-fg-subtle">·</span>
                <span className="text-[0.8125rem] text-fg-muted">
                  {project.location_display_name || "No location"}
                </span>
                <span className="text-[0.8125rem] text-fg-subtle">·</span>
                <span className="text-[0.8125rem] text-fg-muted">
                  {project.team_size} team member{project.team_size === 1 ? "" : "s"}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageBusy}
                    className="text-[0.8125rem] font-semibold text-accent hover:text-accent-hover hover:underline disabled:opacity-50"
                  >
                    {project.image_url ? "Change image" : "Upload image"}
                  </button>
                )}
                {canEdit && project.image_url && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={imageBusy}
                    className="text-[0.8125rem] font-semibold text-fg-subtle hover:text-st-warn hover:underline disabled:opacity-50"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          <TabsList className="self-start sm:self-auto">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.125rem] items-start">
            <ProjectInfoForm
              project={project}
              languages={languages}
              languagesLoading={languagesLoading}
              onSaved={setProject}
            />
            <LocationSection
              key={`${project.latitude},${project.longitude},${project.location_display_name}`}
              project={project}
              onSave={handleLocationSave}
            />
          </div>
        </TabsContent>

        <TabsContent value="phases">
          <ProjectPhasesTab projectId={projectId!} />
        </TabsContent>

        <TabsContent value="access">
          <ProjectAccessTab projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
