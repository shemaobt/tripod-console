import type { DerivedPhaseStatus, PhaseResponse, PhaseStatus } from "@/types"

export const NODE_W = 176
export const NODE_H = 190
export const GAP_X = 76
export const GAP_Y = 18

export interface JourneyLayout {
  pos: Record<string, { x: number; y: number }>
  worldW: number
  worldH: number
  nodeW: number
  nodeH: number
}

export function buildLayout(
  phases: PhaseResponse[],
  deps: Record<string, string[]>,
  scale: number,
): JourneyLayout {
  const W = NODE_W * scale
  const H = NODE_H * scale
  const GX = GAP_X * scale
  const GY = GAP_Y * scale
  if (!phases.length) {
    return { pos: {}, worldW: 480 * scale, worldH: 320 * scale, nodeW: W, nodeH: H }
  }
  const depsOf = (id: string) => deps[id] ?? []
  const level: Record<string, number> = {}
  const pending = phases.slice()
  let guard = 0
  while (pending.length && guard++ < 200) {
    for (let i = pending.length - 1; i >= 0; i--) {
      const n = pending[i]
      if (depsOf(n.id).every((d) => level[d] !== undefined)) {
        level[n.id] = depsOf(n.id).length
          ? Math.max(...depsOf(n.id).map((d) => level[d])) + 1
          : 0
        pending.splice(i, 1)
      }
    }
  }
  pending.forEach((n) => {
    level[n.id] = 0
  })
  const layerCount = Math.max(...Object.values(level)) + 1
  const layers: string[][] = Array.from({ length: layerCount }, () => [])
  phases.forEach((n) => layers[level[n.id]].push(n.id))
  const pos: Record<string, { x: number; y: number }> = {}
  layers.forEach((ids, li) =>
    ids.forEach((id, i) => {
      pos[id] = { x: li * (W + GX), y: i * (H + GY) }
    }),
  )
  for (let pass = 0; pass < 2; pass++) {
    layers.forEach((ids, li) => {
      if (!li) return
      const bary: Record<string, number> = {}
      ids.forEach((id) => {
        const parents = depsOf(id)
        bary[id] = parents.length
          ? parents.reduce((a, d) => a + (pos[d] ? pos[d].y : 0), 0) / parents.length
          : pos[id].y
      })
      ids.sort((a, b) => bary[a] - bary[b])
      ids.forEach((id, i) => {
        pos[id].y = i * (H + GY)
      })
    })
  }
  const maxH = Math.max(...layers.map((ids) => ids.length * H + (ids.length - 1) * GY))
  layers.forEach((ids) => {
    const th = ids.length * H + (ids.length - 1) * GY
    const off = (maxH - th) / 2
    ids.forEach((id) => {
      pos[id].y += off
    })
  })
  return { pos, worldW: layerCount * (W + GX) - GX, worldH: maxH, nodeW: W, nodeH: H }
}

export function deriveStatus(
  phaseId: string,
  deps: Record<string, string[]>,
  statuses: Record<string, PhaseStatus>,
): DerivedPhaseStatus {
  const stored = statuses[phaseId] ?? "not_started"
  if (stored !== "not_started") return stored
  const ok = (deps[phaseId] ?? []).every((d) => (statuses[d] ?? "not_started") === "completed")
  return ok ? "ready" : "waiting"
}

export function buildChildren(
  phases: PhaseResponse[],
  deps: Record<string, string[]>,
): Record<string, string[]> {
  const kids: Record<string, string[]> = {}
  phases.forEach((n) => {
    kids[n.id] = kids[n.id] ?? []
  })
  phases.forEach((n) => {
    ;(deps[n.id] ?? []).forEach((d) => {
      ;(kids[d] = kids[d] ?? []).push(n.id)
    })
  })
  return kids
}

export function collectReachable(start: string, next: Record<string, string[]>): Set<string> {
  const seen = new Set<string>()
  const go = (id: string) => {
    ;(next[id] ?? []).forEach((c) => {
      if (!seen.has(c)) {
        seen.add(c)
        go(c)
      }
    })
  }
  go(start)
  return seen
}

export function dependencyChain(
  sel: string,
  deps: Record<string, string[]>,
  kids: Record<string, string[]>,
): Set<string> {
  return new Set([sel, ...collectReachable(sel, deps), ...collectReachable(sel, kids)])
}

export function stepNumbers(phases: PhaseResponse[]): Record<string, string> {
  const num: Record<string, string> = {}
  phases.forEach((n, i) => {
    num[n.id] = String(i + 1).padStart(2, "0")
  })
  return num
}
