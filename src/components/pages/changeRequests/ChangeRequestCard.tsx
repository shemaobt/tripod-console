import { Globe, Sparkles } from "lucide-react"
import type { ChangeRequestKind } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/common/UserAvatar"
import type { ReviewableRequest } from "@/components/pages/changeRequests/reviewableRequest"
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
  req: ReviewableRequest
  onApprove?: () => void
  onReject?: () => void
}

export function ChangeRequestCard({ req, onApprove, onReject }: ChangeRequestCardProps) {
  const languages = useLanguagesStore((s) => s.languages)
  const isPending = req.status === "pending"
  const canReview = isPending && (onApprove || onReject)
  const status = statusMeta[req.status] ?? statusMeta.pending
  const isPublic = req.origin === "public"

  const newLanguage = req.newLanguageName
    ? `${req.newLanguageName}${req.newLanguageCode ? ` (${req.newLanguageCode})` : ""}`
    : null
  const existingLang = req.languageId ? languages.find((l) => l.id === req.languageId) : null
  const existingLanguage = req.languageId
    ? existingLang
      ? `${existingLang.name} (${existingLang.code})`
      : req.languageId
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
    req.grantManagerAccess && req.status === "approved" && req.kind === "create_project"

  return (
    <div className="flex items-start gap-3.5 px-5 py-4 border-b border-line last:border-b-0">
      <UserAvatar
        id={req.requesterUserId ?? req.requesterEmail}
        name={req.requesterName}
        email={req.requesterEmail}
        avatarUrl={null}
        size="sm"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-fg-strong flex items-center flex-wrap gap-1.5">
          {title}
          {isPublic && (
            <Badge variant="default">
              <Globe className="h-3 w-3" />
              Public
            </Badge>
          )}
        </p>
        <p className="text-xs text-fg-subtle">
          {isPublic
            ? `${req.requesterName} · ${req.requesterEmail}`
            : req.requesterName || req.requesterEmail}{" "}
          · {timeAgo(req.requestedAt)}
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
        {req.reviewReason && (
          <p className="font-serif italic text-[0.78125rem] text-fg-muted leading-relaxed">
            &ldquo;{req.reviewReason}&rdquo;
          </p>
        )}
        {req.status !== "pending" && req.reviewedAt && (
          <p className="text-xs text-fg-subtle tabular-nums">
            Reviewed on {formatDate(req.reviewedAt)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-none pt-0.5">
        <span className="inline-flex items-center gap-2 text-[0.8125rem] text-fg-muted">
          <span className={cn("w-2 h-2 rounded-full", status.dot)} />
          {status.label}
        </span>
        {canReview && (
          <div className="flex items-center gap-2.5 text-[0.8125rem] font-semibold">
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
