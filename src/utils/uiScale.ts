import { useSyncExternalStore } from "react"

/**
 * The width where the interface scale changes (index.css: 100% below it, 82.8% from it on)
 * and where the sidebar stops being a drawer. Same number as `--breakpoint-lg`; a media
 * query can't read a CSS variable, so this is the one place JS spells it out.
 */
export const REGULAR_WIDTH_QUERY = "(min-width: 848px)"

function uiScale(): number {
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

// The Journey Builder renders on every pan frame, and getComputedStyle there would force a
// style recalc per frame; the root size only moves when the width crosses the query.
let cached: { regular: boolean; scale: number } | null = null

function snapshot(): number {
  const regular = window.matchMedia(REGULAR_WIDTH_QUERY).matches
  if (cached?.regular !== regular) cached = { regular, scale: uiScale() }
  return cached.scale
}

/**
 * The interface scale (root font size / 16), following the window: it depends on the width,
 * so a value read once goes stale when an iPad leaves Split View or a window narrows past lg.
 */
export function useUiScale(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 1)
}
