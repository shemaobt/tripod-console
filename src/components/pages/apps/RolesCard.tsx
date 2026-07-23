import type { AppRoleResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

export function RolesCard({
  roles,
  loading,
  roleForm,
  setRoleForm,
  adding,
  onAdd,
  onDelete,
}: {
  roles: AppRoleResponse[]
  loading: boolean
  roleForm: { role_key: string; label: string; description: string }
  setRoleForm: React.Dispatch<React.SetStateAction<{ role_key: string; label: string; description: string }>>
  adding: boolean
  onAdd: () => void
  onDelete: (role: AppRoleResponse) => void
}) {
  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h4 className="text-[0.96875rem] font-semibold text-fg-strong">Roles</h4>
        <span className="text-[0.71875rem] text-fg-subtle">System roles cannot be deleted (409).</span>
      </div>

      {loading ? (
        <div className="py-8">
          <LoadingSpinner />
        </div>
      ) : roles.length === 0 ? (
        <div className="px-5 py-8 text-center text-[0.8125rem] text-fg-subtle">
          No roles defined yet — add one below.
        </div>
      ) : (
        roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center gap-3 px-5 py-3 border-b border-line"
          >
            <span className="text-[0.84375rem] font-semibold text-fg-strong w-40 truncate">{role.label}</span>
            <span className="font-mono text-xs bg-muted rounded-md px-2 py-0.5 text-fg-muted">{role.role_key}</span>
            {role.is_system && (
              <span className="text-[0.65625rem] font-bold tracking-[0.08em] uppercase text-fg-subtle bg-muted rounded-full px-2 py-[0.1875rem]">
                System
              </span>
            )}
            {!role.is_system && (
              <button
                onClick={() => onDelete(role)}
                className="ml-auto text-[0.78125rem] font-semibold text-on-accent-soft hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}

      <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 px-5 py-4 bg-muted">
        <div className="flex-1 sm:max-w-[13.75rem]">
          <label
            htmlFor="f_rl_name"
            className="block text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-fg-subtle mb-1"
          >
            Role name
          </label>
          <input
            id="f_rl_name"
            placeholder="e.g. Reviewer"
            value={roleForm.label}
            onChange={(e) => setRoleForm((f) => ({ ...f, label: e.target.value }))}
            className="w-full bg-elevated rounded-[0.625rem] px-3 py-2 text-[0.8125rem] text-fg-strong placeholder:text-fg-subtle shadow-[var(--shadow-sm)] focus:outline-none"
          />
        </div>
        <div className="flex-1 sm:max-w-[13.75rem]">
          <label
            htmlFor="f_rl_key"
            className="block text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-fg-subtle mb-1"
          >
            role_key
          </label>
          <input
            id="f_rl_key"
            placeholder="e.g. reviewer"
            value={roleForm.role_key}
            onChange={(e) => setRoleForm((f) => ({ ...f, role_key: e.target.value }))}
            className="w-full bg-elevated rounded-[0.625rem] px-3 py-2 text-[0.8125rem] font-mono text-fg-strong placeholder:text-fg-subtle shadow-[var(--shadow-sm)] focus:outline-none"
          />
        </div>
        <Button
          onClick={onAdd}
          disabled={adding || !roleForm.role_key.trim() || !roleForm.label.trim()}
        >
          {adding ? "Adding..." : "Add role"}
        </Button>
      </div>
    </div>
  )
}
