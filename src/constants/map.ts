import L from "leaflet"
import type { DivIcon, PointTuple } from "leaflet"

export const TELHA = "#BE4A01"

export const MAP_TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const

export function tileUrlForTheme(theme: "light" | "dark"): string {
  return MAP_TILE_URLS[theme]
}

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

const PIN_SIZE: PointTuple = [32, 42]
const PIN_ANCHOR: PointTuple = [16, 42]
const PIN_PATH =
  "M16 2C9.373 2 4 7.373 4 14c0 8.5 12 24 12 24s12-15.5 12-24c0-6.627-5.373-12-12-12z"

const PIN_SHADOW_FILTER = `<filter id="pin-shadow" x="0" y="2" width="32" height="40" filterUnits="userSpaceOnUse">
    <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.25"/>
  </filter>`

function pinSvg(shadow: boolean): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
  ${shadow ? PIN_SHADOW_FILTER : ""}
  <path ${shadow ? 'filter="url(#pin-shadow)" ' : ""}d="${PIN_PATH}" fill="${TELHA}"/>
  <circle cx="16" cy="14" r="5" fill="white"/>
</svg>`
}

export function createProjectPinIcon(
  options: { shadow?: boolean; popupAnchor?: PointTuple } = {},
): DivIcon {
  const { shadow = true, popupAnchor } = options
  return L.divIcon({
    html: pinSvg(shadow),
    className: "",
    iconSize: PIN_SIZE,
    iconAnchor: PIN_ANCHOR,
    popupAnchor,
  })
}
