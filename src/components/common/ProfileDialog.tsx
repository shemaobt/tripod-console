import { useState, useEffect } from "react"
import { User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { authAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/common/ImageUpload"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && user) {
      setDisplayName(user.display_name || "")
      setAvatarUrl(user.avatar_url)
    }
  }, [open, user])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: { display_name?: string; avatar_url?: string | null } = {}

      if (displayName !== (user?.display_name || "")) {
        payload.display_name = displayName
      }
      if (avatarUrl !== user?.avatar_url) {
        payload.avatar_url = avatarUrl ?? ""
      }

      if (Object.keys(payload).length === 0) {
        onOpenChange(false)
        return
      }

      await authAPI.updateMe(payload)
      await refreshUser()
      toast.success("Profile updated")
      onOpenChange(false)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      toast.error(detail || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name and profile photo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="flex justify-center py-2">
            <ImageUpload
              value={avatarUrl}
              onChange={setAvatarUrl}
              folder="avatars"
              shape="circle"
              size="lg"
              placeholder={<UserIcon className="h-8 w-8 text-fg-subtle" />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-display-name">Display Name</Label>
            <Input
              id="profile-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
            <p className="text-xs text-fg-subtle mt-1.5">
              Email cannot be changed
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
