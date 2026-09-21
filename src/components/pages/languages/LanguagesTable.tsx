import { Pencil, RotateCcw, Trash2 } from "lucide-react"
import type { LanguageProjectRef, LanguageResponse } from "@/types"
import { cn } from "@/utils/cn"
import { formatDate } from "@/utils/format"

const thClass =
  "text-left px-5 py-3 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-fg-subtle border-b border-line"
const tdClass = "px-5 py-3 border-b border-line"
const iconBtn = "w-[1.875rem] h-[1.875rem] rounded-[0.5625rem] inline-grid place-items-center transition-colors"

interface LanguagesTableProps {
  languages: LanguageResponse[]
  projectsByLanguage: Map<string, LanguageProjectRef[]>
  currentUserId: string | undefined
  canEdit: boolean
  canDeactivate: boolean
  reactivatingId: string | null
  onEdit: (lang: LanguageResponse) => void
  onDeactivate: (lang: LanguageResponse) => void
  onReactivate: (lang: LanguageResponse) => void
}

export function LanguagesTable({
  languages,
  projectsByLanguage,
  currentUserId,
  canEdit,
  canDeactivate,
  reactivatingId,
  onEdit,
  onDeactivate,
  onReactivate,
}: LanguagesTableProps) {
  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={thClass}>Language</th>
            <th className={thClass}>Code</th>
            <th className={thClass}>Projects</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Created</th>
            <th className={cn(thClass, "text-right")} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {languages.map((lang) => (
            <tr
              key={lang.id}
              className={cn(
                "transition-colors",
                lang.is_active ? "hover:bg-muted" : "bg-muted hover:bg-quiet",
              )}
            >
              <td className={cn(tdClass, "font-semibold text-fg-strong")}>{lang.name}</td>
              <td className={tdClass}>
                <span className="font-mono text-xs bg-muted rounded-md px-2 py-0.5 text-fg-muted">
                  {lang.code}
                </span>
              </td>
              <td className={cn(tdClass, "text-fg-muted")}>
                {projectsByLanguage.get(lang.id)?.length ?? 0}
              </td>
              <td className={tdClass}>
                <span className="inline-flex items-center gap-2 text-[0.8125rem] text-fg-muted">
                  <span className={cn("w-2 h-2 rounded-full", lang.is_active ? "bg-st-ok" : "bg-st-idle")} />
                  {lang.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={cn(tdClass, "text-fg-subtle text-[0.78125rem]")}>
                {formatDate(lang.created_at)}
                {lang.created_by === currentUserId ? " · You" : ""}
              </td>
              <td className={cn(tdClass, "text-right whitespace-nowrap")}>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(lang)}
                    title="Edit"
                    aria-label={`Edit ${lang.name}`}
                    className={cn(iconBtn, "text-fg-subtle hover:bg-muted hover:text-fg-strong")}
                  >
                    <Pencil className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
                  </button>
                )}
                {canDeactivate && lang.is_active && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(lang)}
                    title="Deactivate"
                    aria-label={`Deactivate ${lang.name}`}
                    className={cn(iconBtn, "text-fg-subtle hover:bg-accent-soft hover:text-on-accent-soft")}
                  >
                    <Trash2 className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
                  </button>
                )}
                {canDeactivate && !lang.is_active && (
                  <button
                    type="button"
                    onClick={() => onReactivate(lang)}
                    disabled={reactivatingId !== null}
                    title="Reactivate"
                    aria-label={`Reactivate ${lang.name}`}
                    className={cn(
                      iconBtn,
                      "text-fg-subtle hover:bg-st-ok/15 hover:text-st-ok disabled:opacity-50",
                    )}
                  >
                    <RotateCcw className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
