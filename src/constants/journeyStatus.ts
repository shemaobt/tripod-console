import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  Circle,
  ClipboardList,
  Clock,
  Code,
  Compass,
  FileText,
  Film,
  FlaskConical,
  Globe,
  Layers,
  Lock,
  Mic,
  PenLine,
  Play,
  Rocket,
  Search,
  Settings,
  Star,
  Target,
  Users,
  Wrench,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { DerivedPhaseStatus, PhaseStatus } from "@/types"

export interface JourneyStatusConfig {
  label: string
  solid: string
  soft: string
  text: string
  icon: LucideIcon
}

export const JOURNEY_STATUS_CONFIG: Record<DerivedPhaseStatus, JourneyStatusConfig> = {
  completed: { label: "Completed", solid: "#5D6236", soft: "#E2E5D2", text: "#5D6236", icon: Check },
  in_progress: { label: "In progress", solid: "#4D7068", soft: "#DCE7E4", text: "#3F5D56", icon: Activity },
  ready: { label: "Ready to start", solid: "#777D45", soft: "#E9EAD9", text: "#5F6534", icon: Play },
  waiting: { label: "Waiting on deps", solid: "#A87B12", soft: "#F3EAD2", text: "#8A6209", icon: Clock },
  delayed: { label: "Delayed", solid: "#BE4A01", soft: "#F2D8C2", text: "#A23E00", icon: AlertTriangle },
  blocked: { label: "Blocked", solid: "#A63A2E", soft: "#F0DCD8", text: "#A63A2E", icon: Lock },
  not_started: { label: "Not started", solid: "#8A8970", soft: "#E7E6DB", text: "#6B6A52", icon: Circle },
  cancelled: { label: "Cancelled", solid: "#8A8970", soft: "#EBEAE0", text: "#6B6A52", icon: X },
}

export const LEGEND_STATUS_ORDER: DerivedPhaseStatus[] = [
  "completed",
  "in_progress",
  "ready",
  "waiting",
  "delayed",
  "blocked",
  "not_started",
  "cancelled",
]

export const NOTE_REQUIRED_STATUSES: PhaseStatus[] = ["delayed", "blocked", "cancelled"]

export const STATUS_PROMPTS: Record<PhaseStatus, [string, string]> = {
  in_progress: [
    "What is starting?",
    "e.g. Drafting opened on Mark 1 with the full team — first passage recorded today.",
  ],
  completed: [
    "What was delivered?",
    "e.g. All twelve passages checked and signed off by the consultant on Jul 28.",
  ],
  delayed: [
    "Why did it slip, and what is the new expectation?",
    "e.g. Village visits pushed two weeks — the river crossing is closed until the water drops.",
  ],
  blocked: [
    "What is blocking it, and who can unblock it?",
    "e.g. Recording kit held at customs since Jul 02 — waiting on the freight agent.",
  ],
  cancelled: [
    "Why is this phase being dropped?",
    "e.g. Studio build cancelled in favour of a mobile kit — budget moved to filming.",
  ],
  not_started: [
    "Why is this going back to not started?",
    "e.g. Reopening the phase — the brief changed and the earlier work no longer applies.",
  ],
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  search: Search,
  clipboard: ClipboardList,
  pen: PenLine,
  code: Code,
  flask: FlaskConical,
  rocket: Rocket,
  wrench: Wrench,
  users: Users,
  star: Star,
  cog: Settings,
  file: FileText,
  mic: Mic,
  book: BookOpen,
  film: Film,
  globe: Globe,
  layers: Layers,
  target: Target,
}

export const ICON_KEYS = Object.keys(CATEGORY_ICONS)

export const FALLBACK_CATEGORY = { name: "Uncategorized", color: "#8A8970", icon: "circle" }

export const CATEGORY_PALETTE: Array<{ color: string; name: string }> = [
  { color: "#BE4A01", name: "Telha" },
  { color: "#A23E00", name: "Telha escuro" },
  { color: "#777D45", name: "Verde claro" },
  { color: "#5D6236", name: "Verde" },
  { color: "#4D7068", name: "Verde sage" },
  { color: "#4E5B8C", name: "Azul" },
  { color: "#A87B12", name: "Areia" },
  { color: "#A63A2E", name: "Terra" },
  { color: "#6F5691", name: "Ameixa" },
  { color: "#6B6A52", name: "Oliva" },
]
