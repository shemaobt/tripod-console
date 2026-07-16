import { Sparkles } from "lucide-react"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/pages/UsersPage/UserAvatar"
import { formatDate, timeAgo } from "@/utils/format"

const kindLabel: Record<ChangeRequestKind, string> = {
  create_project: "New project",
  create_language: "New language",
  edit_language: "Edit language",
}

const statusMeta: Record<string, { dot: string; label: string }> = {
  pending: { dot: "bg-st-info", label: "Pending" },
  approved: { dot: "bg-st-ok", label: "Approved" },
  rejected: { dot: "bg-st-warn", label: "Rejected" },
}

interface ChangeRequestCardProps {
  req: ChangeRequestResponse
  onApprove?: () => void
  onReject?: () => void
}

export function ChangeRequestCard({ req, onApprove, onReject }: ChangeRequestCardProps) {
  const languages = useLanguagesStore((s) => s.languages)
  const isPending = req.status === "pending"
  const canReview = isPending && (onApprove || onReject)
  const status = statusMeta[req.status] ?? statusMeta.pending

  const newLanguage = req.new_language_name
    ? `${req.new_language_name}${req.new_language_code ? ` (${req.new_language_code})` : ""}`
    : null
  const existingLang = req.language_id ? languages.find((l) => l.id === req.language_id) : null
  const existingLanguage = req.language_id
    ? existingLang
      ? `${existingLang.name} (${existingLang.code})`
      : req.language_id
    : null

  let title = kindLabel[req.kind]
  if (req.kind === "create_language" && req.name) {
    title += ` — ${req.name}${req.code ? ` (${req.code})` : ""}`
  } else if (req.kind === "edit_language") {
    const from = existingLang ? existingLang.name : existingLanguage ?? "?"
    const to = `${req.name || existingLang?.name || ""}${req.code ? ` (${req.code})` : ""}`.trim()
    title += ` — ${from}${to ? ` → ${to}` : ""}`
  } else if (req.kind === "create_project" && req.name) {
    title += ` — ${req.name}`
  }

  const projectLanguage = req.kind === "create_project" ? newLanguage ?? existingLanguage : null
  const managerGranted =
    req.grant_manager_access && req.status === "approved" && req.kind === "create_project"

  return (
    <div className="flex items-start gap-3.5 px-5 py-4 border-b border-line last:border-b-0">
      <UserAvatar
        name={req.requester_display_name}
        email={req.requester_email}
        avatarUrl={null}
        size="sm"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-fg-strong">{title}</p>
        <p className="text-xs text-fg-subtle">
          {req.requester_display_name || req.requester_email} · {timeAgo(req.requested_at)}
        </p>
        {projectLanguage && (
          <p className="text-xs text-fg-muted flex items-center flex-wrap gap-1.5">
            <span className="text-fg-subtle">Language:</span>
            {projectLanguage}
            {newLanguage && (
              <Badge variant="success">
                <Sparkles className="h-3 w-3" />
                New
              </Badge>
            )}
          </p>
        )}
        {req.description && (
          <p className="text-xs text-fg-muted leading-relaxed">{req.description}</p>
        )}
        {managerGranted && <p className="text-xs text-st-ok">Manager access granted</p>}
        {req.review_reason && (
          <p className="font-serif italic text-[12.5px] text-fg-muted leading-relaxed">
            &ldquo;{req.review_reason}&rdquo;
          </p>
        )}
        {req.status !== "pending" && req.reviewed_at && (
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
        {canReview && (
          <div className="flex items-center gap-2.5 text-[13px] font-semibold">
            {onApprove && (
              <button type="button" onClick={onApprove} className="text-accent hover:underline">
                Accept
              </button>
            )}
            {onApprove && onReject && <span className="text-fg-subtle">·</span>}
            {onReject && (
              <button
                type="button"
                onClick={onReject}
                className="text-fg-muted hover:text-on-accent-soft"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
