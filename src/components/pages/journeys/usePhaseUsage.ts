import { useCallback, useRef, useState } from "react"
import { phasesAPI } from "@/services/api"

interface Usage {
  id: string
  count: number | null
}

export function usePhaseUsage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const latest = useRef<string | null>(null)

  const check = useCallback((id: string) => {
    latest.current = id
    setUsage(null)
    phasesAPI.get(id).then(
      ({ data }) => {
        if (latest.current === id) setUsage({ id, count: data.project_ids?.length ?? 0 })
      },
      () => {
        if (latest.current === id) setUsage({ id, count: null })
      },
    )
  }, [])

  const usedBy = (id: string | null): number | null | undefined =>
    usage && usage.id === id ? usage.count : undefined

  return { check, usedBy }
}

export function deletePhaseDescription(name: string, usedBy: number | null | undefined) {
  const base = `Hard delete of "${name}" from this journey. This cannot be undone.`
  if (usedBy === undefined) return `${base} Checking which projects use this phase…`
  if (usedBy === null)
    return `${base} We couldn't check which projects use this phase — any that do will lose its status and history.`
  if (usedBy === 0) return base
  return `${base} Used by ${usedBy} project${usedBy === 1 ? "" : "s"} — their phase statuses and history will be removed.`
}
