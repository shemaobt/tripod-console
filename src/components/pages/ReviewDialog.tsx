import { useState } from "react"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils/cn"
import type { AccessRequestResponse } from "@/types"

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: AccessRequestResponse | null
  action: "approved" | "rejected"
  userEmail?: string
  onSubmit: (requestId: string, status: "approved" | "rejected", reason?: string) => Promise<void>
}

export function ReviewDialog({
  open,
  onOpenChange,
  request,
  action,
  userEmail,
  onSubmit,
}: ReviewDialogProps) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isApprove = action === "approved"

  async function handleSubmit() {
    if (!request) return
    setSubmitting(true)
    try {
      await onSubmit(request.id, action, reason || undefined)
      setReason("")
      onOpenChange(false)
    } catch {
      // Error is handled by the parent's onSubmit via toast
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) { onOpenChange(v); setReason("") } }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn(
              "rounded-full p-2",
              isApprove ? "bg-verde-claro/15" : "bg-red-100 dark:bg-red-950/30",
            )}>
              {isApprove ? (
                <CheckCircle2 className="h-5 w-5 text-verde-claro" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <DialogTitle>{isApprove ? "Approve Request" : "Reject Request"}</DialogTitle>
              <DialogDescription>
                {isApprove ? "Grant" : "Deny"} access for <span className="font-medium text-preto">{userEmail ?? "user"}</span> to <span className="font-medium text-preto">{request?.app_key ?? "app"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="review-reason">Reason (optional)</Label>
          <Textarea
            id="review-reason"
            placeholder={isApprove ? "Any notes about granting access..." : "Why is this request being rejected..."}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); setReason("") }} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
