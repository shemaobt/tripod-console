import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ProjectResponse } from "@/types"
import { cn } from "@/utils/cn"
import { SearchPill } from "@/components/common/FilterBar"

const isNarrow = () => window.matchMedia("(max-width: 847.98px)").matches

export type MapRow = {
  project: ProjectResponse
  name: string
  locLine: string
  meta: string
}

export function FieldMapPanel({
  rows,
  activeId,
  onSelect,
  countLabel,
}: {
  rows: MapRow[]
  activeId: string | null
  onSelect: (project: ProjectResponse) => void
  countLabel: string
}) {
  const [search, setSearch] = useState("")
  const [collapsed, setCollapsed] = useState(isNarrow)

  function select(project: ProjectResponse) {
    onSelect(project)
    if (isNarrow()) setCollapsed(true)
  }

  const query = search.trim().toLowerCase()
  const filtered = query
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.locLine.toLowerCase().includes(query),
      )
    : rows

  return (
    <div
      className={cn(
        "absolute left-4 top-4 bottom-4 z-[1000] flex w-[18.75rem] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[1.125rem] bg-elevated p-4 shadow-[var(--shadow-lg)]",
        collapsed && "max-lg:bottom-auto",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[0.96875rem] font-semibold text-fg-strong">Field map</h4>
          <span className="text-[0.71875rem] text-fg-subtle">
            {query ? `${filtered.length} of ${rows.length} shown` : countLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="field-map-list"
          className="lg:hidden inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.71875rem] font-semibold text-fg-muted hover:bg-muted hover:text-fg-strong"
        >
          {collapsed ? "Show list" : "Hide list"}
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </button>
      </div>

      <div
        id="field-map-list"
        className={cn("flex min-h-0 flex-1 flex-col gap-3", collapsed && "max-lg:hidden")}
      >

        <SearchPill
          size="sm"
          value={search}
          onChange={setSearch}
          placeholder="Search projects…"
        />

        <div className="-mx-1.5 flex flex-1 flex-col overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-[0.71875rem] text-fg-subtle">
              No projects found
            </p>
          ) : (
            filtered.map((r) => (
              <button
                key={r.project.id}
                type="button"
                onClick={() => select(r.project)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                  activeId === r.project.id ? "bg-muted" : "hover:bg-muted",
                )}
              >
                <span className="text-[0.84375rem] font-semibold text-fg-strong">
                  {r.name}
                </span>
                <span className="text-[0.71875rem] text-fg-subtle">{r.locLine}</span>
                <span className="text-[0.71875rem] text-fg-muted">{r.meta}</span>
              </button>
            ))
          )}
        </div>

        <span className="text-[0.65625rem] text-fg-subtle">
          Tiles: CARTO · click a project to fly to it
        </span>
      </div>
    </div>
  )
}
