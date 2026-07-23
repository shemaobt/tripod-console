import { useMemo, useCallback, useRef, useState, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import type { PhaseResponse } from "@/types"
import { cn } from "@/utils/cn"

const NODE_WIDTH = 180
const NODE_HEIGHT = 60
const COL_GAP = 100
const ROW_GAP = 32
const PADDING = 40

interface PhaseFlowGraphProps {
  phases: PhaseResponse[]
  dependencies: Map<string, string[]>
  selectedPhaseId: string | null
  onSelectPhase: (phaseId: string | null) => void
  minHeight?: number
}

function computeLayout(phases: PhaseResponse[], deps: Map<string, string[]>) {
  const depth = new Map<string, number>()

  function getDepth(id: string, visited: Set<string>): number {
    if (depth.has(id)) return depth.get(id)!
    if (visited.has(id)) return 0
    visited.add(id)
    const myDeps = deps.get(id) ?? []
    const d =
      myDeps.length === 0
        ? 0
        : Math.max(...myDeps.map((did) => getDepth(did, visited))) + 1
    depth.set(id, d)
    return d
  }

  phases.forEach((p) => getDepth(p.id, new Set()))

  const columns = new Map<number, PhaseResponse[]>()
  phases.forEach((p) => {
    const d = depth.get(p.id) ?? 0
    if (!columns.has(d)) columns.set(d, [])
    columns.get(d)!.push(p)
  })

  const positions = new Map<string, { x: number; y: number }>()
  const maxCol = columns.size > 0 ? Math.max(...columns.keys()) : 0

  let maxY = 0
  for (let col = 0; col <= maxCol; col++) {
    const items = columns.get(col) ?? []
    const totalHeight =
      items.length * NODE_HEIGHT + (items.length - 1) * ROW_GAP
    const startY = Math.max(0, (400 - totalHeight) / 2)
    items.forEach((phase, idx) => {
      const y = startY + idx * (NODE_HEIGHT + ROW_GAP) + PADDING
      positions.set(phase.id, {
        x: col * (NODE_WIDTH + COL_GAP) + PADDING,
        y,
      })
      maxY = Math.max(maxY, y + NODE_HEIGHT)
    })
  }

  const svgWidth = (maxCol + 1) * (NODE_WIDTH + COL_GAP) + PADDING * 2
  const svgHeight = Math.max(maxY + PADDING, 300)

  return { positions, svgWidth, svgHeight }
}

function truncateText(text: string, maxLen: number) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text
}

function buildEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const startX = from.x + NODE_WIDTH
  const startY = from.y + NODE_HEIGHT / 2
  const endX = to.x
  const endY = to.y + NODE_HEIGHT / 2
  const cpOffset = (endX - startX) * 0.4
  return `M ${startX} ${startY} C ${startX + cpOffset} ${startY}, ${endX - cpOffset} ${endY}, ${endX} ${endY}`
}

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.15

