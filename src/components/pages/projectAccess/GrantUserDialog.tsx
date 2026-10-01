import type { UserListResponse } from "@/types"
import { states } from "@/styles"
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
import { UserSearchPicker } from "@/components/common/UserSearchPicker"
import { MANAGER_LOCK_NOTICE } from "./managerLock"

export function GrantUserDialog({
  open,
  onOpenChange,
  selectedUser,
  onSelectUser,
  excludeIds,
  grantRole,
  onGrantRoleChange,
  managerIsOneWay,
  granting,
  onGrant,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: UserListResponse | null
  onSelectUser: (user: UserListResponse | null) => void
  excludeIds: string[]
  grantRole: string
  onGrantRoleChange: (role: string) => void
  managerIsOneWay: boolean
  granting: boolean
  onGrant: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant User Access</DialogTitle>
          <DialogDescription>
            Give a specific user direct access to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          <UserSearchPicker
            selectedUser={selectedUser}
            onSelect={onSelectUser}
            excludeIds={excludeIds}
            excludePlatformAdmins
            label="User"
            placeholder="Search users by email or name..."
          />
          <div className="space-y-1.5">
            <Label>
              <span className="inline-flex items-center">
                Role
                <InfoTooltip content="The role this user will have within the project." />
              </span>
            </Label>
            <Select value={grantRole} onValueChange={onGrantRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <div aria-live="polite">
              {managerIsOneWay && grantRole === "manager" && (
                <p className={states.warning}>{MANAGER_LOCK_NOTICE}</p>
              )}
            </div>
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
          <Button onClick={onGrant} disabled={granting || !selectedUser}>
            {granting ? "Granting..." : "Grant Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
