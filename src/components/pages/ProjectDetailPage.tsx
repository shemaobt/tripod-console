import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  FolderOpen,
  Pencil,
  MapPin,
  Save,
  Shield,
} from "lucide-react"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ProjectAccessTab } from "./ProjectAccessTab"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ProjectInfoCard({
  project,
  languageName,
  onEdit,
}: {
  project: ProjectResponse
  languageName: string
  onEdit: () => void
}) {
  return (
    <div className={`${card.base} p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-azul/20 flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-azul" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-preto">
              {project.name}
            </h2>
            {project.description && (
              <p className="text-sm text-verde mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-verde">Language</span>
          <p className="text-preto font-medium">{languageName}</p>
        </div>
        <div>
          <span className="text-verde">Created</span>
          <p className="text-preto font-medium">
            {formatDate(project.created_at)}
          </p>
        </div>
        <div>
          <span className="text-verde">Updated</span>
          <p className="text-preto font-medium">
            {formatDate(project.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

function LocationSection({
  project,
  onSave,
}: {
  project: ProjectResponse
  onSave: (
    lat: number | null,
    lng: number | null,
    displayName: string | null,
  ) => Promise<void>
}) {
  const [latitude, setLatitude] = useState(
    project.latitude != null ? String(project.latitude) : "",
  )
  const [longitude, setLongitude] = useState(
    project.longitude != null ? String(project.longitude) : "",
  )
  const [displayName, setDisplayName] = useState(
    project.location_display_name ?? "",
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const lat = latitude.trim() ? parseFloat(latitude) : null
    const lng = longitude.trim() ? parseFloat(longitude) : null

    if (latitude.trim() && isNaN(lat!)) {
      toast.error("Latitude must be a valid number")
      setSaving(false)
      return
    }
    if (longitude.trim() && isNaN(lng!)) {
      toast.error("Longitude must be a valid number")
      setSaving(false)
      return
    }

    try {
      await onSave(lat, lng, displayName.trim() || null)
    } finally {
      setSaving(false)
    }
  }

  const hasLocation = project.latitude != null && project.longitude != null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-azul" />
        Location
        <InfoTooltip content="Set the geographic coordinates for this project. Used on the global map view." />
      </h3>

      {hasLocation && (
        <div className={`${card.base} p-4`}>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-verde" />
            <span className="text-preto font-medium">
              {project.location_display_name || "No location name"}
            </span>
            <span className="text-verde">
              ({project.latitude}, {project.longitude})
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">
            <span className="inline-flex items-center">
              Latitude
              <InfoTooltip content="Decimal degrees, e.g. -3.1190" />
            </span>
          </Label>
          <Input
            id="latitude"
            placeholder="e.g. -3.1190"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">
            <span className="inline-flex items-center">
              Longitude
              <InfoTooltip content="Decimal degrees, e.g. -59.9750" />
            </span>
          </Label>
          <Input
            id="longitude"
            placeholder="e.g. -59.9750"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display-name">Location Name</Label>
          <Input
            id="display-name"
            placeholder="e.g. Manaus, Brazil"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Location"}
      </Button>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLanguageId, setEditLanguageId] = useState("")

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
    fetchProject()
    fetchLanguages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  function openEditDialog() {
    if (!project) return
    setEditName(project.name)
    setEditDescription(project.description ?? "")
    setEditLanguageId(project.language_id)
    setEditDialogOpen(true)
  }

  async function handleEditSave() {
    if (!projectId || !editName.trim() || !editLanguageId) return
    setSaving(true)
    try {
      const { data } = await projectsAPI.update(projectId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
        language_id: editLanguageId,
      })
      setProject(data)
      toast.success("Project updated")
      setEditDialogOpen(false)
    } catch {
      toast.error("Failed to update project")
    } finally {
      setSaving(false)
    }
  }

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

  const languageMap = new Map(languages.map((l) => [l.id, l]))

  function getLanguageName(langId: string): string {
    const lang = languageMap.get(langId)
    return lang ? `${lang.name} (${lang.code})` : langId
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-verde">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/projects")}
          className="inline-flex items-center gap-1 text-sm text-verde hover:text-preto transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          {project.name}
          <InfoTooltip content="View and manage this project's details, location, and access permissions." />
        </h1>
      </div>

      <ProjectInfoCard
        project={project}
        languageName={getLanguageName(project.language_id)}
        onEdit={openEditDialog}
      />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="h-4 w-4 mr-1" />
            Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-6">
          <LocationSection
            project={project}
            onSave={handleLocationSave}
          />
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <ProjectAccessTab projectId={projectId!} />
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Project name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              {languagesLoading ? (
                <p className="text-sm text-verde">Loading languages...</p>
              ) : (
                <Select
                  value={editLanguageId}
                  onValueChange={setEditLanguageId}
                >
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
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={saving || !editName.trim() || !editLanguageId}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
