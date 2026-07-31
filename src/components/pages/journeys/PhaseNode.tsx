import { Circle } from "lucide-react"
import type { DerivedPhaseStatus, PhaseResponse } from "@/types"
import { CATEGORY_ICONS, JOURNEY_STATUS_CONFIG } from "@/constants/journeyStatus"
import { orbGrad, rgba } from "@/utils/color"
import { cn } from "@/utils/cn"
import type { CategoryVisual } from "./useJourneyBuilder"

interface PhaseNodeProps {
  phase: PhaseResponse
  x: number
  y: number
  step: string
  cat: CategoryVisual
  derived: DerivedPhaseStatus
  cancelled: boolean
  selected: boolean
  hovered: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function PhaseNode({
  phase,
  x,
  y,
  step,
  cat,
  derived,
  cancelled,
  selected,
  hovered,
  onSelect,
  onHover,
}: PhaseNodeProps) {
  const status = JOURNEY_STATUS_CONFIG[derived]
  const BadgeIcon = status.icon
  const CatIcon = CATEGORY_ICONS[cat.icon] ?? Circle
  const lift = selected || hovered
  const z = 10 + Math.round(y / 8) + (selected ? 400 : hovered ? 200 : 0)

  return (
    <button
      onClick={() => onSelect(phase.id)}
      onMouseEnter={() => onHover(phase.id)}
      onMouseLeave={() => onHover(null)}
      aria-pressed={selected}
      className="absolute h-[11.875rem] w-[11rem] cursor-pointer transition-opacity duration-200"
      style={{ left: x, top: y, zIndex: z, opacity: cancelled ? 0.62 : 1 }}
    >
      <span className="absolute left-0 right-0 top-0 text-center font-mono text-[0.65625rem] font-bold leading-[0.875rem] tracking-[0.15em] text-fg-muted">
        STEP {step}
      </span>
      {selected && (
        <span className="absolute left-[0.375rem] top-[4.75rem] h-[4.5rem] w-[10.25rem] rounded-full shadow-[0_0_0_0.15625rem_#BE4A01]" />
      )}
      <span className="absolute left-[1.25rem] top-[5.1875rem] h-[3.625rem] w-[8.5rem] rounded-full bg-[#ECEADD] shadow-[0_0.3125rem_0_#DBD9C7,0_1.125rem_1.625rem_-0.375rem_rgba(10,7,3,0.16)]" />
      <span className="absolute left-[2.125rem] top-[5rem] h-[2.875rem] w-[6.75rem] rounded-full bg-[#F8F7EF] shadow-[0_0.3125rem_0_#E3E1D1]" />
      <span className="absolute left-[2.9375rem] top-[4.875rem] h-[2.1875rem] w-[5.125rem] rounded-full bg-[#FDFCF7] shadow-[0_0.25rem_0_#EAE8D9]" />
      <span
        className="absolute left-[3.5rem] top-[5rem] h-[1.625rem] w-[4rem] rounded-full blur-[0.375rem]"
        style={{ background: rgba(cat.color, 0.45) }}
      />
      <span
        className={cn(
          "absolute left-[3.75rem] flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full transition-[top,box-shadow] duration-200",
          lift ? "top-[2.625rem]" : "top-[2.875rem]",
        )}
        style={{
          background: orbGrad(cat.color),
          boxShadow: `${
            lift ? "0 1.125rem 1.5rem -0.5rem" : "0 0.8125rem 1.125rem -0.4375rem"
          } ${rgba(cat.color, 0.6)}, 0 0.1875rem 0.375rem rgba(10,7,3,0.14)`,
        }}
      >
        {phase.icon_url ? (
          <img
            src={phase.icon_url}
            alt=""
            className="absolute inset-0 h-full w-full rounded-full object-cover"
          />
        ) : (
          <CatIcon className="relative h-6 w-6 text-[#F6F5EB]" strokeWidth={1.85} />
        )}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_33%_24%,rgba(255,255,255,0.34),rgba(255,255,255,0)_58%)] shadow-[inset_0_-0.4375rem_0.6875rem_rgba(10,7,3,0.24),inset_0_0.3125rem_0.5625rem_rgba(255,255,255,0.2)]" />
        <span
          title={status.label}
          className="absolute bottom-[-0.0625rem] right-[-0.1875rem] flex h-[1.3125rem] w-[1.3125rem] items-center justify-center rounded-full border-[0.15625rem] border-[#FDFCF7] shadow-[0_0.125rem_0.25rem_rgba(10,7,3,0.22)]"
          style={{ background: status.solid }}
        >
          <BadgeIcon className="h-[0.625rem] w-[0.625rem] text-[#F6F5EB]" strokeWidth={3} />
        </span>
      </span>
      <span
        className={cn(
          "absolute left-[0.4375rem] right-[0.4375rem] top-[9.5rem] max-h-[2.125rem] overflow-hidden text-center text-[0.8125rem] font-semibold leading-[1.3] text-fg-strong",
          cancelled && "line-through",
        )}
      >
        {phase.name}
      </span>
    </button>
  )
}
