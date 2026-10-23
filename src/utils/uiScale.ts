import { useSyncExternalStore } from "react"

/**
 * Where the sidebar stops being a drawer: Tailwind's own `lg`, in rem so it follows the
 * browser's default font size the way the `lg:` classes do. A media query can't read a CSS
 * variable, so this is the one place JS spells it out.
 */
export const REGULAR_WIDTH_QUERY = "(min-width: 64rem)"

function uiScale(): number {
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  )
  return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize / 16 : 1
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

// The Journey Builder renders on every pan frame, and getComputedStyle there would force a
// style recalc per frame; the root size (index.css) only moves when the window width does.
let cached: { width: number; scale: number } | null = null

function snapshot(): number {
  const width = window.innerWidth
  if (cached?.width !== width) cached = { width, scale: uiScale() }
  return cached.scale
}

/**
 * The interface scale (root font size / 16). index.css grows the root with the window above
 * 1440px, so a value read once goes stale when the window is resized.
 */
export function useUiScale(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 1)
}
