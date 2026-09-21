import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { projectsAPI } from "@/services/api"
import type { ProjectResponse, ProjectPhaseResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { useTheme } from "@/contexts/ThemeContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ProjectPopupContent } from "./map/ProjectPopupContent"
import { FieldMapPanel, type MapRow } from "./map/FieldMapPanel"
import { MAP_ATTRIBUTION, createProjectPinIcon, tileUrlForTheme } from "@/constants/map"

const projectIcon = createProjectPinIcon({ popupAnchor: [0, -38] })

function FlyToProject({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 })
  }, [map, lat, lng])
  return null
}

export default function MapPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [projectPhases, setProjectPhases] = useState<Map<string, ProjectPhaseResponse[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const { fetch: fetchLanguages, getLanguageName } = useLanguagesStore()
  const [activeProject, setActiveProject] = useState<ProjectResponse | null>(null)
  const { resolvedTheme } = useTheme()
  const tileUrl = tileUrlForTheme(resolvedTheme)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes] = await Promise.all([
          projectsAPI.list(),
          fetchLanguages(),
        ])
        setProjects(projectsRes.data)

        const phasesMap = new Map<string, ProjectPhaseResponse[]>()
        const phaseResults = await Promise.allSettled(
          projectsRes.data.map((p) => projectsAPI.listPhases(p.id)),
        )
        phaseResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            phasesMap.set(projectsRes.data[idx].id, result.value.data)
          }
        })
        setProjectPhases(phasesMap)
      } catch {
        void 0
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locatedProjects = useMemo(
    () => projects.filter((p) => p.latitude !== null && p.longitude !== null),
    [projects],
  )

  const rows = useMemo<MapRow[]>(
    () =>
      locatedProjects.map((project) => {
        const locLine =
          project.location_display_name ??
          `${project.latitude!.toFixed(3)}, ${project.longitude!.toFixed(3)}`
        const phases = projectPhases.get(project.id) ?? []
        const done = phases.filter((p) => p.status === "completed").length
        const lang = getLanguageName(project.language_id)
        const parts: string[] = []
        if (lang) parts.push(lang)
        parts.push(`${project.team_size} member${project.team_size === 1 ? "" : "s"}`)
        if (phases.length) parts.push(`${done}/${phases.length} phases`)
        return { project, name: project.name, locLine, meta: parts.join(" · ") }
      }),
    [locatedProjects, projectPhases, getLanguageName],
  )

  const countLabel = `${locatedProjects.length} project${locatedProjects.length === 1 ? "" : "s"} with coordinates`

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[10, 0]}
        zoom={3}
        className="h-full w-full"
        style={{ position: "absolute", inset: 0 }}
        zoomControl={false}
      >
        <TileLayer
          key={tileUrl}
          attribution={MAP_ATTRIBUTION}
          url={tileUrl}
          maxZoom={20}
        />
        {activeProject && (
          <FlyToProject
            lat={activeProject.latitude!}
            lng={activeProject.longitude!}
          />
        )}
        {locatedProjects.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude!, project.longitude!]}
            icon={projectIcon}
            eventHandlers={{
              click: () => setActiveProject(project),
            }}
          >
            <Popup maxWidth={300}>
              <ProjectPopupContent
                project={project}
                languageName={getLanguageName(project.language_id)}
                phases={projectPhases.get(project.id) ?? []}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <FieldMapPanel
        rows={rows}
        activeId={activeProject?.id ?? null}
        onSelect={setActiveProject}
        countLabel={countLabel}
      />
    </div>
  )
}
