import { AlertTriangle, Check, Circle, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { PhaseStatus } from "@/types"

export interface PhaseStatusConfig {
  label: string
  pill: string
  dot: string
  ring: string
  icon: LucideIcon
}

export const PHASE_STATUS_CONFIG: Record<PhaseStatus, PhaseStatusConfig> = {
  not_started: {
    label: "Not Started",
    pill: "bg-muted text-st-idle",
    dot: "bg-st-idle",
    ring: "ring-line",
    icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    pill: "bg-st-info/15 text-st-info",
    dot: "bg-st-info",
    ring: "ring-st-info/40",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    pill: "bg-st-ok/15 text-st-ok",
    dot: "bg-st-ok",
    ring: "ring-st-ok/40",
    icon: Check,
  },
  blocked: {
    label: "Blocked",
    pill: "bg-accent-soft text-on-accent-soft",
    dot: "bg-st-warn",
    ring: "ring-st-warn/40",
    icon: AlertTriangle,
  },
}
