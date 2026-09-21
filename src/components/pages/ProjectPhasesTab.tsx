import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Check, GitBranch } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { PHASE_STATUSES } from "@/types"
import type { PhaseStatus, ProjectPhaseResponse } from "@/types"
import { PHASE_STATUS_CONFIG } from "@/constants/phaseStatus"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"

const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const H_GAP = 60
const V_GAP = 40

interface LayoutNode {
  phaseId: string
  name: string
  status: PhaseStatus
  col: number
  row: number
  x: number
  y: number
}

interface LayoutEdge {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

function buildLayout(
  phases: ProjectPhaseResponse[],
  deps: Map<string, string[]>,
): { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number; height: number } {
  const phaseIds = new Set(phases.map((p) => p.phase_id))
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  for (const p of phases) {
    inDegree.set(p.phase_id, 0)
    adjList.set(p.phase_id, [])
  }

  for (const p of phases) {
    const phaseDeps = deps.get(p.phase_id) ?? []
    for (const depId of phaseDeps) {
      if (phaseIds.has(depId)) {
        adjList.get(depId)!.push(p.phase_id)
        inDegree.set(p.phase_id, (inDegree.get(p.phase_id) ?? 0) + 1)
      }
    }
  }

  const columns: string[][] = []
  const remaining = new Set(phaseIds)
  const assigned = new Set<string>()

  while (remaining.size > 0) {
    const col: string[] = []
    for (const id of remaining) {
      if ((inDegree.get(id) ?? 0) === 0) {
        col.push(id)
      }
    }
    if (col.length === 0) {
      for (const id of remaining) col.push(id)
      remaining.clear()
    }
    for (const id of col) {
      remaining.delete(id)
      assigned.add(id)
      for (const neighbor of adjList.get(id) ?? []) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) - 1)
      }
    }
    columns.push(col)
  }

  const phaseMap = new Map(phases.map((p) => [p.phase_id, p]))
  const nodePositions = new Map<string, LayoutNode>()
  const nodes: LayoutNode[] = []

  for (let col = 0; col < columns.length; col++) {
    for (let row = 0; row < columns[col].length; row++) {
      const id = columns[col][row]
      const phase = phaseMap.get(id)!
      const x = col * (NODE_WIDTH + H_GAP) + 20
      const y = row * (NODE_HEIGHT + V_GAP) + 20
      const node: LayoutNode = {
        phaseId: id,
        name: phase.phase_name,
        status: phase.status,
        col,
        row,
        x,
        y,
      }
      nodes.push(node)
      nodePositions.set(id, node)
    }
  }

  const edges: LayoutEdge[] = []
  for (const p of phases) {
    const phaseDeps = deps.get(p.phase_id) ?? []
    for (const depId of phaseDeps) {
      const from = nodePositions.get(depId)
      const to = nodePositions.get(p.phase_id)
      if (from && to) {
        edges.push({
          fromX: from.x + NODE_WIDTH,
          fromY: from.y + NODE_HEIGHT / 2,
          toX: to.x,
          toY: to.y + NODE_HEIGHT / 2,
        })
      }
    }
  }

  const maxCol = columns.length
  const maxRow = Math.max(...columns.map((c) => c.length), 1)
  const width = maxCol * (NODE_WIDTH + H_GAP) + 40
  const height = maxRow * (NODE_HEIGHT + V_GAP) + 40

  return { nodes, edges, width, height }
}

function PhaseNode({
  node,
  onStatusClick,
}: {
  node: LayoutNode
  onStatusClick: (node: LayoutNode) => void
}) {
  const config = PHASE_STATUS_CONFIG[node.status]

  return (
    <g>
      <foreignObject x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={cn(
            "h-full rounded-[0.8125rem] border-[0.09375rem] border-input-border bg-elevated shadow-[var(--shadow-card)] ring-1 px-3 py-2 flex flex-col justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-line-strong",
            config.ring,
          )}
          onClick={() => onStatusClick(node)}
        >
          <p className="text-[0.8125rem] font-semibold text-fg-strong truncate">{node.name}</p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
              config.pill,
            )}
          >
            <span className={cn("w-[0.4375rem] h-[0.4375rem] rounded-full shrink-0", config.dot)} />
            {config.label}
          </span>
        </div>
      </foreignObject>
    </g>
  )
}

