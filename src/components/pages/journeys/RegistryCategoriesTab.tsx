import { Circle, Plus, Trash2 } from "lucide-react"
import type { PhaseCategory } from "@/types"
import { CATEGORY_ICONS, CATEGORY_PALETTE, ICON_KEYS } from "@/constants/journeyStatus"
import { cn } from "@/utils/cn"

interface RegistryCategoriesTabProps {
  categories: PhaseCategory[]
  editingId: string | null
  onToggleEdit: (id: string) => void
  onName: (id: string, value: string) => void
  onColor: (id: string, color: string) => void
  onIcon: (id: string, icon: string) => void
  onDelete: (id: string) => void
  onAddCategory: () => void
}

export function RegistryCategoriesTab({
  categories,
  editingId,
  onToggleEdit,
  onName,
  onColor,
  onIcon,
  onDelete,
  onAddCategory,
}: RegistryCategoriesTabProps) {
  const canDelete = categories.length > 1

  return (
    <div className="flex flex-col gap-[0.4375rem]">
      <div className="mb-px text-[0.71875rem] text-fg-subtle">
        Categories set each phase’s colour and icon on the canvas.
      </div>
      {categories.map((c) => {
        const Icon = CATEGORY_ICONS[c.icon] ?? Circle
        const open = editingId === c.id
        const usage =
          c.phase_count === 0 ? "Unused" : c.phase_count === 1 ? "1 phase" : `${c.phase_count} phases`
        const other = categories.find((x) => x.id !== c.id)
        const deleteHint = !canDelete
          ? "At least one category is required"
          : c.phase_count > 0 && other
            ? `Delete — phases move to ${other.name}`
            : "Delete category"
        return (
          <div key={c.id} className="flex flex-col gap-[0.5625rem] rounded-[0.875rem] bg-muted px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-[0.5625rem]">
              <span
                className="flex h-[2.125rem] w-[2.125rem] flex-none items-center justify-center rounded-full text-on-dark shadow-[inset_0_-0.125rem_0.3125rem_rgba(10,7,3,0.14)]"
                style={{ background: c.color }}
              >
                <Icon className="h-[1.0625rem] w-[1.0625rem]" strokeWidth={1.9} />
              </span>
              <input
                aria-label="Category name"
                value={c.name}
                onChange={(e) => onName(c.id, e.target.value)}
                className="h-[2.125rem] min-w-0 flex-1 rounded-[0.625rem] border border-line-strong bg-elevated px-2.5 text-[0.8125rem] font-semibold text-fg-strong focus:border-accent focus:outline-none"
              />
              <span className="min-w-16 flex-none text-right text-[0.71875rem] text-fg-subtle">
                {usage}
              </span>
              <button
                onClick={() => onToggleEdit(c.id)}
                aria-pressed={open}
                className="flex-none cursor-pointer rounded-full px-[0.8125rem] py-[0.4375rem] text-[0.75rem] font-semibold text-fg-strong shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)] transition-colors hover:bg-elevated"
              >
                {open ? "Done" : "Style"}
              </button>
              <button
                onClick={canDelete ? () => onDelete(c.id) : undefined}
                title={deleteHint}
                aria-label="Delete category"
                className={cn(
                  "flex h-7 w-7 flex-none items-center justify-center rounded-[0.5rem] text-[#A63A2E] transition-colors",
                  canDelete ? "cursor-pointer hover:bg-[#F0DCD8]" : "cursor-default opacity-30",
                )}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
              </button>
            </div>
            {open && (
              <div className="flex flex-col gap-[0.6875rem] border-t border-line pt-2.5">
                <div>
                  <div className="mb-[0.4375rem] text-[0.59375rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
                    Colour
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_PALETTE.map((swatch) => (
                      <button
                        key={swatch.color}
                        onClick={() => onColor(c.id, swatch.color)}
                        aria-pressed={swatch.color === c.color}
                        title={swatch.name}
                        aria-label={swatch.name}
                        className={cn(
                          "h-[1.625rem] w-[1.625rem] cursor-pointer rounded-full",
                          swatch.color === c.color
                            ? "shadow-[0_0_0_0.125rem_var(--color-muted),0_0_0_0.25rem_#BE4A01]"
                            : "shadow-[inset_0_0_0_0.0625rem_rgba(63,62,32,0.16)]",
                        )}
                        style={{ background: swatch.color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-[0.4375rem] text-[0.59375rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
                    Icon
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ICON_KEYS.map((key) => {
                      const CellIcon = CATEGORY_ICONS[key] ?? Circle
                      const on = key === c.icon
                      return (
                        <button
                          key={key}
                          onClick={() => onIcon(c.id, key)}
                          aria-pressed={on}
                          aria-label="Icon"
                          className={cn(
                            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[0.625rem]",
                            on
                              ? "text-on-dark"
                              : "bg-elevated text-fg-muted shadow-[inset_0_0_0_0.0625rem_var(--color-line-strong)]",
                          )}
                          style={on ? { background: c.color } : undefined}
                        >
                          <CellIcon className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <button
        onClick={onAddCategory}
        className="mt-[0.1875rem] flex cursor-pointer items-center gap-2 self-start rounded-full px-3.5 py-[0.5625rem] text-[0.78125rem] font-bold text-accent transition-colors hover:bg-accent-soft"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        New category
      </button>
    </div>
  )
}
