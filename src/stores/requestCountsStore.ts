import { create } from "zustand"
import { accessRequestsAPI, changeRequestsAPI, publicRequestsAPI } from "@/services/api"

export interface PendingRequestCounts {
  access: number
  languageChanges: number
  projectChanges: number
}

interface RequestCountsStore {
  counts: PendingRequestCounts
  loading: boolean
  lastFetched: number | null
  fetch: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

const CACHE_TTL = 60 * 1000
const EMPTY: PendingRequestCounts = { access: 0, languageChanges: 0, projectChanges: 0 }

export const useRequestCountsStore = create<RequestCountsStore>((set, get) => ({
  counts: EMPTY,
  loading: false,
  lastFetched: null,

  fetch: async () => {
    const state = get()
    if (state.loading) return
    if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) return
    await get().refresh()
  },

  refresh: async () => {
    set({ loading: true })
    const [access, changes, publics] = await Promise.all([
      accessRequestsAPI
        .list({ status: "pending" })
        .then((r) => r.data)
        .catch(() => []),
      changeRequestsAPI
        .list({ status: "pending" })
        .then((r) => r.data)
        .catch(() => []),
      publicRequestsAPI
        .list({ status: "pending" })
        .then((r) => r.data)
        .catch(() => []),
    ])
    const merged = [
      ...changes.map((r) => r.kind),
      ...publics.map((r) => r.kind),
    ]
    set({
      counts: {
        access: access.length,
        languageChanges: merged.filter((kind) => kind !== "create_project").length,
        projectChanges: merged.filter((kind) => kind === "create_project").length,
      },
      loading: false,
      lastFetched: Date.now(),
    })
  },

  reset: () => {
    set({ counts: EMPTY, loading: false, lastFetched: null })
  },
}))
