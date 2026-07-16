import { Plus, Users } from "lucide-react"
import type { ProjectUserAccessDetailResponse } from "@/types"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { formatDate } from "@/utils/format"
import { initialsOf } from "./initials"
import { RevokeButton } from "./RevokeButton"

const TH =
  "px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-fg-subtle border-b border-line"

export function UserAccessSection({
  users,
  loading,
  isPlatformAdmin,
  isProjectManager,
  onGrant,
  onRevoke,
  onRoleChange,
}: {
  users: ProjectUserAccessDetailResponse[]
  loading: boolean
  isPlatformAdmin: boolean
  isProjectManager: boolean
  onGrant: () => void
  onRevoke: (user: ProjectUserAccessDetailResponse) => void
  onRoleChange: (userId: string, newRole: string) => void
}) {
  if (loading) {
    return <LoadingSpinner size="sm" />
  }

  const canGrant = isPlatformAdmin || isProjectManager
  const canManageUser = (role: string) =>
    isPlatformAdmin || (isProjectManager && role === "member")

  return (
    <div className={cn(card.base, "overflow-hidden")}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h4 className="flex items-center text-[15.5px] font-semibold text-fg-strong">
          People
          <InfoTooltip content="Individual users who have been granted direct access to this project." />
        </h4>
        {canGrant && (
          <Button size="sm" onClick={onGrant}>
            <Plus className="h-4 w-4" />
            Grant access
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No people with direct access"
          description="Grant individual users access to this project. Users can also gain access through their organization membership."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={cn(TH, "text-left")}>Person</th>
              <th className={cn(TH, "text-left")}>Role</th>
              <th className={cn(TH, "text-left hidden md:table-cell")}>Granted</th>
              <th className={cn(TH, "text-right")} />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted transition-colors">
                <td className="px-5 py-3 border-b border-line">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full bg-azul/20 text-azul grid place-items-center text-[11px] font-bold flex-none bg-cover bg-center"
                      style={
                        user.avatar_url
                          ? { backgroundImage: `url(${user.avatar_url})` }
                          : undefined
                      }
                    >
                      {!user.avatar_url && initialsOf(user.display_name || user.email)}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-fg-strong text-[13.5px] truncate">
                        {user.display_name || user.email}
                      </span>
                      <span className="text-xs text-fg-subtle truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 border-b border-line">
                  {canManageUser(user.role) ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) => onRoleChange(user.user_id, value)}
                    >
                      <SelectTrigger className="w-[130px] h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={user.role === "manager" ? "manager" : "member"}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-3 border-b border-line text-[12.5px] text-fg-subtle hidden md:table-cell">
                  {formatDate(user.granted_at)}
                </td>
                <td className="px-5 py-3 border-b border-line text-right">
                  {canManageUser(user.role) && (
                    <RevokeButton
                      onClick={() => onRevoke(user)}
                      title="Revoke access"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
