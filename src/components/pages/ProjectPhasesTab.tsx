import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Check, Circle, Loader2, AlertTriangle, GitBranch } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { PHASE_STATUSES } from "@/types"
import type { PhaseStatus, ProjectPhaseResponse } from "@/types"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"

const STATUS_CONFIG: Record<PhaseStatus, {
  label: string
  nodeClasses: string
  badgeClasses: string
  icon: typeof Circle
}> = {
  not_started: {
    label: "Not Started",
    nodeClasses: "border-areia/60 bg-areia/10 dark:bg-areia/5",
    badgeClasses: "bg-areia/20 text-verde border-areia/30",
    icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    nodeClasses: "border-azul/60 bg-azul/10 dark:bg-azul/10",
    badgeClasses: "bg-azul/20 text-azul border-azul/30",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    nodeClasses: "border-verde-claro/60 bg-verde-claro/10 dark:bg-verde-claro/10",
    badgeClasses: "bg-verde-claro/20 text-verde-claro border-verde-claro/30",
    icon: Check,
  },
  blocked: {
    label: "Blocked",
    nodeClasses: "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800",
    badgeClasses: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    icon: AlertTriangle,
  },
}

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
  const config = STATUS_CONFIG[node.status]
  const StatusIcon = config.icon

  return (
    <g>
      <foreignObject x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={cn(
            "h-full rounded-lg border-2 px-3 py-2 flex flex-col justify-center cursor-pointer transition-all duration-200 hover:shadow-md",
            config.nodeClasses,
          )}
          onClick={() => onStatusClick(node)}
        >
          <p className="text-sm font-medium text-preto truncate">{node.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusIcon className={cn(
              "h-3 w-3 shrink-0",
              node.status === "in_progress" && "animate-spin",
              node.status === "completed" && "text-verde-claro",
              node.status === "blocked" && "text-red-600 dark:text-red-400",
              node.status === "not_started" && "text-verde/40",
              node.status === "in_progress" && "text-azul",
            )} />
            <span className={cn("text-xs font-medium", config.badgeClasses, "bg-transparent border-0 p-0")}>
              {config.label}
            </span>
          </div>
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
      stroke="currentColor"
      strokeWidth={2}
      className="text-areia/60"
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
        <p className="text-xs font-medium text-verde mb-2 px-2">Update Status</p>
        <div className="space-y-0.5">
          {PHASE_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status]
            const StatusIcon = config.icon
            const isActive = node.status === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => onSelect(node.phaseId, status)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left",
                  isActive
                    ? "bg-telha/10 text-telha font-medium"
                    : "hover:bg-surface-alt text-preto",
                )}
              >
                <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", status === "in_progress" && "animate-spin")} />
                {config.label}
                {isActive && <Check className="h-3.5 w-3.5 ml-auto text-telha" />}
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
      toast.success(`Phase status updated to ${STATUS_CONFIG[status].label}`)
    } catch {
      toast.error("Failed to update phase status")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-preto tracking-tight flex items-center">
          Phases
          <InfoTooltip content="Every phase defined by a platform admin applies to all projects. Set each phase's status to track this project's progress." />
        </h3>
      </div>

      {phases.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No phases defined yet"
          description="Phases and their dependencies are defined by a platform admin and apply to every project. Once created, they appear here and you can track this project's progress by setting each phase's status."
        />
      ) : (
        <div className={cn(card.base, "overflow-hidden")}>
          <div className="overflow-x-auto relative">
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
                  <polygon
                    points="0 0, 8 3, 0 6"
                    className="fill-areia/60"
                  />
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
          <div className="px-4 py-2.5 border-t border-areia/10 bg-surface-alt/30">
            <p className="text-xs text-verde/50">Click a phase to update its status.</p>
          </div>
        </div>
      )}
    </div>
  )
}
