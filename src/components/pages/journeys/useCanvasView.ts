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
  mainRef: React.RefObject<HTMLDivElement | null>
  worldW: number
  worldH: number
  fitPadding: number
  keysEnabled: boolean
  onClear: () => void
  onEscape: () => void
}

export function useCanvasView({
  mainRef,
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
  const worldRef = useRef({ worldW, worldH, fitPadding })
  const clearRef = useRef(onClear)
  const escapeRef = useRef(onEscape)
  const keysRef = useRef(keysEnabled)

  useEffect(() => {
    viewRef.current = view
    worldRef.current = { worldW, worldH, fitPadding }
    clearRef.current = onClear
    escapeRef.current = onEscape
    keysRef.current = keysEnabled
  })

  const fit = useCallback(() => {
    const el = mainRef.current
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
  }, [mainRef])

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
    const el = mainRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0022))
      } else {
        setView((v) => ({ ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomAt, mainRef])

  useEffect(() => {
    const onResize = () => {
      const el = mainRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setView((v) =>
        Math.abs(r.width - v.cw) > 1 || Math.abs(r.height - v.ch) > 1
          ? { ...v, cw: r.width, ch: r.height }
          : v,
      )
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [mainRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!keysRef.current) return
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
