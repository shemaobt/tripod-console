import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { journeysAPI, phaseCategoriesAPI, phasesAPI, projectsAPI, uploadsAPI } from "@/services/api"
import type {
  DerivedPhaseStatus,
  Journey,
  JourneyUpdate,
  PhaseCategory,
  PhaseCategoryUpdate,
  PhaseResponse,
  PhaseStatus,
  PhaseStatusLogEntry,
  PhaseUpdate,
  ProjectResponse,
} from "@/types"
import { useJourneysStore } from "@/stores/journeysStore"
import { FALLBACK_CATEGORY } from "@/constants/journeyStatus"
import { deriveStatus } from "./layout"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
const PATCH_DELAY = 500

const EMPTY_PHASES: PhaseResponse[] = []
const EMPTY_DEPS: Record<string, string[]> = {}
const EMPTY_STATUSES: Record<string, PhaseStatus> = {}
const EMPTY_LOGS: Record<string, PhaseStatusLogEntry[]> = {}

export interface CategoryVisual {
  id: string | null
  name: string
  color: string
  icon: string
}

interface PendingPatch<T, S> {
  timer: ReturnType<typeof setTimeout> | null
  fields: T
  prev: S | undefined
}

interface PhaseData {
  journeyId: string | null
  phases: PhaseResponse[]
  deps: Record<string, string[]>
}

interface StatusData {
  projectId: string | null
  map: Record<string, PhaseStatus>
}

interface LogsData {
  projectId: string | null
  entries: Record<string, PhaseStatusLogEntry[]>
}

function pickImageFile(onPick: (file: File) => void) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ALLOWED_IMAGE_TYPES.join(",")
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) onPick(file)
  }
  input.click()
}

