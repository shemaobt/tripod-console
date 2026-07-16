import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ArrowLeft, MapPin } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import type { ProjectResponse, LanguageResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LocationSearchInput } from "@/components/common/LocationSearchInput"
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

const locationMarkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
  <path d="M16 2C9.373 2 4 7.373 4 14c0 8.5 12 24 12 24s12-15.5 12-24c0-6.627-5.373-12-12-12z" fill="#BE4A01"/>
  <circle cx="16" cy="14" r="5" fill="white"/>
</svg>`

const locationIcon = L.divIcon({
  html: locationMarkerSvg,
  className: "",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

function projectInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
}

function ProjectInfoForm({
  project,
  languages,
  languagesLoading,
  onSaved,
}: {
  project: ProjectResponse
  languages: LanguageResponse[]
  languagesLoading: boolean
  onSaved: (project: ProjectResponse) => void
}) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? "")
  const [languageId, setLanguageId] = useState(project.language_id)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || !languageId) return
    setSaving(true)
    try {
      const { data } = await projectsAPI.update(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        language_id: languageId,
      })
      onSaved(data)
      toast.success("Project updated")
    } catch {
      toast.error("Failed to update project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${card.base} p-5 sm:p-6 flex flex-col gap-5`}>
      <h4 className="text-[15.5px] font-semibold text-fg-strong">
        Project information
      </h4>
      <div className="space-y-1.5">
        <Label htmlFor="pj-name">Name</Label>
        <Input
          id="pj-name"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pj-description">Description</Label>
        <Textarea
          id="pj-description"
          placeholder="Brief description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Language</Label>
        {languagesLoading ? (
          <p className="text-sm text-fg-muted">Loading languages...</p>
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
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !languageId}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
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
      const lat = manualLat.trim() ? parseFloat(manualLat) : null
      const lng = manualLng.trim() ? parseFloat(manualLng) : null
      if (manualLat.trim() && isNaN(lat!)) {
        toast.error("Latitude must be a valid number")
        return
      }
      if (manualLng.trim() && isNaN(lng!)) {
        toast.error("Longitude must be a valid number")
        return
      }
      await onSave(lat, lng, manualName.trim() || null)
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

  const hasValue = Boolean(location || manualLat || manualLng)

  return (
    <div className={`${card.base} p-5 sm:p-6 flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <h4 className="flex items-center text-[15.5px] font-semibold text-fg-strong">
          Location
          <InfoTooltip content="Set the geographic location for this project. Search for a place or enter coordinates manually." />
        </h4>
        {hasValue && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-[12.5px] font-semibold text-accent hover:underline"
          >
            Clear location
          </button>
        )}
      </div>

      {location ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent flex-none" strokeWidth={1.75} />
            {location.displayName && (
              <span className="text-sm font-semibold text-fg-strong truncate">
                {location.displayName}
              </span>
            )}
            <span className="font-mono text-[11.5px] text-fg-subtle">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          <div className="h-[180px] rounded-[12px] overflow-hidden relative">
            <MapContainer
              key={`${location.latitude},${location.longitude}`}
              center={[location.latitude, location.longitude]}
              zoom={8}
              className="h-full w-full"
              style={{ position: "absolute", inset: 0 }}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maxZoom={20} />
              <Marker position={[location.latitude, location.longitude]} icon={locationIcon} />
            </MapContainer>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-fg-subtle">
          No location set. Search a place or enter coordinates manually.
        </p>
      )}

      <div className="space-y-1.5">
        <Label>Search a place</Label>
        <LocationSearchInput value={location} onChange={handleLocationChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3.5 sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="pj-lat">Latitude</Label>
          <Input
            id="pj-lat"
            className="font-mono"
            placeholder="-4.2523"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pj-lng">Longitude</Label>
          <Input
            id="pj-lng"
            className="font-mono"
            placeholder="-69.9381"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "Applying..." : "Apply"}
        </Button>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

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
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14">
        <p className="text-fg-muted">Project not found.</p>
      </div>
    )
  }

  const language = languages.find((l) => l.id === project.language_id)
  const locationLine =
    project.location_display_name ||
    (project.latitude != null && project.longitude != null
      ? `${project.latitude}, ${project.longitude}`
      : null)

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <button
        onClick={() => navigate("/app/projects")}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-muted hover:text-fg-strong transition-colors mb-4"
      >
        <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={1.75} />
        Projects
      </button>

      <Tabs defaultValue="info">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-[18px]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-[54px] h-[54px] rounded-[14px] bg-azul/20 text-azul grid place-items-center text-[15px] font-bold flex-none">
              {projectInitials(project.name)}
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="flex items-center text-[25px] font-bold text-fg-strong tracking-tight">
                {project.name}
                <InfoTooltip content="View and manage this project's details, location, and access permissions." />
              </h3>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                {language && (
                  <span className="font-mono text-[11.5px] bg-muted rounded-md px-2 py-0.5 text-fg-muted">
                    {language.code}
                  </span>
                )}
                <span className="text-[13px] text-fg-muted">
                  {language?.name ?? "Unknown language"}
                </span>
                {locationLine && (
                  <>
                    <span className="text-[13px] text-fg-subtle">·</span>
                    <span className="text-[13px] text-fg-muted">
                      {locationLine}
                    </span>
                  </>
                )}
                <span className="text-[13px] text-fg-subtle">·</span>
                <span className="text-[13px] text-fg-muted">
                  {project.team_size}{" "}
                  {project.team_size === 1 ? "person" : "people"}
                </span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">
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
