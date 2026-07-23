import type { UserRole } from "@/types"
import { card } from "@/styles"
import { cn } from "@/utils/cn"
import { roleChoices } from "./roles"

export function GlobalRoleCard({
  currentRole,
  isSelf,
  roleSaving,
  onRoleSelect,
}: {
  currentRole: UserRole
  isSelf: boolean
  roleSaving: boolean
  onRoleSelect: (role: UserRole) => void
}) {
  return (
    <div className={cn(card.base, "flex flex-col gap-3 p-[1.375rem]")}>
      <h4 className="text-[0.96875rem] font-bold text-fg-strong">Global role</h4>
      {isSelf ? (
        <p className="text-[0.8125rem] text-fg-subtle">
          You cannot change your own role (403).
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {roleChoices.map((choice) => {
            const selected = choice.value === currentRole
            return (
              <button
                key={choice.value}
                type="button"
                disabled={roleSaving}
                onClick={() => onRoleSelect(choice.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-[0.09375rem] px-3.5 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-60",
                  selected ? "border-accent" : "border-line",
                )}
              >
                <span
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full border-[0.09375rem]",
                    selected ? "border-accent" : "border-line-strong",
                  )}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-2 text-[0.84375rem] font-semibold text-fg-strong">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", choice.dot)} />
                    {choice.label}
                  </span>
                  <span className="text-[0.71875rem] text-fg-subtle">{choice.desc}</span>
                </span>
              </button>
            )
          })}
          <span className="text-[0.71875rem] text-fg-subtle">
            Choosing manager opens the project picker (≥ 1 project). Demoting to member keeps access rows.
          </span>
        </div>
      )}
    </div>
  )
}
