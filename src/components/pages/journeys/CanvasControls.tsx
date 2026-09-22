import { Maximize, Minus, Plus } from "lucide-react"

interface CanvasControlsProps {
  zoomPct: string
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFit: () => void
}

const CONTROL_BTN =
  "flex h-[1.875rem] w-[1.875rem] cursor-pointer items-center justify-center rounded-[0.5rem] text-fg-muted transition-colors hover:bg-muted hover:text-fg-strong"

export function CanvasControls({
  zoomPct,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFit,
}: CanvasControlsProps) {
  return (
    <>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-0.5 rounded-[0.75rem] border border-line bg-elevated p-1 shadow-[var(--shadow-md)]"
      >
        <button onClick={onZoomOut} title="Zoom out (−)" aria-label="Zoom out" className={CONTROL_BTN}>
          <Minus className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={2} />
        </button>
        <button
          onClick={onResetZoom}
          title="Reset zoom to 100%"
          className="min-w-[2.75rem] cursor-pointer rounded-[0.5rem] px-0.5 py-[0.4375rem] text-center font-mono text-[0.6875rem] font-semibold text-fg-muted transition-colors hover:bg-muted hover:text-fg-strong"
        >
          {zoomPct}
        </button>
        <button onClick={onZoomIn} title="Zoom in (+)" aria-label="Zoom in" className={CONTROL_BTN}>
          <Plus className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={2} />
        </button>
        <span className="mx-[0.1875rem] h-[1.125rem] w-px bg-line" />
        <button onClick={onFit} title="Fit view (0)" aria-label="Fit view" className={CONTROL_BTN}>
          <Maximize className="h-[0.9375rem] w-[0.9375rem]" strokeWidth={2} />
        </button>
      </div>
      <span className="pointer-events-none absolute bottom-[3.75rem] left-4 z-20 rounded-[0.5rem] bg-canvas/80 px-2 py-[0.1875rem] text-[0.65625rem] text-fg-subtle">
        Drag to pan · Ctrl + scroll to zoom
      </span>
    </>
  )
}
