import { Plus } from "lucide-react"
import type { ProjectOrganizationAccessDetailResponse } from "@/types"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { formatDate } from "@/utils/format"
import { initialsOf } from "./initials"
import { RevokeButton } from "./RevokeButton"

export function OrgAccessSection({
  orgs,
  loading,
  onGrant,
  onRevoke,
}: {
  orgs: ProjectOrganizationAccessDetailResponse[]
  loading: boolean
  onGrant: () => void
  onRevoke: (org: ProjectOrganizationAccessDetailResponse) => void
}) {
  if (loading) {
    return <LoadingSpinner size="sm" />
  }

  return (
    <div className={cn(card.base, "overflow-hidden")}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex flex-col gap-0.5">
          <h4 className="flex items-center text-[0.96875rem] font-semibold text-fg-strong">
            Organizations
            <InfoTooltip content="Organizations whose members all have access to this project." />
          </h4>
          <span className="text-xs text-fg-subtle">
            All members of the organization inherit access to this project.
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={onGrant}>
          <Plus className="h-4 w-4" />
          Grant to organization
        </Button>
      </div>

      {orgs.length === 0 ? (
        <p className="px-5 py-6 text-[0.8125rem] text-fg-subtle">
          No organizations have access to this project.
        </p>
      ) : (
        orgs.map((org) => (
          <div
            key={org.id}
            className="flex items-center gap-3.5 px-5 py-3.5 border-b border-line last:border-b-0"
          >
            <span className="w-8 h-8 rounded-[0.5625rem] bg-inverse text-on-dark grid place-items-center text-[0.6875rem] font-bold flex-none">
              {initialsOf(org.name)}
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-fg-strong text-[0.84375rem] truncate">
                {org.name}
              </span>
              <span className="text-xs text-fg-subtle font-mono truncate">
                {org.slug} · granted {formatDate(org.granted_at)}
              </span>
            </div>
            <RevokeButton onClick={() => onRevoke(org)} title="Revoke" />
          </div>
        ))
      )}
    </div>
  )
}
