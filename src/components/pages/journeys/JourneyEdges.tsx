import { useMemo } from "react"
import type { DerivedPhaseStatus, PhaseResponse, PhaseStatus } from "@/types"
import type { JourneyLayout } from "./layout"

interface JourneyEdgesProps {
  phases: PhaseResponse[]
  deps: Record<string, string[]>
  layout: JourneyLayout
  scale: number
  hoverId: string | null
  chain: Set<string> | null
  storedStatus: (phaseId: string) => PhaseStatus
  derivedStatus: (phaseId: string) => DerivedPhaseStatus
}

interface EdgeShape {
  key: string
  side: string
  top: string
  arrow: string
  sideC: string
  topC: string
  arrowC: string
  flow: boolean
  ord: number
}

export function JourneyEdges({
  phases,
  deps,
  layout,
  scale,
  hoverId,
  chain,
  storedStatus,
  derivedStatus,
}: JourneyEdgesProps) {
  const edges = useMemo<EdgeShape[]>(() => {
    const byId = new Set(phases.map((p) => p.id))
    const list: EdgeShape[] = []
    const hw = 7.5 * scale
    const depOffset = 5 * scale
    phases.forEach((n) => {
      ;(deps[n.id] ?? []).forEach((d) => {
        if (!byId.has(d)) return
        const p1 = layout.pos[d]
        const p2 = layout.pos[n.id]
        if (!p1 || !p2) return
        const ax = p1.x + 88 * scale
        const ay = p1.y + 112 * scale
        const bx = p2.x + 88 * scale
        const by = p2.y + 112 * scale
        const quad = (dy: number) =>
          `M ${ax} ${ay - hw + dy} L ${bx} ${by - hw + dy} L ${bx} ${by + hw + dy} L ${ax} ${ay + hw + dy} Z`
        const dead = storedStatus(d) === "cancelled" || storedStatus(n.id) === "cancelled"
        const hi =
          !dead &&
          ((chain !== null && chain.has(d) && chain.has(n.id)) ||
            (hoverId !== null && (d === hoverId || n.id === hoverId)))
        const flow = !dead && (hi || derivedStatus(n.id) === "in_progress")
        const len = Math.max(1, Math.hypot(bx - ax, by - ay))
        const ux = (bx - ax) / len
        const uy = (by - ay) / len
        const mx = ax + (bx - ax) * 0.6
        const my = ay + (by - ay) * 0.6
        list.push({
          key: `${d}->${n.id}`,
          side: quad(depOffset),
          top: quad(0),
          arrow: `M ${mx + ux * 9 * scale} ${my + uy * 9 * scale} L ${mx - ux * 4 * scale} ${my - uy * 4 * scale - 4.8 * scale} L ${mx - ux * 4 * scale} ${my - uy * 4 * scale + 4.8 * scale} Z`,
          sideC: dead ? "#E4E2D6" : hi ? "#A23E00" : "#D2D0BC",
          topC: dead ? "#F6F5EC" : hi ? "#F2D8C2" : "#EFEEE2",
          arrowC: dead ? "#DEDCCC" : hi ? "#BE4A01" : "#B7B59D",
          flow,
          ord: Math.round((ay + by) / 2),
        })
      })
    })
    list.sort((a, b) => a.ord - b.ord)
    return list
  }, [phases, deps, layout, scale, hoverId, chain, storedStatus, derivedStatus])

  return (
    <svg width={8} height={8} className="pointer-events-none absolute left-0 top-0 overflow-visible">
      {edges.map((e) => (
        <g key={e.key}>
          <path d={e.side} fill={e.sideC} />
          <path d={e.top} fill={e.topC} />
          <path
            d={e.arrow}
            fill={e.arrowC}
            style={e.flow ? { animation: "bandPulse 1.6s ease-in-out infinite" } : undefined}
          />
        </g>
      ))}
    </svg>
  )
}
