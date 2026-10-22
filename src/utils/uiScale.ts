import { useSyncExternalStore } from "react"

/**
 * The width where the interface scale changes (index.css: 100% below it, 82.8% from it on)
 * and where the sidebar stops being a drawer. Same number as `--breakpoint-lg`; a media
 * query can't read a CSS variable, so this is the one place JS spells it out.
 */
export const REGULAR_WIDTH_QUERY = "(min-width: 848px)"

export function uiScale(): number {
  if (typeof window === "undefined") return 1
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  )
  return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize / 16 : 1
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REGULAR_WIDTH_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/**
 * `uiScale()` that follows the window: the scale depends on the width, so a value read
 * once goes stale when an iPad leaves Split View or a desktop window is narrowed past lg.
 */
export function useUiScale(): number {
  return useSyncExternalStore(subscribe, uiScale, () => 1)
}
