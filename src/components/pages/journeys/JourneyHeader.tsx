import { Lock, SlidersVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JourneyBuilder } from "./useJourneyBuilder"
import { JourneyMenuPopover } from "./JourneyMenuPopover"
import { SettingsPopover } from "./SettingsPopover"
import { LegendPopover } from "./LegendPopover"
import { ProjectPill } from "./ProjectPill"

export type PopoverKind = "menu" | "settings" | "legend" | "project"

interface JourneyHeaderProps {
  isAdmin: boolean
  builder: JourneyBuilder
  pop: PopoverKind | null
  setPop: (pop: PopoverKind | null) => void
  onPickJourney: (id: string) => void
  onNewJourney: () => void
  onAddPhase: () => void
  onOpenRegistry: () => void
  onDeleteJourney: () => void
}

export function JourneyHeader({
  isAdmin,
  builder,
  pop,
  setPop,
  onPickJourney,
  onNewJourney,
  onAddPhase,
  onOpenRegistry,
  onDeleteJourney,
}: JourneyHeaderProps) {
  const { journey, journeys, phases } = builder
  const assignedCount = journey ? builder.projectCountFor(journey.id) : 0
  const subtitle = journey
    ? `${journey.name} · ${phases.length} phases · ${
        builder.project
          ? `tracking ${builder.project.name}`
          : `assigned to ${assignedCount} ${assignedCount === 1 ? "project" : "projects"}`
      }`
    : "No journeys yet"

  const togglePop = (kind: PopoverKind) => (open: boolean) => setPop(open ? kind : null)

  return (
    <div className="flex flex-none flex-wrap items-center gap-2.5 border-b border-line px-5 py-3">
      <div className="mr-1.5 flex flex-col gap-px">
        <h1 className="m-0 text-[1.1875rem] font-bold leading-[1.2] tracking-tight text-fg-strong">
          Journeys
        </h1>
        <span className="text-[0.71875rem] text-fg-subtle">{subtitle}</span>
      </div>
      {isAdmin ? (
        <JourneyMenuPopover
          open={pop === "menu"}
          onOpenChange={togglePop("menu")}
          journeys={journeys}
          currentId={builder.journeyId}
          currentName={journey?.name ?? "—"}
          phaseCountFor={builder.journeyPhaseCount}
          projectCountFor={builder.projectCountFor}
          onPick={(id) => {
            onPickJourney(id)
            setPop(null)
          }}
          onNew={onNewJourney}
        />
      ) : (
        <span className="flex h-9 items-center gap-2 rounded-full bg-elevated px-3.5 text-[0.78125rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)]">
          <span className="font-medium text-fg-subtle">Journey:</span>
          <span className="max-w-[11rem] truncate">{journey?.name ?? "—"}</span>
        </span>
      )}
      <ProjectPill
        open={pop === "project"}
        onOpenChange={togglePop("project")}
        projects={builder.eligibleProjects}
        currentId={builder.projectId}
        journeyId={builder.journeyId}
        phasesTotal={phases.length}
        showTemplate={isAdmin}
        onPick={(id) => {
          builder.selectProject(id)
          setPop(null)
        }}
        onPickTemplate={() => {
          builder.selectTemplate()
          setPop(null)
        }}
      />
      {isAdmin && (
        <>
          <SettingsPopover
            open={pop === "settings"}
            onOpenChange={togglePop("settings")}
            journey={journey}
            journeys={journeys}
            phaseCount={phases.length}
            assignedCount={assignedCount}
            projects={builder.projects}
            onRename={(name) => builder.updateJourney({ name })}
            onDescribe={(description) => builder.updateJourney({ description })}
            onToggleProject={(projectId, on) => void builder.assignProject(projectId, on)}
            onDelete={onDeleteJourney}
          />
          <button
            onClick={onOpenRegistry}
            title="Registry — manage phases and categories"
            aria-label="Registry — manage phases and categories"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-fg-muted shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-muted hover:text-fg-strong"
          >
            <SlidersVertical className="h-4 w-4" strokeWidth={1.9} />
          </button>
          <Button onClick={onAddPhase}>Add phase</Button>
        </>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {!isAdmin && (
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[0.71875rem] font-semibold text-fg-muted">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Manager view · status updates only
          </span>
        )}
        <LegendPopover
          open={pop === "legend"}
          onOpenChange={togglePop("legend")}
          categories={builder.categories}
        />
      </div>
    </div>
  )
}
