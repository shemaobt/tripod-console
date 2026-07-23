import { useState } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import type { ProjectResponse } from "@/types"
import { useTheme } from "@/contexts/ThemeContext"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationSearchInput } from "@/components/common/LocationSearchInput"
import { InfoTooltip } from "@/components/common/InfoTooltip"

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

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

interface LocationSectionProps {
  project: ProjectResponse
  onSave: (
    lat: number | null,
    lng: number | null,
    displayName: string | null,
  ) => Promise<void>
}

export function LocationSection({ project, onSave }: LocationSectionProps) {
  const { resolvedTheme } = useTheme()
  const tileUrl = resolvedTheme === "dark" ? DARK_TILES : LIGHT_TILES
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
        <h4 className="flex items-center text-[0.96875rem] font-semibold text-fg-strong">
          Location
          <InfoTooltip content="Set the geographic location for this project. Search for a place or enter coordinates manually." />
        </h4>
        {hasValue && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-[0.78125rem] font-semibold text-accent hover:underline"
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
            <span className="font-mono text-[0.71875rem] text-fg-subtle">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          <div className="h-[11.25rem] rounded-[0.75rem] overflow-hidden relative">
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
              <TileLayer key={tileUrl} url={tileUrl} maxZoom={20} />
              <Marker position={[location.latitude, location.longitude]} icon={locationIcon} />
            </MapContainer>
          </div>
        </div>
      ) : (
        <p className="text-[0.8125rem] text-fg-subtle">
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
