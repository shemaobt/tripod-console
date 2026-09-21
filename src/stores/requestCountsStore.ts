import { create } from "zustand"
import { toast } from "sonner"
import { accessRequestsAPI, changeRequestsAPI, publicRequestsAPI } from "@/services/api"

export interface PendingRequestCounts {
  access: number
  languageChanges: number
  projectChanges: number
}

interface RequestCountsStore {
  counts: PendingRequestCounts
  loading: boolean
  failed: boolean
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
  failed: false,
  lastFetched: null,

  fetch: async () => {
    const state = get()
    if (state.loading) return
    if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) return
    await get().refresh()
  },

  refresh: async () => {
    set({ loading: true })
    const [access, changes, publics] = await Promise.allSettled([
      accessRequestsAPI.list({ status: "pending" }),
      changeRequestsAPI.list({ status: "pending" }),
      publicRequestsAPI.list({ status: "pending" }),
    ])

    if (
      access.status === "rejected" ||
      changes.status === "rejected" ||
      publics.status === "rejected"
    ) {
      const wasFailed = get().failed
      set({ loading: false, failed: true })
      if (!wasFailed) toast.error("Failed to load pending request counts")
      return
    }

    const merged = [
      ...changes.value.data.map((r) => r.kind),
      ...publics.value.data.map((r) => r.kind),
    ]
    set({
      counts: {
        access: access.value.data.length,
        languageChanges: merged.filter((kind) => kind !== "create_project").length,
        projectChanges: merged.filter((kind) => kind === "create_project").length,
      },
      loading: false,
      failed: false,
      lastFetched: Date.now(),
    })
  },

  reset: () => {
    set({ counts: EMPTY, loading: false, failed: false, lastFetched: null })
  },
}))
