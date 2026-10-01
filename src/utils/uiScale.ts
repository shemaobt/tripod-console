export function uiScale(): number {
  if (typeof window === "undefined") return 1
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  )
  return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize / 16 : 1
}
