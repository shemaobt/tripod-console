import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useTheme } from "@/contexts/ThemeContext"
import type { ProjectResponse } from "@/types"

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const FALLBACK_CENTER: [number, number] = [-14.2, -51.9]

function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [26, 26] })
    } else if (points.length === 1) {
      map.setView(points[0], 5)
    } else {
      map.setView(FALLBACK_CENTER, 4)
    }
  }, [map, points])
  return null
}

export function MapPreview({ projects }: { projects: ProjectResponse[] }) {
  const { resolvedTheme } = useTheme()

  const located = useMemo(
    () => projects.filter((p) => p.latitude != null && p.longitude != null),
    [projects],
  )
  const points = useMemo(
    () => located.map((p) => [p.latitude!, p.longitude!] as [number, number]),
    [located],
  )
  const tileUrl = resolvedTheme === "dark" ? DARK_TILES : LIGHT_TILES

  return (
    <div className="relative overflow-hidden rounded-[18px] shadow-[var(--shadow-card)] h-[250px]">
      <MapContainer
        center={FALLBACK_CENTER}
        zoom={4}
        className="absolute inset-0 h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer key={tileUrl} url={tileUrl} maxZoom={19} />
        <FitToMarkers points={points} />
        {located.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude!, p.longitude!]}
            radius={6}
            pathOptions={{ color: "#F6F5EB", weight: 2, fillColor: "#BE4A01", fillOpacity: 1 }}
          />
        ))}
      </MapContainer>
      <div className="absolute left-3.5 bottom-3.5 z-[500] bg-elevated rounded-[12px] shadow-[var(--shadow-md)] px-3.5 py-2.5 flex items-center gap-3.5">
        <span className="text-[12.5px] text-fg-muted">
          <strong className="text-fg-strong">{located.length}</strong> projects with field
          locations
        </span>
        <Link
          to="/app/map"
          className="bg-accent text-white rounded-full px-3.5 py-1.5 text-xs font-semibold hover:bg-accent-hover transition-colors"
        >
          Open map
        </Link>
      </div>
    </div>
  )
}
