import type { DerivedPhaseStatus, PhaseResponse, PhaseStatus } from "@/types"
import { cn } from "@/utils/cn"
import type { CanvasViewState } from "./useCanvasView"
import type { JourneyLayout } from "./layout"
import { JourneyEdges } from "./JourneyEdges"
import { PhaseNode } from "./PhaseNode"
import type { CategoryVisual } from "./useJourneyBuilder"

interface JourneyCanvasProps {
  phases: PhaseResponse[]
  deps: Record<string, string[]>
  layout: JourneyLayout
  scale: number
  view: CanvasViewState
  stepNums: Record<string, string>
  chain: Set<string> | null
  selectedId: string | null
  hoverId: string | null
  isAdmin: boolean
  showEmpty: boolean
  categoryFor: (categoryId: string | null) => CategoryVisual
  storedStatus: (phaseId: string) => PhaseStatus
  derivedStatus: (phaseId: string) => DerivedPhaseStatus
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onCanvasMouseDown: (e: React.MouseEvent) => void
}

export function JourneyCanvas({
  phases,
  deps,
  layout,
  scale,
  view,
  stepNums,
  chain,
  selectedId,
  hoverId,
  isAdmin,
  showEmpty,
  categoryFor,
  storedStatus,
  derivedStatus,
  onSelect,
  onHover,
  onCanvasMouseDown,
}: JourneyCanvasProps) {
  return (
    <div
      role="application"
      aria-label="Journey graph. Drag to pan, Ctrl and scroll to zoom."
      onMouseDown={onCanvasMouseDown}
      className={cn(
        "absolute inset-0 overflow-hidden",
        view.panning ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})` }}
      >
        <div
          className="absolute"
          style={{
            left: -3000 * scale,
            top: -3000 * scale,
            width: layout.worldW + 6000 * scale,
            height: layout.worldH + 6000 * scale,
            backgroundImage: `radial-gradient(rgba(63,62,32,0.085) ${1.1 * scale}px, transparent ${1.3 * scale}px)`,
            backgroundSize: `${30 * scale}px ${30 * scale}px`,
          }}
        />
        <JourneyEdges
          phases={phases}
          deps={deps}
          layout={layout}
          scale={scale}
          hoverId={hoverId}
          chain={chain}
          storedStatus={storedStatus}
          derivedStatus={derivedStatus}
        />
        {phases.map((phase) => {
          const pos = layout.pos[phase.id]
          if (!pos) return null
          return (
            <PhaseNode
              key={phase.id}
              phase={phase}
              x={pos.x}
              y={pos.y}
              step={stepNums[phase.id]}
              cat={categoryFor(phase.category_id)}
              derived={derivedStatus(phase.id)}
              cancelled={storedStatus(phase.id) === "cancelled"}
              selected={selectedId === phase.id}
              hovered={hoverId === phase.id}
              onSelect={onSelect}
              onHover={onHover}
            />
          )
        })}
      </div>

      {showEmpty && (
        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 rounded-[1.125rem] border border-line bg-elevated px-[1.875rem] py-6 text-center shadow-[var(--shadow-md)]">
          <span className="text-sm font-semibold text-fg-strong">
            This journey has no phases yet
          </span>
          {isAdmin ? (
            <span className="text-[0.78125rem] text-fg-muted">
              Use “Add phase” to start building the trail.
            </span>
          ) : (
            <span className="text-[0.78125rem] text-fg-muted">
              A platform admin still needs to build this trail.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