export function PhaseFlowGraph({
  phases,
  dependencies,
  selectedPhaseId,
  onSelectPhase,
  minHeight = 480,
}: PhaseFlowGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const { positions, svgWidth, svgHeight } = useMemo(
    () => computeLayout(phases, dependencies),
    [phases, dependencies],
  )

  useEffect(() => {
    if (!containerRef.current || phases.length === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = rect.width / svgWidth
    const scaleY = rect.height / svgHeight
    const fitZoom = Math.min(scaleX, scaleY, 1) * 0.9
    setZoom(Math.max(fitZoom, MIN_ZOOM))
    setPan({
      x: (rect.width - svgWidth * fitZoom) / 2,
      y: (rect.height - svgHeight * fitZoom) / 2,
    })
  }, [phases.length, svgWidth, svgHeight])

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta))
    const scale = newZoom / zoom

    setPan({
      x: mouseX - (mouseX - pan.x) * scale,
      y: mouseY - (mouseY - pan.y) * scale,
    })
    setZoom(newZoom)
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isPanning) return
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    })
  }

  function handleMouseUp() {
    setIsPanning(false)
  }

  function handleFitView() {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = rect.width / svgWidth
    const scaleY = rect.height / svgHeight
    const fitZoom = Math.min(scaleX, scaleY, 1) * 0.9
    setZoom(Math.max(fitZoom, MIN_ZOOM))
    setPan({
      x: (rect.width - svgWidth * fitZoom) / 2,
      y: (rect.height - svgHeight * fitZoom) / 2,
    })
  }

  const selectedDeps = useMemo(() => {
    if (!selectedPhaseId) return new Set<string>()
    return new Set(dependencies.get(selectedPhaseId) ?? [])
  }, [selectedPhaseId, dependencies])

  const connectedEdges = useMemo(() => {
    if (!selectedPhaseId) return new Set<string>()
    const edgeSet = new Set<string>()
    const myDeps = dependencies.get(selectedPhaseId) ?? []
    myDeps.forEach((depId) => edgeSet.add(`${depId}->${selectedPhaseId}`))
    for (const [phaseId, deps] of dependencies) {
      if (deps.includes(selectedPhaseId)) {
        edgeSet.add(`${selectedPhaseId}->${phaseId}`)
      }
    }
    return edgeSet
  }, [selectedPhaseId, dependencies])

  const dependentCount = useMemo(() => {
    const counts = new Map<string, number>()
    phases.forEach((p) => {
      let count = 0
      for (const [, deps] of dependencies) {
        if (deps.includes(p.id)) count++
      }
      counts.set(p.id, count)
    })
    return counts
  }, [phases, dependencies])

  const handleNodeClick = useCallback(
    (phaseId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onSelectPhase(selectedPhaseId === phaseId ? null : phaseId)
    },
    [selectedPhaseId, onSelectPhase],
  )

  const edges: Array<{
    key: string
    path: string
    highlighted: boolean
  }> = []

  for (const [phaseId, deps] of dependencies) {
    const toPos = positions.get(phaseId)
    if (!toPos) continue
    for (const depId of deps) {
      const fromPos = positions.get(depId)
      if (!fromPos) continue
      const key = `${depId}->${phaseId}`
      edges.push({
        key,
        path: buildEdgePath(fromPos, toPos),
        highlighted: connectedEdges.has(key),
      })
    }
  }

  const zoomBtn =
    "w-8 h-8 rounded-[0.625rem] bg-elevated shadow-[var(--shadow-md)] grid place-items-center text-fg-strong hover:bg-muted transition-colors"

  return (
    <div
      className="relative bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] overflow-hidden"
      style={{ height: minHeight }}
    >
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          className={zoomBtn}
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          title="Zoom in"
        >
          <ZoomIn className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={2} />
        </button>
        <button
          type="button"
          className={zoomBtn}
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          title="Zoom out"
        >
          <ZoomOut className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={2} />
        </button>
        <button type="button" className={zoomBtn} onClick={handleFitView} title="Fit to view">
          <Maximize2 className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={2} />
        </button>
      </div>

      <div
        ref={containerRef}
        className={cn("w-full h-full", isPanning ? "cursor-grabbing" : "cursor-grab")}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => onSelectPhase(null)}
      >
        <svg
          width="100%"
          height="100%"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
              >
                <path d="M 0 1 L 8.5 4.5 L 0 8 z" style={{ fill: "var(--edge)" }} />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
              >
                <path
                  d="M 0 1 L 8.5 4.5 L 0 8 z"
                  style={{ fill: "var(--color-accent)" }}
                />
              </marker>
              <filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0A0703" floodOpacity="0.08" />
              </filter>
            </defs>

            {edges.map((edge) => (
              <path
                key={edge.key}
                d={edge.path}
                fill="none"
                strokeWidth={edge.highlighted ? 2.5 : 1.5}
                markerEnd={
                  edge.highlighted
                    ? "url(#arrowhead-active)"
                    : "url(#arrowhead)"
                }
                style={{
                  stroke: edge.highlighted ? "var(--color-accent)" : "var(--edge)",
                  transition: "stroke 0.2s, stroke-width 0.2s",
                }}
              />
            ))}

            {phases.map((phase) => {
              const pos = positions.get(phase.id)
              if (!pos) return null
              const isSelected = selectedPhaseId === phase.id
              const isDep = selectedDeps.has(phase.id)
              const depCount = dependentCount.get(phase.id) ?? 0

              const strokeVar =
                isSelected || isDep
                  ? "var(--color-accent)"
                  : "var(--color-input-border)"

              return (
                <g
                  key={phase.id}
                  className="cursor-pointer"
                  onClick={(e) => handleNodeClick(phase.id, e)}
                  style={{ transition: "opacity 0.2s" }}
                >
                  <title>{phase.description || "No description"}</title>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={13}
                    ry={13}
                    strokeWidth={isSelected ? 2.5 : isDep ? 1.75 : 1.25}
                    filter="url(#nodeShadow)"
                    style={{ fill: "var(--color-elevated)", stroke: strokeVar }}
                  />
                  <text
                    x={pos.x + NODE_WIDTH / 2}
                    y={pos.y + 26}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={600}
                    style={{ fill: "var(--color-fg-strong)" }}
                  >
                    {truncateText(phase.name, 22)}
                  </text>
                  <text
                    x={pos.x + NODE_WIDTH / 2}
                    y={pos.y + 44}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={400}
                    style={{ fill: "var(--color-fg-subtle)" }}
                  >
                    {depCount > 0
                      ? `${depCount} dependent${depCount !== 1 ? "s" : ""}`
                      : "no dependents"}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <span className="absolute left-[0.875rem] bottom-3 z-10 text-[0.6875rem] text-fg-subtle pointer-events-none select-none">
        Drag to pan &middot; scroll to zoom &middot; click a phase to inspect &middot; phases in the same column can run in parallel
      </span>
    </div>
  )
}
