import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Plus, X, Check, Circle, Loader2, AlertTriangle, GitBranch } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import { usePhasesStore } from "@/stores/phasesStore"
import type { ProjectPhaseResponse } from "@/types"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

type PhaseStatus = "not_started" | "in_progress" | "completed" | "blocked"

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

const ALL_STATUSES: PhaseStatus[] = ["not_started", "in_progress", "completed", "blocked"]

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
        status: phase.status as PhaseStatus,
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
  onDetach,
}: {
  node: LayoutNode
  onStatusClick: (node: LayoutNode) => void
  onDetach: (node: LayoutNode) => void
}) {
  const config = STATUS_CONFIG[node.status]
  const StatusIcon = config.icon

  return (
    <g>
      <foreignObject x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={cn(
            "h-full rounded-lg border-2 px-3 py-2 flex flex-col justify-center cursor-pointer transition-all duration-200 hover:shadow-md group relative",
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDetach(node)
            }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-950/30"
          >
            <X className="h-3 w-3 text-red-500 dark:text-red-400" />
          </button>
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
          {ALL_STATUSES.map((status) => {
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

function AttachPhaseDialog({
  open,
  onOpenChange,
  projectId,
  attachedPhaseIds,
  onAttached,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  attachedPhaseIds: Set<string>
  onAttached: () => void
}) {
  const { phases: allPhases, loading, fetch: fetchGlobalPhases } = usePhasesStore()
  const [attaching, setAttaching] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetchGlobalPhases()
  }, [open, fetchGlobalPhases])

  const available = useMemo(
    () => allPhases.filter((p) => !attachedPhaseIds.has(p.id)),
    [allPhases, attachedPhaseIds],
  )

  async function handleAttach(phaseId: string) {
    setAttaching(phaseId)
    try {
      await projectsAPI.attachPhase(projectId, phaseId)
      toast.success("Phase attached to project")
      onAttached()
    } catch {
      toast.error("Failed to attach phase")
    } finally {
      setAttaching(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Phase</DialogTitle>
          <DialogDescription>
            Select a global phase to attach to this project. Attached phases can be tracked with status updates.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto -mx-2">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : available.length === 0 ? (
            <p className="text-sm text-verde/60 text-center py-6">
              {allPhases.length === 0
                ? "No global phases have been created yet."
                : "All available phases are already attached."}
            </p>
          ) : (
            <div className="space-y-1 px-2">
              {available.map((phase) => (
                <div
                  key={phase.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-alt/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-preto truncate">{phase.name}</p>
                    {phase.description && (
                      <p className="text-xs text-verde/60 truncate mt-0.5">{phase.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAttach(phase.id)}
                    disabled={attaching === phase.id}
                    className="ml-3 shrink-0"
                  >
                    {attaching === phase.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Attach
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectPhasesTab({ projectId }: { projectId: string }) {
  const [phases, setPhases] = useState<ProjectPhaseResponse[]>([])
  const [deps, setDeps] = useState<Map<string, string[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [attachOpen, setAttachOpen] = useState(false)
  const [statusNode, setStatusNode] = useState<LayoutNode | null>(null)
  const [detachTarget, setDetachTarget] = useState<LayoutNode | null>(null)
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
  const attachedIds = useMemo(() => new Set(phases.map((p) => p.phase_id)), [phases])

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

  async function handleDetach() {
    if (!detachTarget) return
    try {
      await projectsAPI.detachPhase(projectId, detachTarget.phaseId)
      toast.success("Phase detached from project")
      setDetachTarget(null)
      await fetchPhases()
    } catch {
      toast.error("Failed to detach phase")
    }
  }

  function handleAttached() {
    fetchPhases()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-preto tracking-tight flex items-center">
          Phases
          <InfoTooltip content="Track project progress through phases. Each phase can have a status that reflects its current state within this project." />
        </h3>
        <Button size="sm" onClick={() => setAttachOpen(true)}>
          <Plus className="h-4 w-4" />
          Attach Phase
        </Button>
      </div>

      {phases.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No phases attached"
          description="Attach global phases to this project to track progress through each stage. Phases can have dependencies that define the workflow order."
          actionLabel="Attach Phase"
          onAction={() => setAttachOpen(true)}
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
                  onDetach={setDetachTarget}
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
            <p className="text-xs text-verde/50">Click a phase to update its status. Hover and click the x to detach.</p>
          </div>
        </div>
      )}

      <AttachPhaseDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        projectId={projectId}
        attachedPhaseIds={attachedIds}
        onAttached={handleAttached}
      />

      <ConfirmDialog
        open={detachTarget !== null}
        onOpenChange={(open) => { if (!open) setDetachTarget(null) }}
        title="Detach Phase"
        description={`Are you sure you want to detach "${detachTarget?.name ?? "this phase"}" from the project? The phase status for this project will be removed.`}
        confirmLabel="Detach"
        variant="destructive"
        onConfirm={handleDetach}
      />
    </div>
  )
}
