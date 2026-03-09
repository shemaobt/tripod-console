import { useEffect, useState, useCallback, useMemo } from "react"
import { Check, X, Inbox, Filter, CheckCircle2, XCircle, Clock } from "lucide-react"
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
      {/* Filter bar */}
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
        <div className="space-y-3">
          {requests.map((req) => {
            const user = userMap.get(req.user_id)
            const initial = (user?.email?.[0] ?? "?").toUpperCase()
            const config = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending
            const StatusIcon = config.icon

            return (
              <div
                key={req.id}
                className={cn(
                  "rounded-2xl border bg-surface shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md",
                  req.status === "pending" ? "border-areia/30" : "border-areia/20",
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
                  {/* Avatar */}
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 ring-1",
                    req.status === "pending"
                      ? "bg-gradient-to-br from-telha/20 to-telha/5 ring-telha/15"
                      : req.status === "approved"
                        ? "bg-gradient-to-br from-verde-claro/20 to-verde-claro/5 ring-verde-claro/15"
                        : "bg-gradient-to-br from-areia/30 to-areia/10 ring-areia/20",
                  )}>
                    <span className={cn(
                      "text-sm font-semibold",
                      req.status === "pending" ? "text-telha" : req.status === "approved" ? "text-verde-claro" : "text-verde",
                    )}>
                      {initial}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-preto truncate">
                        {user?.display_name || user?.email || req.user_id}
                      </p>
                      <Badge variant="default">{req.app_key}</Badge>
                      <Badge variant={config.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-verde/60">
                      {user?.display_name && (
                        <span className="truncate">{user.email}</span>
                      )}
                      {req.note && (
                        <>
                          <span className="text-areia">|</span>
                          <span className="truncate max-w-[200px] italic">&ldquo;{req.note}&rdquo;</span>
                        </>
                      )}
                      <span className="tabular-nums shrink-0">{timeAgo(req.requested_at)}</span>
                    </div>
                    {req.status !== "pending" && req.review_reason && (
                      <p className="text-xs text-verde/50 mt-1.5 italic">
                        Reason: {req.review_reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-verde-claro border-verde-claro/30 hover:bg-verde-claro/10 hover:border-verde-claro/50"
                        onClick={() => openReview(req, "approved")}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800/40 dark:hover:bg-red-950/30 dark:hover:border-red-700/50"
                        onClick={() => openReview(req, "rejected")}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  )}

                  {req.status !== "pending" && (
                    <span className="text-xs text-verde/50 shrink-0 tabular-nums">
                      {req.reviewed_at ? formatDate(req.reviewed_at) : ""}
                    </span>
                  )}
                </div>
              </div>
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
