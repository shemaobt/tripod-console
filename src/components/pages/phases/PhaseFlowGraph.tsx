import { useMemo, useCallback, useRef, useState, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import type { PhaseResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"

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
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "\u2026" : text
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

  // Fit to container on mount / phase change
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

  return (
    <div className="relative rounded-lg border border-areia/20 bg-surface-alt/20 overflow-hidden" style={{ minHeight }}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-surface/90 backdrop-blur-sm rounded-lg border border-areia/20 shadow-sm p-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <span className="text-[10px] font-mono text-verde/60 w-10 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-areia/20" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleFitView}
          title="Fit to view"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn("w-full h-full", isPanning ? "cursor-grabbing" : "cursor-grab")}
        style={{ minHeight }}
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
          style={{
            minHeight,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#C5C29F" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#BE4A01" />
              </marker>
              <filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0A0703" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Edges */}
            {edges.map((edge) => (
              <path
                key={edge.key}
                d={edge.path}
                fill="none"
                stroke={edge.highlighted ? "#BE4A01" : "#C5C29F"}
                strokeWidth={edge.highlighted ? 2.5 : 1.5}
                strokeDasharray={edge.highlighted ? undefined : "6 3"}
                markerEnd={
                  edge.highlighted
                    ? "url(#arrowhead-active)"
                    : "url(#arrowhead)"
                }
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />
            ))}

            {/* Nodes */}
            {phases.map((phase) => {
              const pos = positions.get(phase.id)
              if (!pos) return null
              const isSelected = selectedPhaseId === phase.id
              const isDep = selectedDeps.has(phase.id)
              const depCount = dependentCount.get(phase.id) ?? 0

              const strokeColor = isSelected
                ? "#BE4A01"
                : isDep
                  ? "#BE4A0180"
                  : "#C5C29F80"

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
                    rx={10}
                    ry={10}
                    fill={isSelected ? "#FFFFFF" : "#F3F2EB"}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    filter="url(#nodeShadow)"
                  />
                  {/* Name */}
                  <text
                    x={pos.x + NODE_WIDTH / 2}
                    y={pos.y + 26}
                    textAnchor="middle"
                    fill="#0A0703"
                    fontSize={13}
                    fontWeight={600}
                  >
                    {truncateText(phase.name, 22)}
                  </text>
                  {/* Subtitle */}
                  <text
                    x={pos.x + NODE_WIDTH / 2}
                    y={pos.y + 44}
                    textAnchor="middle"
                    fill={depCount > 0 ? "#3F3E2099" : "#C5C29F"}
                    fontSize={10}
                    fontWeight={400}
                  >
                    {depCount > 0
                      ? `${depCount} dependent${depCount !== 1 ? "s" : ""}`
                      : "no dependents"}
                  </text>
                  {/* Selected indicator dot */}
                  {isSelected && (
                    <circle
                      cx={pos.x + NODE_WIDTH - 12}
                      cy={pos.y + 12}
                      r={4}
                      fill="#BE4A01"
                    />
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Help hint */}
      <div className="absolute bottom-2 left-3 text-[10px] text-verde/40 select-none pointer-events-none">
        Scroll to zoom · Drag to pan · Click node to select
      </div>
    </div>
  )
}
