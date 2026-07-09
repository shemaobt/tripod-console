import { useCallback, useEffect, useState } from "react"
import {
  Calendar,
  Check,
  FolderPlus,
  Languages,
  Loader2,
  Pencil,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { changeRequestsAPI } from "@/services/api"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { UserAvatar } from "@/components/pages/UsersPage/UserAvatar"
import { timeAgo } from "@/utils/format"

const kindConfig: Record<
  ChangeRequestKind,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  create_project: { label: "New project", icon: FolderPlus },
  create_language: { label: "New language", icon: Languages },
  edit_language: { label: "Edit language", icon: Pencil },
}

interface ChangeRequestsSectionProps {
  kinds: ChangeRequestKind[]
  title: string
  description: string
}

export function ChangeRequestsSection({ kinds, title, description }: ChangeRequestsSectionProps) {
  const kindKey = kinds.join(",")
  const [requests, setRequests] = useState<ChangeRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState<ChangeRequestResponse | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved")
  const [reason, setReason] = useState("")
  const [grantManager, setGrantManager] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await changeRequestsAPI.list({ status: "pending" })
      const allowed = new Set(kindKey.split(","))
      setRequests(data.filter((r) => allowed.has(r.kind)))
    } catch {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }, [kindKey])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  function openReview(req: ChangeRequestResponse, action: "approved" | "rejected") {
    setReviewTarget(req)
    setReviewAction(action)
    setReason("")
    setGrantManager(false)
  }

  async function submitReview() {
    if (!reviewTarget) return
    setSubmitting(true)
    try {
      await changeRequestsAPI.review(reviewTarget.id, {
        status: reviewAction,
        reason: reason || undefined,
        grant_manager_access:
          reviewTarget.kind === "create_project" ? grantManager : undefined,
      })
      toast.success(reviewAction === "approved" ? "Request approved" : "Request rejected")
      setReviewTarget(null)
      fetchRequests()
    } catch {
      toast.error("Failed to review request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || requests.length === 0) {
    return loading ? <LoadingSpinner size="sm" /> : null
  }

  const isApprove = reviewAction === "approved"
  const isProjectReview = reviewTarget?.kind === "create_project"

  return (
    <div className="space-y-4 rounded-2xl border border-telha/20 bg-surface-alt/30 p-5">
      <div>
        <h3 className="text-base font-semibold text-preto tracking-tight">
          {title}
          <Badge variant="default" className="ml-2">
            {requests.length}
          </Badge>
        </h3>
        <p className="text-sm text-verde/60 mt-1">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => {
          const config = kindConfig[req.kind]
          const KindIcon = config.icon
          return (
            <div
              key={req.id}
              className="rounded-2xl border border-telha/20 bg-surface shadow-sm overflow-hidden"
            >
              <div className="h-0.5 bg-gradient-to-r from-telha/60 via-telha/30 to-transparent" />
              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  <UserAvatar
                    name={req.requester_display_name}
                    email={req.requester_email}
                    avatarUrl={null}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-preto truncate">
                      {req.requester_display_name || req.requester_email}
                    </p>
                    {req.requester_display_name && (
                      <p className="text-xs text-verde/50 truncate mt-0.5">
                        {req.requester_email}
                      </p>
                    )}
                  </div>
                  <Badge variant="default">
                    <KindIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1 rounded-lg bg-surface-alt/50 p-3">
                  {req.name && (
                    <p className="text-sm text-preto">
                      <span className="text-verde/50">Name:</span> {req.name}
                    </p>
                  )}
                  {req.code && (
                    <p className="text-sm text-preto">
                      <span className="text-verde/50">Code:</span> {req.code}
                    </p>
                  )}
                  {req.description && (
                    <p className="text-xs text-verde/60 leading-relaxed">{req.description}</p>
                  )}
                </div>

                <div className="mt-3 flex items-center">
                  <span className="text-[11px] text-verde/40 tabular-nums flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {timeAgo(req.requested_at)}
                  </span>
                </div>

                <div className="mt-4 pt-3.5 border-t border-areia/15 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-verde-claro border-verde-claro/30 hover:bg-verde-claro/10 hover:border-verde-claro/50"
                    onClick={() => openReview(req, "approved")}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800/40 dark:hover:bg-red-950/30"
                    onClick={() => openReview(req, "rejected")}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => {
          if (!open && !submitting) setReviewTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isApprove ? "Accept Request" : "Reject Request"}</DialogTitle>
            <DialogDescription>
              {isApprove ? "Accept" : "Reject"} the request from{" "}
              <span className="font-medium text-preto">
                {reviewTarget?.requester_display_name || reviewTarget?.requester_email}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {isApprove && isProjectReview && (
              <div className="flex items-start justify-between gap-4 rounded-lg border border-areia/20 bg-surface-alt/40 p-3">
                <div>
                  <Label htmlFor="grant-manager" className="text-sm text-preto">
                    Grant manager access
                  </Label>
                  <p className="text-xs text-verde/50 mt-0.5">
                    The requester becomes a manager of the new project and can view and edit it.
                  </p>
                </div>
                <Switch
                  id="grant-manager"
                  checked={grantManager}
                  onCheckedChange={setGrantManager}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="review-reason">Reason (optional)</Label>
              <Textarea
                id="review-reason"
                placeholder={
                  isApprove ? "Any notes..." : "Why is this request being rejected..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setReviewTarget(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={isApprove ? "default" : "destructive"}
              onClick={submitReview}
              disabled={submitting}
              className="gap-1.5"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isApprove ? "Accept" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
