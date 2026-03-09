import { useEffect, useState, useCallback, useMemo } from "react"
import { Check, X, Inbox, Filter, CheckCircle2, XCircle, Clock, MessageSquare, Calendar } from "lucide-react"
import { toast } from "sonner"
import { accessRequestsAPI } from "@/services/api"
import type { AccessRequestResponse, UserListResponse, AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { ReviewDialog } from "@/components/pages/ReviewDialog"
import { UserAvatar } from "@/components/pages/UsersPage/UserAvatar"
import { formatDate, timeAgo } from "@/utils/format"

const statusConfig = {
  pending: { variant: "default" as const, icon: Clock, label: "Pending" },
  approved: { variant: "success" as const, icon: CheckCircle2, label: "Approved" },
  rejected: { variant: "error" as const, icon: XCircle, label: "Rejected" },
}

interface AccessRequestsSectionProps {
  users: UserListResponse[]
  apps: AppResponse[]
}

export function AccessRequestsSection({ users, apps }: AccessRequestsSectionProps) {
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
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-areia/15 bg-surface-alt/30 p-3.5">
        <Filter className="h-4 w-4 text-verde/40" />
        <Select value={filterApp} onValueChange={setFilterApp}>
          <SelectTrigger className="w-full sm:w-48 bg-surface">
            <SelectValue placeholder="All Apps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Apps</SelectItem>
            {apps.map((app) => (
              <SelectItem key={app.id} value={app.app_key}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40 bg-surface">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-verde/60 tabular-nums ml-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const user = userMap.get(req.user_id)
            const app = appMap.get(req.app_key)
            const config = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending
            const StatusIcon = config.icon

            return (
              <RequestCard
                key={req.id}
                req={req}
                user={user}
                appName={app?.name ?? req.app_key}
                config={config}
                StatusIcon={StatusIcon}
                onApprove={() => openReview(req, "approved")}
                onReject={() => openReview(req, "rejected")}
              />
            )
          })}
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
  config: { variant: "default" | "success" | "error"; label: string }
  StatusIcon: React.ComponentType<{ className?: string }>
  onApprove: () => void
  onReject: () => void
}

function RequestCard({ req, user, appName, config, StatusIcon, onApprove, onReject }: RequestCardProps) {
  const isPending = req.status === "pending"

  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md",
        isPending ? "border-telha/20" : "border-areia/20",
      )}
    >
      {isPending && (
        <div className="h-0.5 bg-gradient-to-r from-telha/60 via-telha/30 to-transparent" />
      )}

      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <UserAvatar
            name={user?.display_name ?? null}
            email={user?.email ?? req.user_id}
            avatarUrl={user?.avatar_url ?? null}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-preto truncate">
              {user?.display_name || user?.email || req.user_id}
            </p>
            {user?.display_name && (
              <p className="text-xs text-verde/50 truncate mt-0.5">{user.email}</p>
            )}
          </div>

          <Badge variant={config.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-azul/10 px-2.5 py-1 text-xs font-medium text-azul dark:bg-azul/20">
            {appName}
          </span>
          <span className="text-[11px] text-verde/40 tabular-nums ml-auto flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {timeAgo(req.requested_at)}
          </span>
        </div>

        {req.note && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-alt/50 p-2.5">
            <MessageSquare className="h-3.5 w-3.5 text-verde/30 mt-0.5 shrink-0" />
            <p className="text-xs text-verde/60 italic leading-relaxed">
              &ldquo;{req.note}&rdquo;
            </p>
          </div>
        )}

        {req.status !== "pending" && req.review_reason && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-alt/50 p-2.5">
            <MessageSquare className="h-3.5 w-3.5 text-verde/30 mt-0.5 shrink-0" />
            <p className="text-xs text-verde/50 italic leading-relaxed">
              Review: &ldquo;{req.review_reason}&rdquo;
            </p>
          </div>
        )}

        {req.status !== "pending" && req.reviewed_at && (
          <p className="mt-3 text-[11px] text-verde/40 tabular-nums">
            Reviewed on {formatDate(req.reviewed_at)}
          </p>
        )}

        {isPending && (
          <div className="mt-4 pt-3.5 border-t border-areia/15 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-verde-claro border-verde-claro/30 hover:bg-verde-claro/10 hover:border-verde-claro/50"
              onClick={onApprove}
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800/40 dark:hover:bg-red-950/30 dark:hover:border-red-700/50"
              onClick={onReject}
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
