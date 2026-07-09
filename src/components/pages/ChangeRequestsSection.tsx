import { useCallback, useEffect, useState } from "react"
import { Inbox, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { changeRequestsAPI } from "@/services/api"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
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
import { FilterBar } from "@/components/common/FilterBar"
import { ChangeRequestCard } from "@/components/pages/changeRequests/ChangeRequestCard"

interface ChangeRequestsSectionProps {
  kinds: ChangeRequestKind[]
  emptyLabel: string
  onReviewed?: () => void
}

export function ChangeRequestsSection({ kinds, emptyLabel, onReviewed }: ChangeRequestsSectionProps) {
  const kindKey = kinds.join(",")
  const fetchLanguages = useLanguagesStore((s) => s.fetch)
  const [requests, setRequests] = useState<ChangeRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("pending")
  const [reviewTarget, setReviewTarget] = useState<ChangeRequestResponse | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved")
  const [reason, setReason] = useState("")
  const [grantManager, setGrantManager] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus === "all" ? {} : { status: filterStatus }
      const { data } = await changeRequestsAPI.list(params)
      const allowed = new Set(kindKey.split(","))
      setRequests(data.filter((r) => allowed.has(r.kind)))
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
      if (reviewAction === "approved" && reviewTarget.new_language_name) {
        // Approval also created a new language — refresh the store so
        // project cards resolve its name instead of showing the raw id.
        useLanguagesStore.getState().invalidate()
        await useLanguagesStore.getState().fetch()
      }
      setReviewTarget(null)
      await fetchRequests()
      onReviewed?.()
    } catch {
      toast.error("Failed to review request")
    } finally {
      setSubmitting(false)
    }
  }

  const isApprove = reviewAction === "approved"
  const isProjectReview = reviewTarget?.kind === "create_project"

  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "status",
            label: "All Statuses",
            value: filterStatus,
            onChange: setFilterStatus,
            className: "w-full sm:w-44",
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All Statuses" },
            ],
          },
        ]}
        resultLabel={loading ? "..." : `${requests.length} request${requests.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filterStatus === "pending" ? "No pending requests" : "No requests"}
          description={emptyLabel}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <ChangeRequestCard
              key={req.id}
              req={req}
              showStatus={req.status !== "pending"}
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
              <span className="font-medium text-preto">
                {reviewTarget?.requester_display_name || reviewTarget?.requester_email}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {isApprove && isProjectReview && reviewTarget?.new_language_name && (
              <p className="text-xs text-verde/60 rounded-lg bg-surface-alt/50 p-2.5">
                Accepting will also create the new language{" "}
                <span className="font-medium text-preto">
                  {reviewTarget.new_language_name}
                  {reviewTarget.new_language_code ? ` (${reviewTarget.new_language_code})` : ""}
                </span>
                .
              </p>
            )}
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
                  isApprove
                    ? "Any notes for the requester..."
                    : "Why is this request being rejected..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-verde/50">
                Shared with the requester in their requests view.
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
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
