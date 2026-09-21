import type { OrganizationResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InfoTooltip } from "@/components/common/InfoTooltip"

export function GrantOrgDialog({
  open,
  onOpenChange,
  orgs,
  orgsLoading,
  orgId,
  onOrgIdChange,
  granting,
  onGrant,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgs: OrganizationResponse[]
  orgsLoading: boolean
  orgId: string
  onOrgIdChange: (orgId: string) => void
  granting: boolean
  onGrant: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Organization Access</DialogTitle>
          <DialogDescription>
            All members of the selected organization will gain access to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label>
              <span className="inline-flex items-center">
                Organization
                <InfoTooltip content="Select the organization to grant project access." />
              </span>
            </Label>
            {orgsLoading ? (
              <p className="text-sm text-fg-muted">
                Loading organizations...
              </p>
            ) : (
              <Select value={orgId} onValueChange={onOrgIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={granting}
          >
            Cancel
          </Button>
          <Button onClick={onGrant} disabled={granting || !orgId}>
            {granting ? "Granting..." : "Grant Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
