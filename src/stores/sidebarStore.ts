import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarStore {
  collapsed: boolean
  toggle(): void
  setCollapsed(collapsed: boolean): void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle() {
        set((state) => ({ collapsed: !state.collapsed }))
      },
      setCollapsed(collapsed: boolean) {
        set({ collapsed })
      },
    }),
    { name: "tc_sidebar" }
  )
)
