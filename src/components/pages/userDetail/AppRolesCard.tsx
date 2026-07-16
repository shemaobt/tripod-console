import type {
  UserRoleResponse,
  AppResponse,
  AppRoleResponse,
} from "@/types"
import { card } from "@/styles"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { formatDate } from "@/utils/format"

export function AppRolesCard({
  roles,
  loading,
  apps,
  availableRoles,
  selectedAppKey,
  selectedRoleKey,
  rolesForAppLoading,
  assigning,
  onEnsureApps,
  onAppChange,
  onRoleChange,
  onAssign,
  onRevoke,
}: {
  roles: UserRoleResponse[]
  loading: boolean
  apps: AppResponse[]
  availableRoles: AppRoleResponse[]
  selectedAppKey: string
  selectedRoleKey: string
  rolesForAppLoading: boolean
  assigning: boolean
  onEnsureApps: () => void
  onAppChange: (appKey: string) => void
  onRoleChange: (roleKey: string) => void
  onAssign: () => void
  onRevoke: (role: UserRoleResponse) => void
}) {
  return (
    <div className={cn(card.base, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h4 className="text-[15.5px] font-bold text-fg-strong">App roles</h4>
        <span className="text-[11.5px] text-fg-subtle">
          Revoking is soft — history is preserved.
        </span>
      </div>

      {loading ? (
        <div className="px-5 py-8">
          <LoadingSpinner />
        </div>
      ) : roles.length === 0 ? (
        <p className="px-5 py-5 text-[13px] text-fg-subtle">No app roles yet.</p>
      ) : (
        roles.map((role) => (
          <div
            key={`${role.app_key}-${role.role_key}`}
            className="flex items-center gap-3.5 border-b border-line px-5 py-3"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13.5px] font-semibold text-fg-strong">
                {role.app_key}
              </span>
              <span className="text-xs text-fg-subtle">
                granted {formatDate(role.granted_at)}
              </span>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-fg-muted">
              {role.role_key}
            </span>
            <button
              type="button"
              onClick={() => onRevoke(role)}
              className="text-[12.5px] font-semibold text-on-accent-soft hover:underline"
            >
              Revoke
            </button>
          </div>
        ))
      )}

      <div className="flex flex-col gap-3.5 bg-muted px-5 py-4 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-[240px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
            App
          </label>
          <Select
            value={selectedAppKey}
            onValueChange={onAppChange}
            onOpenChange={(open) => open && onEnsureApps()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select app" />
            </SelectTrigger>
            <SelectContent>
              {apps.map((app) => (
                <SelectItem key={app.id} value={app.app_key}>
                  {app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 sm:max-w-[240px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
            Role
          </label>
          <Select
            value={selectedRoleKey}
            onValueChange={onRoleChange}
            disabled={!selectedAppKey || rolesForAppLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  rolesForAppLoading
                    ? "Loading…"
                    : selectedAppKey
                      ? "Select role"
                      : "Select an app first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.role_key}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onAssign}
          disabled={assigning || !selectedAppKey || !selectedRoleKey}
        >
          {assigning ? "Assigning…" : "Assign role"}
        </Button>
      </div>
    </div>
  )
}