function PhaseEdge({ edge }: { edge: LayoutEdge }) {
  const midX = (edge.fromX + edge.toX) / 2
  return (
    <path
      d={`M ${edge.fromX} ${edge.fromY} C ${midX} ${edge.fromY}, ${midX} ${edge.toY}, ${edge.toX} ${edge.toY}`}
      fill="none"
      stroke="var(--edge)"
      strokeWidth={1.5}
      markerEnd="url(#arrowhead)"
    />
  )
}

function StatusPopover({
  node,
  open,
  onClose,
  onSelect,
  anchorRef,
}: {
  node: LayoutNode | null
  open: boolean
  onClose: () => void
  onSelect: (phaseId: string, status: PhaseStatus) => void
  anchorRef: React.RefObject<HTMLDivElement>
}) {
  if (!node || !open) return null

  return (
    <Popover open={open} onOpenChange={(o) => !o && onClose()}>
      <PopoverTrigger asChild>
        <div ref={anchorRef} className="absolute" style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT, pointerEvents: "none" }} />
      </PopoverTrigger>
      <PopoverContent side="right" className="w-48 p-2">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-subtle mb-2 px-2">
          Update Status
        </p>
        <div className="space-y-0.5">
          {PHASE_STATUSES.map((status) => {
            const config = PHASE_STATUS_CONFIG[status]
            const StatusIcon = config.icon
            const isActive = node.status === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => onSelect(node.phaseId, status)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-[0.625rem] text-sm transition-colors text-left",
                  isActive
                    ? "bg-accent-soft text-on-accent-soft font-semibold"
                    : "hover:bg-muted text-fg",
                )}
              >
                <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", status === "in_progress" && "animate-spin")} />
                {config.label}
                {isActive && <Check className="h-3.5 w-3.5 ml-auto text-accent" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ProjectPhasesTab({ projectId }: { projectId: string }) {
  const [phases, setPhases] = useState<ProjectPhaseResponse[]>([])
  const [deps, setDeps] = useState<Map<string, string[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [statusNode, setStatusNode] = useState<LayoutNode | null>(null)
  const statusAnchorRef = useRef<HTMLDivElement>(null)

  const fetchPhases = useCallback(async () => {
    try {
      const { data } = await projectsAPI.listPhasesWithDeps(projectId)
      setPhases(data.phases)
      const depMap = new Map<string, string[]>()
      for (const [phaseId, depIds] of Object.entries(data.dependencies)) {
        depMap.set(phaseId, depIds)
      }
      setDeps(depMap)
    } catch {
      toast.error("Failed to load project phases")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPhases()
  }, [fetchPhases])

  const layout = useMemo(() => buildLayout(phases, deps), [phases, deps])

  async function handleStatusUpdate(phaseId: string, status: PhaseStatus) {
    setStatusNode(null)
    try {
      const { data: updated } = await projectsAPI.updatePhaseStatus(projectId, phaseId, status)
      setPhases((prev) => prev.map((p) => (p.phase_id === phaseId ? updated : p)))
      toast.success(`Phase status updated to ${PHASE_STATUS_CONFIG[status].label}`)
    } catch {
      toast.error("Failed to update phase status")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center text-[0.96875rem] font-semibold text-fg-strong">
        Phases
        <InfoTooltip content="Every phase defined by a platform admin applies to all projects. Set each phase's status to track this project's progress." />
      </h3>

      {phases.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No phases defined yet"
          description="Phases and their dependencies are defined by a platform admin and apply to every project. Once created, they appear here and you can track this project's progress by setting each phase's status."
        />
      ) : (
        <div className="space-y-2.5">
          <div className={cn(card.base, "relative overflow-x-auto p-2.5")}>
            <svg
              width={Math.max(layout.width, 400)}
              height={Math.max(layout.height, 120)}
              className="min-w-full"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="var(--edge)" />
                </marker>
              </defs>
              {layout.edges.map((edge, i) => (
                <PhaseEdge key={i} edge={edge} />
              ))}
              {layout.nodes.map((node) => (
                <PhaseNode
                  key={node.phaseId}
                  node={node}
                  onStatusClick={setStatusNode}
                />
              ))}
            </svg>
            <StatusPopover
              node={statusNode}
              open={statusNode !== null}
              onClose={() => setStatusNode(null)}
              onSelect={handleStatusUpdate}
              anchorRef={statusAnchorRef}
            />
          </div>
          <p className="px-0.5 text-[0.71875rem] text-fg-subtle">
            Click a phase to update its status.
          </p>
        </div>
      )}
    </div>
  )
}
