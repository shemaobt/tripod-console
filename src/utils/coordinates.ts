export type CoordinateField = "latitude" | "longitude"

export type ParsedCoordinates =
  | { ok: true; latitude: number | null; longitude: number | null }
  | { ok: false; errors: Partial<Record<CoordinateField, string>> }

const LIMIT: Record<CoordinateField, number> = { latitude: 90, longitude: 180 }
const LABEL: Record<CoordinateField, string> = { latitude: "Latitude", longitude: "Longitude" }
const EXAMPLE: Record<CoordinateField, string> = { latitude: "-4.2523", longitude: "-69.9381" }
const PLAIN_NUMBER = /^[-+]?(\d+(\.\d*)?|\.\d+)$/

function fieldError(field: CoordinateField, text: string): string | null {
  if (!PLAIN_NUMBER.test(text)) return `${LABEL[field]} must be a number, like ${EXAMPLE[field]}.`
  const value = Number(text)
  if (Math.abs(value) > LIMIT[field]) {
    return `${LABEL[field]} must be between -${LIMIT[field]} and ${LIMIT[field]}.`
  }
  return null
}

// Coordinates are optional (a location may be just a name), but never half a pair.
export function parseCoordinates(latText: string, lngText: string): ParsedCoordinates {
  const text: Record<CoordinateField, string> = {
    latitude: latText.trim(),
    longitude: lngText.trim(),
  }
  if (!text.latitude && !text.longitude) return { ok: true, latitude: null, longitude: null }

  const errors: Partial<Record<CoordinateField, string>> = {}
  for (const field of ["latitude", "longitude"] as const) {
    const other = field === "latitude" ? "longitude" : "latitude"
    const problem = text[field]
      ? fieldError(field, text[field])
      : `Enter the ${field} too, or clear the ${other} to keep the location without coordinates.`
    if (problem) errors[field] = problem
  }
  if (errors.latitude || errors.longitude) return { ok: false, errors }
  return { ok: true, latitude: Number(text.latitude), longitude: Number(text.longitude) }
}
