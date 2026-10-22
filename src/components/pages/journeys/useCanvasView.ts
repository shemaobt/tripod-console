import { useCallback, useEffect, useRef, useState } from "react"

const MIN_K = 0.25
const MAX_K = 2

export interface CanvasViewState {
  k: number
  tx: number
  ty: number
  cw: number
  ch: number
  panning: boolean
}

interface UseCanvasViewOptions {
  container: HTMLDivElement | null
  worldW: number
  worldH: number
  fitPadding: number
  keysEnabled: boolean
  onClear: () => void
  onEscape: () => void
}

export function useCanvasView({
  container,
  worldW,
  worldH,
  fitPadding,
  keysEnabled,
  onClear,
  onEscape,
}: UseCanvasViewOptions) {
  const [view, setView] = useState<CanvasViewState>({
    k: 0.6,
    tx: 60,
    ty: 60,
    cw: 1280,
    ch: 720,
    panning: false,
  })

  const viewRef = useRef(view)
  const containerRef = useRef(container)
  const worldRef = useRef({ worldW, worldH, fitPadding })
  const clearRef = useRef(onClear)
  const escapeRef = useRef(onEscape)
  const keysRef = useRef(keysEnabled)

  useEffect(() => {
    viewRef.current = view
    containerRef.current = container
    worldRef.current = { worldW, worldH, fitPadding }
    clearRef.current = onClear
    escapeRef.current = onEscape
    keysRef.current = keysEnabled
  })

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const { worldW: ww, worldH: wh, fitPadding: pad } = worldRef.current
    let k = Math.min((r.width - pad * 2) / ww, (r.height - pad * 2) / wh, 1)
    k = Math.max(k, MIN_K)
    setView((v) => ({
      ...v,
      cw: r.width,
      ch: r.height,
      k,
      tx: (r.width - ww * k) / 2,
      ty: (r.height - wh * k) / 2,
    }))
  }, [])

  const zoomAt = useCallback((px: number, py: number, f: number) => {
    setView((v) => {
      const k2 = Math.min(MAX_K, Math.max(MIN_K, v.k * f))
      return {
        ...v,
        k: k2,
        tx: px - ((px - v.tx) * k2) / v.k,
        ty: py - ((py - v.ty) * k2) / v.k,
      }
    })
  }, [])

  const zoomCenter = useCallback((f: number) => {
    setView((v) => {
      const k2 = Math.min(MAX_K, Math.max(MIN_K, v.k * f))
      const px = v.cw / 2
      const py = v.ch / 2
      return {
        ...v,
        k: k2,
        tx: px - ((px - v.tx) * k2) / v.k,
        ty: py - ((py - v.ty) * k2) / v.k,
      }
    })
  }, [])

  const zoomIn = useCallback(() => zoomCenter(1.25), [zoomCenter])
  const zoomOut = useCallback(() => zoomCenter(0.8), [zoomCenter])
  const resetZoom = useCallback(() => zoomCenter(1 / viewRef.current.k), [zoomCenter])

  const centerAt = useCallback((wx: number, wy: number) => {
    setView((v) => ({ ...v, tx: v.cw / 2 - wx * v.k, ty: v.ch / 2 - wy * v.k }))
  }, [])

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    const startTx = viewRef.current.tx
    const startTy = viewRef.current.ty
    let moved = false
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - sx
      const dy = ev.clientY - sy
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) {
        moved = true
        setView((v) => ({ ...v, panning: true }))
      }
      if (moved) {
        setView((v) => ({ ...v, tx: startTx + dx, ty: startTy + dy }))
      }
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      if (moved) {
        setView((v) => ({ ...v, panning: false }))
      } else {
        clearRef.current()
      }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [])

  useEffect(() => {
    if (!container) return
    const onWheel = (e: WheelEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-canvas-ui]")) return
      e.preventDefault()
      const r = container.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0022))
      } else {
        setView((v) => ({ ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY }))
      }
    }
    container.addEventListener("wheel", onWheel, { passive: false })
    return () => container.removeEventListener("wheel", onWheel)
  }, [container, zoomAt])

  // Touch: one finger pans, two fingers pinch-zoom around their midpoint. The mouse path
  // above can't serve a finger — a browser only turns a tap into mouse events, never a drag —
  // so without this the graph couldn't be moved on a phone or an iPad. A tap still reaches
  // the mouse handlers (node select, background clear) through those compatibility events.
  // Every finger added or lifted re-baselines from the current view, so 2 → 1 keeps panning.
  useEffect(() => {
    if (!container) return
    let base: { view: CanvasViewState; x: number; y: number; dist: number; moved: boolean } | null = null
    const read = (e: TouchEvent) => {
      const r = container.getBoundingClientRect()
      const [a, b] = [e.touches[0], e.touches[1]]
      if (!b) return { x: a.clientX - r.left, y: a.clientY - r.top, dist: 0 }
      return {
        x: (a.clientX + b.clientX) / 2 - r.left,
        y: (a.clientY + b.clientY) / 2 - r.top,
        dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      }
    }
    const rebase = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        if (base?.moved) setView((v) => ({ ...v, panning: false }))
        base = null
        return
      }
      if (!base) return
      base = { view: viewRef.current, ...read(e), moved: base.moved }
    }
    const onStart = (e: TouchEvent) => {
      // a gesture starts on the graph, not on the controls; a second finger joins it anywhere
      if (!base && e.target instanceof Element && e.target.closest("[data-canvas-ui]")) return
      base = { view: viewRef.current, ...read(e), moved: base?.moved ?? false }
    }
    const onMove = (e: TouchEvent) => {
      if (!base) return
      const now = read(e)
      if (!base.moved && !now.dist && Math.abs(now.x - base.x) + Math.abs(now.y - base.y) <= 4) return
      base.moved = true
      const { view: v0, x, y, dist } = base
      const k = Math.min(MAX_K, Math.max(MIN_K, dist && now.dist ? v0.k * (now.dist / dist) : v0.k))
      // the world point that was under the fingers stays under them
      const wx = (x - v0.tx) / v0.k
      const wy = (y - v0.ty) / v0.k
      setView((v) => ({ ...v, panning: true, k, tx: now.x - wx * k, ty: now.y - wy * k }))
    }
    container.addEventListener("touchstart", onStart, { passive: true })
    container.addEventListener("touchmove", onMove, { passive: true })
    container.addEventListener("touchend", rebase)
    container.addEventListener("touchcancel", rebase)
    return () => {
      container.removeEventListener("touchstart", onStart)
      container.removeEventListener("touchmove", onMove)
      container.removeEventListener("touchend", rebase)
      container.removeEventListener("touchcancel", rebase)
    }
  }, [container])

  useEffect(() => {
    if (!container) return
    const measure = () => {
      const r = container.getBoundingClientRect()
      setView((v) =>
        Math.abs(r.width - v.cw) > 1 || Math.abs(r.height - v.ch) > 1
          ? { ...v, cw: r.width, ch: r.height }
          : v,
      )
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [container])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!keysRef.current) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "Escape") {
        escapeRef.current()
        return
      }
      if (e.key === "+" || e.key === "=") zoomCenter(1.25)
      else if (e.key === "-") zoomCenter(0.8)
      else if (e.key === "0") fit()
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomCenter, fit])

  return {
    view,
    fit,
    zoomIn,
    zoomOut,
    resetZoom,
    centerAt,
    onCanvasMouseDown,
  }
}
