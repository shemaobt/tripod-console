import { create } from "zustand"
import type { PhaseResponse } from "@/types"
import { phasesAPI } from "@/services/api"

interface PhasesStore {
  phases: PhaseResponse[]
  dependencies: Map<string, string[]>
  loading: boolean
  lastFetched: number | null
  fetch: () => Promise<void>
  invalidate: () => void
  reset: () => void
}

const CACHE_TTL = 2 * 60 * 1000

// Bumped by reset() so a fetch still in flight at logout cannot repopulate the cache.
let generation = 0

export const usePhasesStore = create<PhasesStore>((set, get) => ({
  phases: [],
  dependencies: new Map(),
  loading: false,
  lastFetched: null,

  fetch: async () => {
    const state = get()
    if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL && state.phases.length > 0) {
      return
    }
    if (state.loading) return
    const fetchedIn = generation
    set({ loading: true })
    try {
      const { data } = await phasesAPI.listWithDependencies()
      if (fetchedIn !== generation) return
      const depsMap = new Map<string, string[]>()
      for (const [phaseId, depIds] of Object.entries(data.dependencies as Record<string, string[]>)) {
        depsMap.set(phaseId, depIds)
      }
      set({
        phases: data.phases,
        dependencies: depsMap,
        lastFetched: Date.now(),
        loading: false,
      })
    } catch {
      if (fetchedIn === generation) set({ loading: false })
    }
  },

  invalidate: () => {
    set({ lastFetched: null })
  },

  reset: () => {
    generation += 1
    set({ phases: [], dependencies: new Map(), loading: false, lastFetched: null })
  },
}))
