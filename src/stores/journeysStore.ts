import { create } from "zustand"
import type { Journey, PhaseCategory } from "@/types"
import { journeysAPI, phaseCategoriesAPI } from "@/services/api"

interface JourneysStore {
  journeys: Journey[]
  categories: PhaseCategory[]
  loading: boolean
  lastFetched: number | null
  fetch: () => Promise<void>
  setJourneys: (journeys: Journey[]) => void
  setCategories: (categories: PhaseCategory[]) => void
  invalidate: () => void
  reset: () => void
}

const CACHE_TTL = 2 * 60 * 1000

export const useJourneysStore = create<JourneysStore>((set, get) => ({
  journeys: [],
  categories: [],
  loading: false,
  lastFetched: null,

  fetch: async () => {
    const state = get()
    if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
      return
    }
    if (state.loading) return
    set({ loading: true })
    try {
      const [journeysRes, categoriesRes] = await Promise.all([
        journeysAPI.list(),
        phaseCategoriesAPI.list(),
      ])
      set({
        journeys: journeysRes.data,
        categories: categoriesRes.data,
        lastFetched: Date.now(),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  setJourneys: (journeys) => {
    set({ journeys })
  },

  setCategories: (categories) => {
    set({ categories })
  },

  invalidate: () => {
    set({ lastFetched: null })
  },

  reset: () => {
    set({ journeys: [], categories: [], loading: false, lastFetched: null })
  },
}))
