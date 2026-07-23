import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Loader2, Search, X } from "lucide-react"
import { cn } from "@/utils/cn"
import { placesAPI } from "@/services/api"

export interface LocationResult {
  displayName: string
  latitude: number
  longitude: number
}

interface Suggestion {
  placePrediction: {
    placeId: string
    text: { text: string }
    structuredFormat: {
      mainText: { text: string }
      secondaryText: { text: string }
    }
  }
}

interface LocationSearchInputProps {
  value: LocationResult | null
  onChange: (location: LocationResult | null) => void
  className?: string
}

export function LocationSearchInput({
  value,
  onChange,
  className,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resolving, setResolving] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchPlaces = useCallback(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const { data } = await placesAPI.autocomplete(input)
      setSuggestions(data.suggestions ?? [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(val: string) {
    setQuery(val)
    setShowResults(true)
    if (value) onChange(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPlaces(val), 300)
  }

  async function handleSelectSuggestion(suggestion: Suggestion) {
    setResolving(true)
    setShowResults(false)
    try {
      const placeId = suggestion.placePrediction.placeId
      const { data } = await placesAPI.details(placeId)
      if (data.location) {
        onChange({
          displayName:
            data.formattedAddress ||
            data.displayName?.text ||
            suggestion.placePrediction.text.text,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        })
        setQuery("")
        setSuggestions([])
      }
    } catch {
    } finally {
      setResolving(false)
    }
  }

  function handleClear() {
    onChange(null)
    setQuery("")
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-azul/15 shrink-0">
            <MapPin className="h-4 w-4 text-azul" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg-strong truncate">
              {value.displayName}
            </p>
            <p className="text-xs text-fg-subtle font-mono mt-0.5">
              {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center h-7 w-7 rounded-[0.5625rem] text-fg-subtle hover:text-on-accent-soft hover:bg-accent-soft transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5">
            {resolving ? (
              <Loader2 className="h-4 w-4 text-fg-subtle animate-spin shrink-0" />
            ) : (
              <Search className="h-4 w-4 text-fg-subtle shrink-0" />
            )}
            <input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() =>
                query.trim() && suggestions.length > 0 && setShowResults(true)
              }
              placeholder="Search for a location..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-fg-strong placeholder:text-fg-subtle"
            />
          </div>
          {showResults && query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-elevated rounded-xl shadow-[var(--shadow-lg)] p-1.5 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 text-fg-subtle animate-spin" />
                </div>
              ) : suggestions.length === 0 ? (
                <p className="text-sm text-fg-subtle text-center py-4">
                  No locations found
                </p>
              ) : (
                suggestions
                .filter((s) => s.placePrediction)
                .map((suggestion) => (
                  <button
                    key={suggestion.placePrediction.placeId}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <MapPin className="h-4 w-4 text-fg-subtle shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fg-strong truncate">
                        {suggestion.placePrediction.structuredFormat?.mainText?.text ??
                          suggestion.placePrediction.text?.text ??
                          "Unknown"}
                      </p>
                      {suggestion.placePrediction.structuredFormat?.secondaryText?.text && (
                        <p className="text-xs text-fg-subtle truncate">
                          {suggestion.placePrediction.structuredFormat.secondaryText.text}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
