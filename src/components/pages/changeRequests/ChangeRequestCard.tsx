import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FolderPlus,
  Languages,
  MessageSquare,
  Pencil,
  Sparkles,
  X,
  XCircle,
} from "lucide-react"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/pages/UsersPage/UserAvatar"
import { formatDate, timeAgo } from "@/utils/format"

const kindConfig: Record<
  ChangeRequestKind,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  create_project: { label: "New project", icon: FolderPlus },
  create_language: { label: "New language", icon: Languages },
  edit_language: { label: "Edit language", icon: Pencil },
}

const statusConfig = {
  pending: { variant: "default" as const, icon: Clock, label: "Pending" },
  approved: { variant: "success" as const, icon: CheckCircle2, label: "Approved" },
  rejected: { variant: "error" as const, icon: XCircle, label: "Rejected" },
}

interface ChangeRequestCardProps {
  req: ChangeRequestResponse
  showStatus?: boolean
  onApprove?: () => void
  onReject?: () => void
}

export function ChangeRequestCard({
  req,
  showStatus = false,
  onApprove,
  onReject,
}: ChangeRequestCardProps) {
  // Subscribe to the languages array (not the stable getLanguageName ref) so the
  // card re-renders and resolves names once languages finish loading.
  const languages = useLanguagesStore((s) => s.languages)
  const config = kindConfig[req.kind]
  const KindIcon = config.icon
  const isPending = req.status === "pending"
  const canReview = isPending && (onApprove || onReject)
  const status = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending
  const StatusIcon = status.icon

  const newLanguage = req.new_language_name
    ? `${req.new_language_name}${req.new_language_code ? ` (${req.new_language_code})` : ""}`
    : null
  const existingLang = req.language_id ? languages.find((l) => l.id === req.language_id) : null
  const existingLanguage = req.language_id
    ? existingLang
      ? `${existingLang.name} (${existingLang.code})`
      : req.language_id
    : null

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
              <p className="text-xs text-verde/50 truncate mt-0.5">{req.requester_email}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant="default">
              <KindIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {showStatus && (
              <Badge variant={status.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1 rounded-lg bg-surface-alt/50 p-3">
          {req.name && (
            <p className="text-sm text-preto">
              <span className="text-verde/50">
                {req.kind === "create_project" ? "Project:" : "Name:"}
              </span>{" "}
              {req.name}
            </p>
          )}
          {req.kind === "create_project" && (newLanguage || existingLanguage) && (
            <p className="text-sm text-preto flex items-center flex-wrap gap-1.5">
              <span className="text-verde/50">Language:</span>
              {newLanguage ?? existingLanguage}
              {newLanguage && (
                <Badge variant="success" className="ml-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
            </p>
          )}
          {req.kind === "edit_language" && existingLanguage && (
            <p className="text-sm text-preto">
              <span className="text-verde/50">Target:</span> {existingLanguage}
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

        <div className="mt-3 flex items-center gap-3">
          <span className="text-[11px] text-verde/40 tabular-nums flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {timeAgo(req.requested_at)}
          </span>
          {req.grant_manager_access && req.status === "approved" && req.kind === "create_project" && (
            <span className="text-[11px] text-verde-claro/80">Manager access granted</span>
          )}
        </div>

        {req.status !== "pending" && req.review_reason && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-alt/50 p-2.5">
            <MessageSquare className="h-3.5 w-3.5 text-verde/30 mt-0.5 shrink-0" />
            <p className="text-xs text-verde/60 italic leading-relaxed">
              Review: &ldquo;{req.review_reason}&rdquo;
            </p>
          </div>
        )}

        {req.status !== "pending" && req.reviewed_at && (
          <p className="mt-3 text-[11px] text-verde/40 tabular-nums">
            Reviewed on {formatDate(req.reviewed_at)}
          </p>
        )}

        {canReview && (
          <div className="mt-4 pt-3.5 border-t border-areia/15 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-verde-claro border-verde-claro/30 hover:bg-verde-claro/10 hover:border-verde-claro/50"
              onClick={onApprove}
            >
              <Check className="h-3.5 w-3.5" />
              Accept
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
