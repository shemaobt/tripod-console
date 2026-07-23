import { useState } from "react"
import { Search } from "lucide-react"
import type { ProjectResponse } from "@/types"
import { cn } from "@/utils/cn"

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

  const query = search.trim().toLowerCase()
  const filtered = query
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.locLine.toLowerCase().includes(query),
      )
    : rows

  return (
    <div className="absolute left-4 top-4 bottom-4 z-[1000] flex w-[300px] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[18px] bg-elevated p-4 shadow-[var(--shadow-lg)]">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-[15.5px] font-semibold text-fg-strong">Field map</h4>
        <span className="text-[11.5px] text-fg-subtle">{countLabel}</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-muted px-[14px] py-2">
        <Search className="h-3.5 w-3.5 flex-none text-fg-subtle" strokeWidth={2} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="w-full border-none bg-transparent text-[13px] text-fg-strong outline-none placeholder:text-fg-subtle"
        />
      </div>

      <div className="-mx-1.5 flex flex-1 flex-col overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-[11.5px] text-fg-subtle">
            No projects found
          </p>
        ) : (
          filtered.map((r) => (
            <button
              key={r.project.id}
              onClick={() => onSelect(r.project)}
              className={cn(
                "flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                activeId === r.project.id ? "bg-muted" : "hover:bg-muted",
              )}
            >
              <span className="text-[13.5px] font-semibold text-fg-strong">
                {r.name}
              </span>
              <span className="text-[11.5px] text-fg-subtle">{r.locLine}</span>
              <span className="text-[11.5px] text-fg-muted">{r.meta}</span>
            </button>
          ))
        )}
      </div>

      <span className="text-[10.5px] text-fg-subtle">
        Tiles: CARTO · click a project to fly to it
      </span>
    </div>
  )
}
