import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Globe } from "lucide-react"
import { projectsAPI } from "@/services/api"
import type { ProjectResponse } from "@/types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { InfoTooltip } from "@/components/common/InfoTooltip"

// Fix default marker icons for Leaflet (webpack/vite asset issue)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default function MapPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await projectsAPI.list()
        setProjects(res.data)
      } catch {
        // silently fail — map will show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const locatedProjects = projects.filter(
    (p) => p.latitude !== null && p.longitude !== null,
  )

  if (loading) return <LoadingSpinner size="lg" />

  if (locatedProjects.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Globe}
          title="No project locations to show"
          description="Projects with latitude and longitude coordinates will appear on this map. Edit a project to add location data."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-4">
        <h1 className="text-2xl font-semibold text-preto tracking-tight">
          Project Map
        </h1>
        <InfoTooltip content="View all projects with location data on an interactive world map." />
      </div>

      <FeatureSpotlight
        featureKey="map-first-visit"
        title="Project Map"
        description="This map shows all projects that have location coordinates. Click a marker to see project details."
        side="bottom"
      >
        <div className="flex-1 mx-6 mb-6 rounded-lg overflow-hidden border border-areia/30 shadow-sm">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-full w-full"
            style={{ minHeight: "500px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locatedProjects.map((project) => (
              <Marker
                key={project.id}
                position={[project.latitude!, project.longitude!]}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{project.name}</p>
                    <p className="text-xs text-gray-600">
                      {project.location_display_name || "No location name"}
                    </p>
                    <Link
                      to={`/app/projects/${project.id}`}
                      className="text-xs text-telha hover:underline"
                    >
                      View project
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </FeatureSpotlight>
    </div>
  )
}
