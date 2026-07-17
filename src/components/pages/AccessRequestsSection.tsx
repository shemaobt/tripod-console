import { useEffect, useState, useCallback, useMemo } from "react"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { accessRequestsAPI } from "@/services/api"
import type { AccessRequestResponse, UserListResponse, AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { FilterBar } from "@/components/common/FilterBar"
import { ReviewDialog } from "@/components/pages/ReviewDialog"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatDate, timeAgo } from "@/utils/format"

const statusMeta: Record<string, { dot: string; label: string }> = {
  pending: { dot: "bg-st-info", label: "Pending" },
  approved: { dot: "bg-st-ok", label: "Approved" },
  rejected: { dot: "bg-st-warn", label: "Rejected" },
}

const statusChips = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

interface AccessRequestsSectionProps {
  users: UserListResponse[]
  apps: AppResponse[]
  onReviewed?: () => void
}

export function AccessRequestsSection({ users, apps, onReviewed }: AccessRequestsSectionProps) {
  const [requests, setRequests] = useState<AccessRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [reviewTarget, setReviewTarget] = useState<AccessRequestResponse | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved")

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const appMap = useMemo(() => new Map(apps.map((a) => [a.app_key, a])), [apps])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params: { app_key?: string; status?: string } = {}
      if (filterApp !== "all") params.app_key = filterApp
      if (filterStatus !== "all") params.status = filterStatus
      const { data } = await accessRequestsAPI.list(params)
      setRequests(data)
    } catch {
      toast.error("Failed to load access requests")
    } finally {
      setLoading(false)
    }
  }, [filterApp, filterStatus])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  async function handleReview(requestId: string, status: "approved" | "rejected", reason?: string) {
    try {
      await accessRequestsAPI.review(requestId, { status, reason })
      toast.success(`Request ${status}`)
      fetchRequests()
      onReviewed?.()
    } catch {
      toast.error(`Failed to ${status === "approved" ? "approve" : "reject"} request`)
      throw new Error("review failed")
    }
  }

  function openReview(req: AccessRequestResponse, action: "approved" | "rejected") {
    setReviewTarget(req)
    setReviewAction(action)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterBar
          filters={[
            {
              key: "app",
              label: "All Apps",
              value: filterApp,
              onChange: setFilterApp,
              className: "w-full sm:w-48",
              options: [
                { value: "all", label: "All Apps" },
                ...apps.map((app) => ({ value: app.app_key, label: app.name })),
              ],
            },
          ]}
        />
        {statusChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setFilterStatus(chip.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
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
          title="No access requests"
          description="Access requests from users will appear here. You can filter by app or status."
        />
      ) : (
        <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] overflow-hidden">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              user={userMap.get(req.user_id)}
              appName={appMap.get(req.app_key)?.name ?? req.app_key}
              onApprove={() => openReview(req, "approved")}
              onReject={() => openReview(req, "rejected")}
            />
          ))}
        </div>
      )}

      <ReviewDialog
        open={reviewTarget !== null}
        onOpenChange={(open) => { if (!open) setReviewTarget(null) }}
        request={reviewTarget}
        action={reviewAction}
        userEmail={reviewTarget ? (userMap.get(reviewTarget.user_id)?.email ?? reviewTarget.user_id) : undefined}
        onSubmit={handleReview}
      />
    </div>
  )
}

interface RequestCardProps {
  req: AccessRequestResponse
  user: UserListResponse | undefined
  appName: string
  onApprove: () => void
  onReject: () => void
}

function RequestCard({ req, user, appName, onApprove, onReject }: RequestCardProps) {
  const isPending = req.status === "pending"
  const status = statusMeta[req.status] ?? statusMeta.pending
  const userName = user?.display_name || user?.email || req.user_id
  const emailPart = user?.display_name ? user.email : null

  return (
    <div className="flex items-start gap-3.5 px-5 py-4 border-b border-line last:border-b-0">
      <UserAvatar
        id={req.user_id}
        name={user?.display_name ?? null}
        email={user?.email ?? req.user_id}
        avatarUrl={user?.avatar_url ?? null}
        size="sm"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-fg-strong">
          {userName} <span className="font-normal text-fg-subtle">→</span> {appName}
        </p>
        <p className="text-xs text-fg-subtle">
          {emailPart ? `${emailPart} · ` : ""}
          {timeAgo(req.requested_at)}
        </p>
        {req.note && (
          <p className="font-serif italic text-[12.5px] text-fg-muted leading-relaxed">
            &ldquo;{req.note}&rdquo;
          </p>
        )}
        {!isPending && req.review_reason && (
          <p className="text-xs text-fg-subtle">Review note: {req.review_reason}</p>
        )}
        {!isPending && req.reviewed_at && (
          <p className="text-xs text-fg-subtle tabular-nums">
            Reviewed on {formatDate(req.reviewed_at)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-none pt-0.5">
        <span className="inline-flex items-center gap-2 text-[13px] text-fg-muted">
          <span className={cn("w-2 h-2 rounded-full", status.dot)} />
          {status.label}
        </span>
        {isPending && (
          <div className="flex items-center gap-2.5 text-[13px] font-semibold">
            <button type="button" onClick={onApprove} className="text-accent hover:underline">
              Approve
            </button>
            <span className="text-fg-subtle">·</span>
            <button
              type="button"
              onClick={onReject}
              className="text-fg-muted hover:text-on-accent-soft"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