export function useJourneyBuilder(isAdmin: boolean, managedProjectIds: string[]) {
  const journeys = useJourneysStore((s) => s.journeys)
  const categories = useJourneysStore((s) => s.categories)
  const storeLoading = useJourneysStore((s) => s.loading)
  const fetchStore = useJourneysStore((s) => s.fetch)

  const [chosenJourneyId, setChosenJourneyId] = useState<string | null>(null)
  const [phaseData, setPhaseData] = useState<PhaseData>({
    journeyId: null,
    phases: [],
    deps: {},
  })
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [chosenProjectId, setChosenProjectId] = useState<string | null>(null)
  const [statusData, setStatusData] = useState<StatusData>({ projectId: null, map: {} })
  const [logsData, setLogsData] = useState<LogsData>({ projectId: null, entries: {} })

  const phasePatches = useRef<Record<string, PendingPatch<PhaseUpdate, PhaseResponse>>>({})
  const journeyPatches = useRef<Record<string, PendingPatch<JourneyUpdate, Journey>>>({})
  const categoryPatches = useRef<Record<string, PendingPatch<PhaseCategoryUpdate, PhaseCategory>>>({})

  const journeyId =
    chosenJourneyId && journeys.some((j) => j.id === chosenJourneyId)
      ? chosenJourneyId
      : journeys[0]?.id ?? null

  const phasesReady = phaseData.journeyId === journeyId && journeyId !== null
  const phases = phasesReady ? phaseData.phases : EMPTY_PHASES
  const deps = phasesReady ? phaseData.deps : EMPTY_DEPS
  const phasesLoading = journeyId !== null && !phasesReady

  const phasesRef = useRef(phases)

  useEffect(() => {
    phasesRef.current = phases
  })

  const assignedProjects = useMemo(
    () => projects.filter((p) => p.journey_id === journeyId),
    [projects, journeyId],
  )

  const eligibleProjects = useMemo(
    () =>
      isAdmin
        ? assignedProjects
        : assignedProjects.filter((p) => managedProjectIds.includes(p.id)),
    [assignedProjects, isAdmin, managedProjectIds],
  )

  const projectId =
    chosenProjectId && eligibleProjects.some((p) => p.id === chosenProjectId)
      ? chosenProjectId
      : eligibleProjects[0]?.id ?? null

  const statuses =
    statusData.projectId === projectId && projectId !== null ? statusData.map : EMPTY_STATUSES
  const logs =
    logsData.projectId === projectId && projectId !== null ? logsData.entries : EMPTY_LOGS

  useEffect(() => {
    void fetchStore()
    let cancelled = false
    projectsAPI
      .list()
      .then(({ data }) => {
        if (!cancelled) setProjects(data)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [fetchStore])

  useEffect(() => {
    if (!journeyId) return
    let cancelled = false
    phasesAPI
      .listWithDependencies()
      .then(({ data }) => {
        if (cancelled) return
        const own = data.phases
          .filter((p) => p.journey_id === journeyId)
          .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
        const ids = new Set(own.map((p) => p.id))
        const filtered: Record<string, string[]> = {}
        own.forEach((p) => {
          filtered[p.id] = (data.dependencies[p.id] ?? []).filter((d) => ids.has(d))
        })
        setPhaseData({ journeyId, phases: own, deps: filtered })
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load journey phases")
      })
    return () => {
      cancelled = true
    }
  }, [journeyId])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    projectsAPI
      .listPhases(projectId)
      .then(({ data }) => {
        if (cancelled) return
        const map: Record<string, PhaseStatus> = {}
        data.forEach((row) => {
          map[row.phase_id] = row.status
        })
        setStatusData({ projectId, map })
      })
      .catch(() => {
        if (!cancelled) setStatusData({ projectId, map: {} })
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const mutPhases = useCallback((fn: (phases: PhaseResponse[]) => PhaseResponse[]) => {
    setPhaseData((d) => ({ ...d, phases: fn(d.phases) }))
  }, [])

  const mutDeps = useCallback(
    (fn: (deps: Record<string, string[]>) => Record<string, string[]>) => {
      setPhaseData((d) => ({ ...d, deps: fn(d.deps) }))
    },
    [],
  )

  const loadLog = useCallback(
    async (phaseId: string) => {
      if (!projectId) return
      try {
        const { data } = await projectsAPI.phaseStatusLog(projectId, phaseId)
        setLogsData((d) =>
          d.projectId === projectId
            ? { ...d, entries: { ...d.entries, [phaseId]: data } }
            : { projectId, entries: { [phaseId]: data } },
        )
      } catch {}
    },
    [projectId],
  )

  const selectJourney = useCallback((id: string) => {
    setChosenJourneyId(id)
  }, [])

  const selectProject = useCallback((id: string) => {
    setChosenProjectId(id)
  }, [])

  const createJourney = useCallback(async () => {
    try {
      const { data: created } = await journeysAPI.create({ name: "New journey", description: "" })
      const store = useJourneysStore.getState()
      const discovery =
        store.categories.find((c) => c.name === "Discovery") ?? store.categories[0]
      let phaseCount = 0
      try {
        await phasesAPI.create({
          name: "First phase",
          journey_id: created.id,
          category_id: discovery?.id ?? null,
        })
        phaseCount = 1
      } catch {}
      store.setJourneys([
        ...store.journeys,
        { ...created, phase_count: phaseCount, project_count: 0 },
      ])
      store.invalidate()
      setChosenJourneyId(created.id)
      return created.id
    } catch {
      toast.error("Failed to create journey")
      return null
    }
  }, [])

  const updateJourney = useCallback(
    (fields: JourneyUpdate) => {
      if (!journeyId) return
      const store = useJourneysStore.getState()
      const pending = journeyPatches.current[journeyId] ?? {
        timer: null,
        fields: {},
        prev: store.journeys.find((j) => j.id === journeyId),
      }
      store.setJourneys(
        store.journeys.map((j) => (j.id === journeyId ? { ...j, ...fields } : j)),
      )
      store.invalidate()
      pending.fields = { ...pending.fields, ...fields }
      if (pending.timer) clearTimeout(pending.timer)
      pending.timer = setTimeout(() => {
        const rec = journeyPatches.current[journeyId]
        delete journeyPatches.current[journeyId]
        if (!rec) return
        const prev = rec.prev
        journeysAPI.update(journeyId, rec.fields).catch(() => {
          if (prev) {
            const s = useJourneysStore.getState()
            s.setJourneys(s.journeys.map((j) => (j.id === journeyId ? prev : j)))
            s.invalidate()
          }
          toast.error("Failed to save journey")
        })
      }, PATCH_DELAY)
      journeyPatches.current[journeyId] = pending
    },
    [journeyId],
  )

  const deleteJourney = useCallback(async () => {
    if (!journeyId) return
    const store = useJourneysStore.getState()
    if (store.journeys.length < 2) return
    try {
      await journeysAPI.remove(journeyId)
      const rest = store.journeys.filter((j) => j.id !== journeyId)
      store.setJourneys(rest)
      store.invalidate()
      setProjects((ps) =>
        ps.map((p) => (p.journey_id === journeyId ? { ...p, journey_id: null } : p)),
      )
      setChosenJourneyId(rest[0]?.id ?? null)
    } catch {
      toast.error("Failed to delete journey")
    }
  }, [journeyId])

  const addPhase = useCallback(async () => {
    if (!journeyId) return null
    const store = useJourneysStore.getState()
    const planning = store.categories.find((c) => c.name === "Planning") ?? store.categories[0]
    try {
      const { data } = await phasesAPI.create({
        name: "New phase",
        journey_id: journeyId,
        category_id: planning?.id ?? null,
      })
      mutPhases((ps) => [...ps, data])
      mutDeps((d) => ({ ...d, [data.id]: [] }))
      return data
    } catch {
      toast.error("Failed to add phase")
      return null
    }
  }, [journeyId, mutPhases, mutDeps])

  const updatePhaseField = useCallback(
    (id: string, fields: PhaseUpdate, immediate = false) => {
      const pending = phasePatches.current[id] ?? {
        timer: null,
        fields: {},
        prev: phasesRef.current.find((p) => p.id === id),
      }
      mutPhases((ps) => ps.map((p) => (p.id === id ? { ...p, ...fields } : p)))
      pending.fields = { ...pending.fields, ...fields }
      if (pending.timer) clearTimeout(pending.timer)
      const flush = () => {
        const rec = phasePatches.current[id]
        delete phasePatches.current[id]
        if (!rec) return
        const prev = rec.prev
        phasesAPI.update(id, rec.fields).catch(() => {
          if (prev) mutPhases((ps) => ps.map((p) => (p.id === id ? prev : p)))
          toast.error("Failed to save phase")
        })
      }
      if (immediate) {
        phasePatches.current[id] = pending
        flush()
      } else {
        pending.timer = setTimeout(flush, PATCH_DELAY)
        phasePatches.current[id] = pending
      }
    },
    [mutPhases],
  )

  const deletePhase = useCallback(
    async (id: string) => {
      const pending = phasePatches.current[id]
      if (pending?.timer) clearTimeout(pending.timer)
      delete phasePatches.current[id]
      try {
        await phasesAPI.delete(id)
        mutPhases((ps) => ps.filter((p) => p.id !== id))
        mutDeps((d) => {
          const next: Record<string, string[]> = {}
          Object.entries(d).forEach(([key, value]) => {
            if (key !== id) next[key] = value.filter((x) => x !== id)
          })
          return next
        })
        return true
      } catch {
        toast.error("Failed to delete phase")
        return false
      }
    },
    [mutPhases, mutDeps],
  )

  const toggleDependency = useCallback(
    async (phaseId: string, dependsOnId: string) => {
      const current = deps[phaseId] ?? []
      const has = current.includes(dependsOnId)
      mutDeps((d) => ({
        ...d,
        [phaseId]: has ? current.filter((x) => x !== dependsOnId) : [...current, dependsOnId],
      }))
      try {
        if (has) await phasesAPI.removeDependency(phaseId, dependsOnId)
        else await phasesAPI.addDependency(phaseId, dependsOnId)
      } catch {
        mutDeps((d) => ({ ...d, [phaseId]: current }))
        toast.error("Failed to update dependencies")
      }
    },
    [deps, mutDeps],
  )

  const reorderPhase = useCallback(
    async (id: string, dir: -1 | 1) => {
      if (!journeyId) return
      const from = phases.findIndex((p) => p.id === id)
      const to = from + dir
      if (from < 0 || to < 0 || to >= phases.length) return
      const prev = phases
      const next = [...phases]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      const renumbered = next.map((p, idx) => ({ ...p, sort_order: idx }))
      mutPhases(() => renumbered)
      try {
        await phasesAPI.reorder(journeyId, renumbered.map((p) => p.id))
      } catch {
        mutPhases(() => prev)
        toast.error("Failed to reorder phases")
      }
    },
    [journeyId, phases, mutPhases],
  )

  const uploadPhaseIcon = useCallback(
    (phaseId: string) => {
      pickImageFile(async (file) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error("Please upload a JPG, PNG, WebP, or SVG image")
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image must be under 5 MB")
          return
        }
        try {
          const { data } = await uploadsAPI.image(file, "phase-icons")
          updatePhaseField(phaseId, { icon_url: data.url }, true)
        } catch {
          toast.error("Failed to upload image")
        }
      })
    },
    [updatePhaseField],
  )

  const clearPhaseIcon = useCallback(
    (phaseId: string) => {
      updatePhaseField(phaseId, { icon_url: null }, true)
    },
    [updatePhaseField],
  )

  const setStatus = useCallback(
    async (phaseId: string, to: PhaseStatus, note: string) => {
      if (!projectId) return
      const prev = statuses[phaseId] ?? "not_started"
      setStatusData((d) =>
        d.projectId === projectId
          ? { ...d, map: { ...d.map, [phaseId]: to } }
          : { projectId, map: { [phaseId]: to } },
      )
      try {
        const trimmed = note.trim()
        await projectsAPI.updatePhaseStatus(
          projectId,
          phaseId,
          trimmed ? { status: to, note: trimmed } : { status: to },
        )
        void loadLog(phaseId)
      } catch {
        setStatusData((d) =>
          d.projectId === projectId ? { ...d, map: { ...d.map, [phaseId]: prev } } : d,
        )
        toast.error("Failed to update status")
      }
    },
    [projectId, statuses, loadLog],
  )

  const assignProject = useCallback(
    async (targetProjectId: string, on: boolean) => {
      if (!journeyId) return
      const prev = projects
      setProjects((ps) =>
        ps.map((p) =>
          p.id === targetProjectId ? { ...p, journey_id: on ? journeyId : null } : p,
        ),
      )
      try {
        await projectsAPI.assignJourney(targetProjectId, on ? journeyId : null)
      } catch {
        setProjects(prev)
        toast.error("Failed to update project assignment")
      }
    },
    [journeyId, projects],
  )

  const addCategory = useCallback(async () => {
    try {
      const { data } = await phaseCategoriesAPI.create({
        name: "New category",
        color: "#4D7068",
        icon: "layers",
      })
      const store = useJourneysStore.getState()
      store.setCategories([...store.categories, data])
      return data.id
    } catch {
      toast.error("Failed to create category")
      return null
    }
  }, [])

  const updateCategory = useCallback(
    (id: string, fields: PhaseCategoryUpdate, immediate = false) => {
      const store = useJourneysStore.getState()
      const pending = categoryPatches.current[id] ?? {
        timer: null,
        fields: {},
        prev: store.categories.find((c) => c.id === id),
      }
      store.setCategories(
        store.categories.map((c) => (c.id === id ? { ...c, ...fields } : c)),
      )
      pending.fields = { ...pending.fields, ...fields }
      if (pending.timer) clearTimeout(pending.timer)
      const flush = () => {
        const rec = categoryPatches.current[id]
        delete categoryPatches.current[id]
        if (!rec) return
        const prev = rec.prev
        phaseCategoriesAPI.update(id, rec.fields).catch(() => {
          if (prev) {
            const s = useJourneysStore.getState()
            s.setCategories(s.categories.map((c) => (c.id === id ? prev : c)))
          }
          toast.error("Failed to save category")
        })
      }
      if (immediate) {
        categoryPatches.current[id] = pending
        flush()
      } else {
        pending.timer = setTimeout(flush, PATCH_DELAY)
        categoryPatches.current[id] = pending
      }
    },
    [],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      const store = useJourneysStore.getState()
      if (store.categories.length < 2) return
      try {
        await phaseCategoriesAPI.remove(id)
        const rest = store.categories.filter((c) => c.id !== id)
        store.setCategories(rest)
        const fallback = rest[0]
        mutPhases((ps) =>
          ps.map((p) => (p.category_id === id ? { ...p, category_id: fallback.id } : p)),
        )
      } catch {
        toast.error("Failed to delete category")
      }
    },
    [mutPhases],
  )

  const categoryFor = useCallback(
    (categoryId: string | null): CategoryVisual => {
      const found = categoryId ? categories.find((c) => c.id === categoryId) : undefined
      if (!found) {
        return {
          id: null,
          name: FALLBACK_CATEGORY.name,
          color: FALLBACK_CATEGORY.color,
          icon: FALLBACK_CATEGORY.icon,
        }
      }
      return { id: found.id, name: found.name, color: found.color, icon: found.icon }
    },
    [categories],
  )

  const storedStatus = useCallback(
    (phaseId: string): PhaseStatus => statuses[phaseId] ?? "not_started",
    [statuses],
  )

  const derivedStatus = useCallback(
    (phaseId: string): DerivedPhaseStatus => deriveStatus(phaseId, deps, statuses),
    [deps, statuses],
  )

  const projectCountFor = useCallback(
    (jid: string) => projects.filter((p) => p.journey_id === jid).length,
    [projects],
  )

  const journeyPhaseCount = useCallback(
    (j: Journey) => (j.id === journeyId ? phases.length : j.phase_count),
    [journeyId, phases.length],
  )

  const journey = useMemo(
    () => journeys.find((j) => j.id === journeyId) ?? null,
    [journeys, journeyId],
  )

  const project = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  )

  return {
    journeys,
    categories,
    journey,
    journeyId,
    phases,
    deps,
    phasesLoading,
    initialLoading: storeLoading && journeys.length === 0,
    projects,
    assignedProjects,
    eligibleProjects,
    projectId,
    project,
    statuses,
    logs,
    hasProject: projectId !== null,
    selectJourney,
    selectProject,
    createJourney,
    updateJourney,
    deleteJourney,
    addPhase,
    updatePhaseField,
    deletePhase,
    toggleDependency,
    reorderPhase,
    uploadPhaseIcon,
    clearPhaseIcon,
    setStatus,
    loadLog,
    assignProject,
    addCategory,
    updateCategory,
    deleteCategory,
    categoryFor,
    storedStatus,
    derivedStatus,
    projectCountFor,
    journeyPhaseCount,
  }
}

export type JourneyBuilder = ReturnType<typeof useJourneyBuilder>
