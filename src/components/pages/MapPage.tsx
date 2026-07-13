import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Globe, MapPin, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { projectsAPI } from "@/services/api"
import type { PhaseStatus, ProjectResponse, ProjectPhaseResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils/cn"

const TELHA = "#BE4A01"
const VERDE = "#3F3E20"
const AREIA = "#C5C29F"
const AZUL = "#89AAA3"

const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
  <filter id="s" x="0" y="2" width="32" height="40" filterUnits="userSpaceOnUse">
    <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.25"/>
  </filter>
  <path filter="url(#s)" d="M16 2C9.373 2 4 7.373 4 14c0 8.5 12 24 12 24s12-15.5 12-24c0-6.627-5.373-12-12-12z" fill="${TELHA}"/>
  <circle cx="16" cy="14" r="5" fill="white"/>
</svg>`

const projectIcon = L.divIcon({
  html: markerSvg,
  className: "",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
})

import { formatDate } from "@/utils/format"

function FlyToProject({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 })
  }, [map, lat, lng])
  return null
}

const PHASE_STATUS_COLORS: Record<PhaseStatus, { bg: string; text: string; dot: string }> = {
  not_started: { bg: `${AREIA}30`, text: VERDE, dot: `${AREIA}` },
  in_progress: { bg: `${AZUL}30`, text: AZUL, dot: AZUL },
  completed: { bg: "#777D4530", text: "#777D45", dot: "#777D45" },
  blocked: { bg: "#FEE2E2", text: "#B91C1C", dot: "#B91C1C" },
}

function ProjectPopupContent({
  project,
  languageName,
  phases,
}: {
  project: ProjectResponse
  languageName: string | null
  phases: ProjectPhaseResponse[]
}) {
  const navigate = useNavigate()

  return (
    <div style={{ minWidth: 220, maxWidth: 300, fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${AZUL}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M9 2v4" />
            <path d="M15 2v4" />
            <path d="M9 14h.01" />
            <path d="M15 14h.01" />
            <path d="M9 18h.01" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0A0703", lineHeight: 1.3 }}>
            {project.name}
          </div>
          {project.location_display_name && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: VERDE,
                marginTop: 2,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {project.location_display_name}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div
          style={{
            fontSize: 12,
            color: `${VERDE}B3`,
            lineHeight: 1.5,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </div>
      )}

      {/* Phases */}
      {phases.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Phases
            </div>
            <div style={{ fontSize: 10, color: "#777D45", fontWeight: 600 }}>
              {phases.filter((p) => p.status === "completed").length}/{phases.length} completed
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {phases.map((p) => {
              const colors = PHASE_STATUS_COLORS[p.status]
              return (
                <span
                  key={p.phase_id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: colors.bg,
                    color: colors.text,
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
                  {p.phase_name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 12px",
          padding: "10px 0",
          borderTop: `1px solid ${AREIA}40`,
          borderBottom: `1px solid ${AREIA}40`,
          marginBottom: 12,
        }}
      >
        {languageName && (
          <div>
            <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Language
            </div>
            <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
              {languageName}
            </div>
          </div>
        )}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Team
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {project.team_size} {project.team_size === 1 ? "member" : "members"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Coordinates
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontFamily: "monospace", marginTop: 1 }}>
            {project.latitude?.toFixed(4)}, {project.longitude?.toFixed(4)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Created
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {formatDate(project.created_at)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Updated
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {formatDate(project.updated_at)}
          </div>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => navigate(`/app/projects/${project.id}`)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "none",
          background: TELHA,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Montserrat, sans-serif",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9" }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
      >
        Open Project
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

function ProjectListPanel({
  projects,
  activeId,
  onSelect,
  collapsed,
  onToggle,
}: {
  projects: ProjectResponse[]
  activeId: string | null
  onSelect: (project: ProjectResponse) => void
  collapsed: boolean
  onToggle: () => void
}) {
  const [search, setSearch] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.location_display_name ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : projects

  return (
    <div
      className={cn(
        "absolute top-4 right-4 z-[1000] transition-all duration-300 ease-in-out",
        collapsed ? "w-10" : "w-[calc(100vw-2rem)] sm:w-72",
      )}
    >
      {collapsed ? (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-surface/90 backdrop-blur-md shadow-lg border border-areia/20 text-verde hover:text-preto transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : (
        <div className="bg-surface/90 backdrop-blur-md rounded-xl shadow-lg border border-areia/20 overflow-hidden flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-10rem)]">
          <div className="px-3 pt-3 pb-2 border-b border-areia/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-verde/70 uppercase tracking-wider">
                Projects
              </span>
              <button
                onClick={onToggle}
                className="flex items-center justify-center h-6 w-6 rounded-md text-verde/50 hover:text-preto hover:bg-areia/10 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-verde/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="h-8 pl-8 text-xs bg-surface/60"
              />
            </div>
          </div>
          <div ref={listRef} className="overflow-y-auto flex-1 py-1.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-verde/50 text-center py-4">
                No projects found
              </p>
            ) : (
              filtered.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelect(project)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 transition-colors",
                    activeId === project.id
                      ? "bg-telha/10"
                      : "hover:bg-areia/10",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      activeId === project.id ? "text-telha" : "text-preto",
                    )}
                  >
                    {project.name}
                  </p>
                  {project.location_display_name && (
                    <p className="flex items-center gap-1 text-[11px] text-verde/60 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {project.location_display_name}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [projectPhases, setProjectPhases] = useState<Map<string, ProjectPhaseResponse[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const { fetch: fetchLanguages, getLanguageName } = useLanguagesStore()
  const [activeProject, setActiveProject] = useState<ProjectResponse | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(false)

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
        // silently fail — map will show empty state
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

  if (loading) return <LoadingSpinner size="lg" />

  function handleSelectProject(project: ProjectResponse) {
    setActiveProject(project)
  }

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
            <Popup closeButton={false} maxWidth={320} minWidth={260}>
              <ProjectPopupContent
                project={project}
                languageName={getLanguageName(project.language_id)}
                phases={projectPhases.get(project.id) ?? []}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating header overlay */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto bg-surface/90 backdrop-blur-md rounded-xl shadow-lg border border-areia/20 px-5 py-3.5">
          <h1 className="text-lg font-semibold text-preto tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-azul" />
            Project Map
          </h1>
          <p className="text-xs text-verde/60 mt-0.5 ml-7">
            {locatedProjects.length} project{locatedProjects.length !== 1 ? "s" : ""} with coordinates
          </p>
        </div>
      </div>

      {/* Project list panel */}
      <ProjectListPanel
        projects={locatedProjects}
        activeId={activeProject?.id ?? null}
        onSelect={handleSelectProject}
        collapsed={panelCollapsed}
        onToggle={() => setPanelCollapsed((c) => !c)}
      />
    </div>
  )
}
