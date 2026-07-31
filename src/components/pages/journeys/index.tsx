import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import type { PhaseStatus } from "@/types"
import { uiScale } from "@/utils/uiScale"
import { useJourneyBuilder } from "./useJourneyBuilder"
import { useCanvasView } from "./useCanvasView"
import { buildChildren, buildLayout, dependencyChain, stepNumbers } from "./layout"
import { JourneyHeader, type PopoverKind } from "./JourneyHeader"
import { JourneyCanvas } from "./JourneyCanvas"
import { CanvasControls } from "./CanvasControls"
import { CanvasMinimap } from "./CanvasMinimap"
import { PhaseInspector } from "./PhaseInspector"
import { StatusChangeDialog } from "./StatusChangeDialog"
import { RegistryDialog } from "./RegistryDialog"

interface PendingStatus {
  phaseId: string
  from: PhaseStatus
  to: PhaseStatus
}

export default function JourneysPage() {
  const { isPlatformAdmin, managedProjectIds } = useAuth()
  const isAdmin = isPlatformAdmin
  const builder = useJourneyBuilder(isAdmin, managedProjectIds)
  const scale = useMemo(() => uiScale(), [])

  const [sel, setSel] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [pop, setPop] = useState<PopoverKind | null>(null)
  const [registryOpen, setRegistryOpen] = useState(false)
  const [pendSt, setPendSt] = useState<PendingStatus | null>(null)

  const { phases, deps } = builder
  const layout = useMemo(() => buildLayout(phases, deps, scale), [phases, deps, scale])
  const kids = useMemo(() => buildChildren(phases, deps), [phases, deps])
  const stepNums = useMemo(() => stepNumbers(phases), [phases])
  const chain = useMemo(
    () => (sel ? dependencyChain(sel, deps, kids) : null),
    [sel, deps, kids],
  )

  const mainRef = useRef<HTMLDivElement>(null)
  const canvas = useCanvasView({
    mainRef,
    worldW: layout.worldW,
    worldH: layout.worldH,
    fitPadding: 90 * scale,
    keysEnabled: !registryOpen && !pendSt,
    onClear: () => {
      setSel(null)
      setPop(null)
    },
    onEscape: () => {
      if (document.body.style.pointerEvents === "none") return
      setSel(null)
      setPop(null)
    },
  })

  const { fit } = canvas
  const phasesLoading = builder.phasesLoading
  useEffect(() => {
    if (phasesLoading) return
    const raf = requestAnimationFrame(fit)
    return () => cancelAnimationFrame(raf)
  }, [phasesLoading, fit])

  const projectId = builder.projectId
  const { loadLog } = builder
  useEffect(() => {
    if (sel && projectId) void loadLog(sel)
  }, [sel, projectId, loadLog])

  const selPhase = sel ? phases.find((p) => p.id === sel) ?? null : null

  const handlePickJourney = (id: string) => {
    setSel(null)
    setPendSt(null)
    builder.selectJourney(id)
  }

  const handleNewJourney = async () => {
    setPop(null)
    const id = await builder.createJourney()
    if (id) {
      setSel(null)
      setPendSt(null)
      setPop("settings")
    }
  }

  const handleAddPhase = async () => {
    const created = await builder.addPhase()
    if (created) {
      setSel(created.id)
      setPop(null)
    }
  }

  const handleDeletePhase = async () => {
    if (!selPhase) return
    const ok = await builder.deletePhase(selPhase.id)
    if (ok) setSel(null)
  }

  const handleDeleteJourney = () => {
    setPop(null)
    setSel(null)
    void builder.deleteJourney()
  }

  const handleRequestStatus = (to: PhaseStatus) => {
    if (!selPhase) return
    setPendSt({ phaseId: selPhase.id, from: builder.storedStatus(selPhase.id), to })
  }

  const handleSaveStatus = (note: string) => {
    if (!pendSt) return
    void builder.setStatus(pendSt.phaseId, pendSt.to, note)
    setPendSt(null)
  }

  if (builder.initialLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="flex h-full w-full flex-col">
      <JourneyHeader
        isAdmin={isAdmin}
        builder={builder}
        pop={pop}
        setPop={setPop}
        onPickJourney={handlePickJourney}
        onNewJourney={() => void handleNewJourney()}
        onAddPhase={() => void handleAddPhase()}
        onOpenRegistry={() => setRegistryOpen(true)}
        onDeleteJourney={handleDeleteJourney}
      />
      <div ref={mainRef} className="relative min-h-0 flex-1 overflow-hidden">
        <JourneyCanvas
          phases={phases}
          deps={deps}
          layout={layout}
          scale={scale}
          view={canvas.view}
          stepNums={stepNums}
          chain={chain}
          selectedId={sel}
          hoverId={hover}
          isAdmin={isAdmin}
          showEmpty={!phasesLoading && phases.length === 0 && builder.journeyId !== null}
          categoryFor={builder.categoryFor}
          storedStatus={builder.storedStatus}
          derivedStatus={builder.derivedStatus}
          onSelect={(id) => {
            setSel(id)
            setPop(null)
          }}
          onHover={setHover}
          onCanvasMouseDown={canvas.onCanvasMouseDown}
        />
        <CanvasControls
          zoomPct={`${Math.round(canvas.view.k * 100)}%`}
          onZoomIn={canvas.zoomIn}
          onZoomOut={canvas.zoomOut}
          onResetZoom={canvas.resetZoom}
          onFit={canvas.fit}
        />
        <CanvasMinimap
          phases={phases}
          layout={layout}
          scale={scale}
          view={canvas.view}
          categoryFor={builder.categoryFor}
          storedStatus={builder.storedStatus}
          onCenter={canvas.centerAt}
        />
        {selPhase && (
          <PhaseInspector
            phase={selPhase}
            isAdmin={isAdmin}
            hasProject={builder.hasProject}
            phases={phases}
            deps={deps}
            kids={kids}
            stepNums={stepNums}
            logs={builder.logs}
            categories={builder.categories}
            categoryFor={builder.categoryFor}
            storedStatus={builder.storedStatus}
            derivedStatus={builder.derivedStatus}
            onClose={() => setSel(null)}
            onSelectPhase={setSel}
            onTitle={(name) => builder.updatePhaseField(selPhase.id, { name })}
            onDescription={(description) =>
              builder.updatePhaseField(selPhase.id, { description })
            }
            onCategory={(categoryId) =>
              builder.updatePhaseField(selPhase.id, { category_id: categoryId }, true)
            }
            onToggleDep={(dependsOnId) =>
              void builder.toggleDependency(selPhase.id, dependsOnId)
            }
            onUploadIcon={() => builder.uploadPhaseIcon(selPhase.id)}
            onClearIcon={() => builder.clearPhaseIcon(selPhase.id)}
            onRequestStatus={handleRequestStatus}
            onDelete={() => void handleDeletePhase()}
          />
        )}
      </div>
      {pendSt && (
        <StatusChangeDialog
          key={`${pendSt.phaseId}-${pendSt.to}`}
          open
          onOpenChange={(open) => {
            if (!open) setPendSt(null)
          }}
          phaseName={phases.find((p) => p.id === pendSt.phaseId)?.name ?? ""}
          stepLabel={`STEP ${stepNums[pendSt.phaseId] ?? "—"}`}
          from={pendSt.from}
          to={pendSt.to}
          onSave={handleSaveStatus}
        />
      )}
      <RegistryDialog
        open={registryOpen}
        onOpenChange={setRegistryOpen}
        builder={builder}
        stepNums={stepNums}
      />
    </div>
  )
}
