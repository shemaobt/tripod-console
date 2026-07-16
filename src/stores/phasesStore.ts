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
    set({ loading: true })
    try {
      const { data } = await phasesAPI.listWithDependencies()
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
      set({ loading: false })
    }
  },

  invalidate: () => {
    set({ lastFetched: null })
  },

  reset: () => {
    set({ phases: [], dependencies: new Map(), loading: false, lastFetched: null })
  },
}))
