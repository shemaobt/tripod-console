import { create } from "zustand"
import { persist } from "zustand/middleware"

interface OnboardingStore {
  dismissedSpotlights: string[]
  dismiss(featureKey: string): void
  isDismissed(featureKey: string): boolean
  resetAll(): void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      dismissedSpotlights: [],
      dismiss(featureKey: string) {
        set((state) => ({
          dismissedSpotlights: [...state.dismissedSpotlights, featureKey],
        }))
      },
      isDismissed(featureKey: string) {
        return get().dismissedSpotlights.includes(featureKey)
      },
      resetAll() {
        set({ dismissedSpotlights: [] })
      },
    }),
    { name: "tc_onboarding" }
  )
)
