import type { UserListResponse } from "@/types"
import { card } from "@/styles"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/utils/format"

export function AccountCard({
  user,
  isSelf,
  avatarUploading,
  onToggleActive,
  onPickPhoto,
  onRemovePhoto,
  onDelete,
}: {
  user: UserListResponse
  isSelf: boolean
  avatarUploading: boolean
  onToggleActive: () => void
  onPickPhoto: () => void
  onRemovePhoto: () => void
  onDelete: () => void
}) {
  return (
    <div className={cn(card.base, "flex flex-col gap-4 p-[1.375rem]")}>
      <h4 className="text-[0.96875rem] font-bold text-fg-strong">Account</h4>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.84375rem] font-semibold text-fg-strong">
            {user.is_active ? "Active" : "Inactive"}
          </span>
          <span className="text-[0.71875rem] text-fg-subtle">
            Toggling has no confirmation. Auth cache may take up to 5 min to apply (I-05).
          </span>
        </div>
        <Switch checked={user.is_active} onCheckedChange={onToggleActive} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.84375rem] font-semibold text-fg-strong">Profile photo</span>
          <span className="text-[0.71875rem] text-fg-subtle">
            Helps tell people apart in lists and access tables.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            disabled={avatarUploading}
            onClick={onPickPhoto}
            className="text-[0.78125rem] font-semibold text-accent hover:underline disabled:opacity-50"
          >
            {avatarUploading ? "Uploading…" : "Upload"}
          </button>
          {user.avatar_url && (
            <button
              type="button"
              disabled={avatarUploading}
              onClick={onRemovePhoto}
              className="text-[0.78125rem] font-semibold text-on-accent-soft hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <span className="border-t border-line pt-3.5 text-[0.78125rem] text-fg-subtle">
        Created {formatDate(user.created_at)}
      </span>

      {!isSelf && (
        <Button
          variant="outline-destructive"
          size="sm"
          className="self-start"
          onClick={onDelete}
        >
          Delete user…
        </Button>
      )}
    </div>
  )
}
