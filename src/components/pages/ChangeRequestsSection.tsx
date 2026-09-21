import { useCallback, useEffect, useState } from "react"
import { Inbox, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { changeRequestsAPI, publicRequestsAPI } from "@/services/api"
import type { ChangeRequestKind, PublicRequestStatus } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { cn } from "@/utils/cn"
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
import { EmptyState } from "@/components/common/EmptyState"
import { ChangeRequestCard } from "@/components/pages/changeRequests/ChangeRequestCard"
import {
  byNewestFirst,
  fromChangeRequest,
  fromPublicRequest,
  type ReviewableRequest,
} from "@/components/pages/changeRequests/reviewableRequest"

const statusChips = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
]

interface ChangeRequestsSectionProps {
  kinds: ChangeRequestKind[]
  emptyLabel: string
  onReviewed?: () => void
}

export function ChangeRequestsSection({ kinds, emptyLabel, onReviewed }: ChangeRequestsSectionProps) {
  const kindKey = kinds.join(",")
  const fetchLanguages = useLanguagesStore((s) => s.fetch)
  const [requests, setRequests] = useState<ReviewableRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("pending")
  const [reviewTarget, setReviewTarget] = useState<ReviewableRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved")
  const [reason, setReason] = useState("")
  const [grantManager, setGrantManager] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const allowed = new Set(kindKey.split(","))
    const status = filterStatus === "all" ? undefined : filterStatus
    try {
      const [changeRes, publicRes] = await Promise.all([
        changeRequestsAPI.list(status ? { status } : {}),
        publicRequestsAPI
          .list(status ? { status: status as PublicRequestStatus } : undefined)
          .catch(() => null),
      ])
      if (!publicRes) toast.error("Failed to load public requests")
      const merged = [
        ...changeRes.data.filter((r) => allowed.has(r.kind)).map(fromChangeRequest),
        ...(publicRes?.data ?? [])
          .filter((r) => allowed.has(r.kind))
          .map(fromPublicRequest),
      ].sort(byNewestFirst)
      setRequests(merged)
    } catch {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }, [kindKey, filterStatus])

  useEffect(() => {
    fetchLanguages()
    fetchRequests()
  }, [fetchLanguages, fetchRequests])

  function openReview(req: ReviewableRequest, action: "approved" | "rejected") {
    setReviewTarget(req)
    setReviewAction(action)
    setReason("")
    setGrantManager(false)
  }

  async function submitReview() {
    if (!reviewTarget) return
    setSubmitting(true)
    try {
      if (reviewTarget.origin === "public") {
        await publicRequestsAPI.review(reviewTarget.id, {
          status: reviewAction,
          reason: reason || undefined,
        })
      } else {
        await changeRequestsAPI.review(reviewTarget.id, {
          status: reviewAction,
          reason: reason || undefined,
          grant_manager_access:
            reviewTarget.kind === "create_project" ? grantManager : undefined,
        })
      }
      toast.success(reviewAction === "approved" ? "Request approved" : "Request rejected")
      if (
        reviewAction === "approved" &&
        (reviewTarget.newLanguageName || reviewTarget.kind === "create_language")
      ) {
        useLanguagesStore.getState().invalidate()
        await useLanguagesStore.getState().fetch()
      }
      setReviewTarget(null)
      await fetchRequests()
      onReviewed?.()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("This request has already been reviewed")
        setReviewTarget(null)
        await fetchRequests()
      } else {
        toast.error("Failed to review request")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isApprove = reviewAction === "approved"
  const isProjectReview = reviewTarget?.kind === "create_project"
  const canGrantManager = isProjectReview && reviewTarget?.origin === "change"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {statusChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setFilterStatus(chip.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.78125rem] font-semibold transition-colors",
              filterStatus === chip.value
                ? "bg-inverse text-on-dark"
                : "bg-muted text-fg-muted hover:text-fg-strong",
            )}
          >
            {chip.label}
          </button>
        ))}
        <span className="text-xs text-fg-subtle tabular-nums ml-auto">
          {loading ? "..." : `${requests.length} request${requests.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filterStatus === "pending" ? "No pending requests" : "No requests"}
          description={emptyLabel}
        />
      ) : (
        <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] overflow-hidden">
          {requests.map((req) => (
            <ChangeRequestCard
              key={req.id}
              req={req}
              onApprove={() => openReview(req, "approved")}
              onReject={() => openReview(req, "rejected")}
            />
          ))}
        </div>
      )}

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
              <span className="font-semibold text-fg-strong">
                {reviewTarget?.requesterName || reviewTarget?.requesterEmail}
              </span>
              {reviewTarget?.origin === "public" ? " (public request, no account)" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {isApprove && isProjectReview && reviewTarget?.newLanguageName && (
              <p className="text-xs text-fg-muted rounded-[0.625rem] bg-muted p-2.5">
                Accepting will also create the new language{" "}
                <span className="font-semibold text-fg-strong">
                  {reviewTarget.newLanguageName}
                  {reviewTarget.newLanguageCode ? ` (${reviewTarget.newLanguageCode})` : ""}
                </span>
                .
              </p>
            )}
            {isApprove && canGrantManager && (
              <div className="flex items-start justify-between gap-4 rounded-[0.625rem] bg-muted p-3">
                <div>
                  <Label htmlFor="grant-manager" className="text-sm text-fg-strong">
                    Grant manager access
                  </Label>
                  <p className="text-xs text-fg-muted mt-0.5">
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
                  isApprove
                    ? "Any notes for the requester..."
                    : "Why is this request being rejected..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-fg-subtle">
                Shared with the requester in their requests view.
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-line pt-4 mt-2">
            <Button variant="outline" onClick={() => setReviewTarget(null)} disabled={submitting}>
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
