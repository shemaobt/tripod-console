import { create } from "zustand"
import type { LanguageResponse } from "@/types"
import { languagesAPI } from "@/services/api"

interface LanguagesStore {
  languages: LanguageResponse[]
  loading: boolean
  lastFetched: number | null
  fetch: () => Promise<LanguageResponse[]>
  invalidate: () => void
  reset: () => void
  getLanguageName: (langId: string) => string
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const useLanguagesStore = create<LanguagesStore>((set, get) => ({
  languages: [],
  loading: false,
  lastFetched: null,

  fetch: async () => {
    const state = get()
    // Return cached if fresh
    if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL && state.languages.length > 0) {
      return state.languages
    }
    // Avoid duplicate fetches
    if (state.loading) {
      return new Promise<LanguageResponse[]>((resolve) => {
        const unsub = useLanguagesStore.subscribe((s) => {
          if (!s.loading) {
            unsub()
            resolve(s.languages)
          }
        })
      })
    }
    set({ loading: true })
    try {
      const { data } = await languagesAPI.list()
      set({ languages: data, lastFetched: Date.now(), loading: false })
      return data
    } catch {
      set({ loading: false })
      return state.languages
    }
  },

  invalidate: () => {
    set({ lastFetched: null })
  },

  reset: () => {
    set({ languages: [], loading: false, lastFetched: null })
  },

  getLanguageName: (langId: string) => {
    const lang = get().languages.find((l) => l.id === langId)
    return lang ? `${lang.name} (${lang.code})` : langId
  },
}))
