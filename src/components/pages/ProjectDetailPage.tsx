import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  FolderOpen,
  Pencil,
  MapPin,
  Save,
  Shield,
  GitBranch,
} from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationSearchInput } from "@/components/common/LocationSearchInput"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ProjectAccessTab } from "./ProjectAccessTab"
import { ProjectPhasesTab } from "./ProjectPhasesTab"

import { formatDate } from "@/utils/format"

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
    <div className={`${card.base} p-4 sm:p-6`}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
  const [location, setLocation] = useState<{
    displayName: string
    latitude: number
    longitude: number
  } | null>(
    project.latitude != null && project.longitude != null
      ? {
          displayName: project.location_display_name || "",
          latitude: project.latitude,
          longitude: project.longitude,
        }
      : null,
  )
  const [saving, setSaving] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [manualLat, setManualLat] = useState(
    project.latitude != null ? String(project.latitude) : "",
  )
  const [manualLng, setManualLng] = useState(
    project.longitude != null ? String(project.longitude) : "",
  )
  const [manualName, setManualName] = useState(
    project.location_display_name ?? "",
  )

  async function handleSave() {
    setSaving(true)
    try {
      if (showManual) {
        const lat = manualLat.trim() ? parseFloat(manualLat) : null
        const lng = manualLng.trim() ? parseFloat(manualLng) : null
        if (manualLat.trim() && isNaN(lat!)) {
          toast.error("Latitude must be a valid number")
          setSaving(false)
          return
        }
        if (manualLng.trim() && isNaN(lng!)) {
          toast.error("Longitude must be a valid number")
          setSaving(false)
          return
        }
        await onSave(lat, lng, manualName.trim() || null)
      } else if (location) {
        await onSave(
          location.latitude,
          location.longitude,
          location.displayName || null,
        )
      } else {
        await onSave(null, null, null)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleLocationChange(
    loc: { displayName: string; latitude: number; longitude: number } | null,
  ) {
    setLocation(loc)
    if (loc) {
      setManualLat(String(loc.latitude))
      setManualLng(String(loc.longitude))
      setManualName(loc.displayName)
    }
  }

  function handleClearLocation() {
    setLocation(null)
    setManualLat("")
    setManualLng("")
    setManualName("")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-azul" />
        Location
        <InfoTooltip content="Set the geographic location for this project. Search for a place or enter coordinates manually." />
      </h3>

      <LocationSearchInput value={location} onChange={handleLocationChange} />

      <div>
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-verde/60 hover:text-preto transition-colors"
        >
          {showManual
            ? "Hide manual coordinates"
            : "Enter coordinates manually"}
        </button>

        {showManual && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
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
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
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
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Location Name</Label>
              <Input
                id="display-name"
                placeholder="e.g. Manaus, Brazil"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Location"}
        </Button>
        {(location || manualLat || manualLng) && (
          <Button
            variant="outline-destructive"
            size="sm"
            onClick={handleClearLocation}
          >
            Clear Location
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const { languages, loading: languagesLoading, fetch: fetchLanguages, getLanguageName } = useLanguagesStore()

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
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/projects")}
          className="inline-flex items-center gap-1 text-sm text-verde/60 hover:text-preto transition-colors mb-4"
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
          <TabsTrigger value="phases">
            <GitBranch className="h-4 w-4 mr-1" />
            Phases
          </TabsTrigger>
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

        <TabsContent value="phases" className="mt-4">
          <ProjectPhasesTab projectId={projectId!} />
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <ProjectAccessTab projectId={projectId!} />
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update this project's details and language assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Project name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
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
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
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
