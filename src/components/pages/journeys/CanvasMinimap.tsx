import type { PhaseResponse, PhaseStatus } from "@/types"
import type { CanvasViewState } from "./useCanvasView"
import type { JourneyLayout } from "./layout"
import type { CategoryVisual } from "./useJourneyBuilder"

interface CanvasMinimapProps {
  phases: PhaseResponse[]
  layout: JourneyLayout
  scale: number
  view: CanvasViewState
  categoryFor: (categoryId: string | null) => CategoryVisual
  storedStatus: (phaseId: string) => PhaseStatus
  onCenter: (wx: number, wy: number) => void
}

export function CanvasMinimap({
  phases,
  layout,
  scale,
  view,
  categoryFor,
  storedStatus,
  onCenter,
}: CanvasMinimapProps) {
  const mw = 184 * scale
  const mh = 112 * scale
  const mp = 6 * scale
  const ms = Math.min((mw - mp * 2) / layout.worldW, (mh - mp * 2) / layout.worldH)

  let vx = mp + (-view.tx / view.k) * ms
  let vy = mp + (-view.ty / view.k) * ms
  let vw = (view.cw / view.k) * ms
  let vh = (view.ch / view.k) * ms
  vx = Math.max(0, Math.min(vx, mw - 4 * scale))
  vy = Math.max(0, Math.min(vy, mh - 4 * scale))
  vw = Math.max(6 * scale, Math.min(vw, mw - vx))
  vh = Math.max(6 * scale, Math.min(vh, mh - vy))

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    onCenter((e.clientX - r.left - mp) / ms, (e.clientY - r.top - mp) / ms)
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute bottom-3.5 right-3.5 z-20 rounded-[0.75rem] border border-line bg-elevated p-1.5 shadow-[var(--shadow-md)]"
    >
      <svg
        width={mw}
        height={mh}
        onMouseDown={onMouseDown}
        className="block cursor-pointer rounded-[0.5rem] bg-muted"
      >
        {phases.map((phase) => {
          const pos = layout.pos[phase.id]
          if (!pos) return null
          return (
            <rect
              key={phase.id}
              x={mp + pos.x * ms}
              y={mp + pos.y * ms}
              width={Math.max(4 * scale, layout.nodeW * ms)}
              height={Math.max(3 * scale, layout.nodeH * ms)}
              rx={2 * scale}
              fill={categoryFor(phase.category_id).color}
              opacity={storedStatus(phase.id) === "cancelled" ? 0.3 : 0.8}
            />
          )
        })}
        <rect
          x={vx}
          y={vy}
          width={vw}
          height={vh}
          fill="rgba(190,74,1,.07)"
          stroke="#BE4A01"
          strokeWidth={1.5 * scale}
          rx={3 * scale}
        />
      </svg>
    </div>
  )
}
