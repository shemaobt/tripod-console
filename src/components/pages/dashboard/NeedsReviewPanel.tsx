import { Link } from "react-router-dom"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatDate } from "@/utils/format"
import type { AdminDashboardData } from "./useAdminDashboardData"

interface ReviewItem {
  id: string
  avatarId: string
  name: string | null
  email: string
  avatarUrl: string | null
  title: string
  subtitle: string
  to: string
  requestedAt: string
}

const kindLabel: Record<string, string> = {
  create_project: "New project",
  create_language: "New language",
  edit_language: "Edit language",
}

function kindRoute(kind: string) {
  return kind === "create_project" ? "/app/projects" : "/app/languages"
}

export function NeedsReviewPanel({ data }: { data: AdminDashboardData }) {
  const userMap = new Map(data.users.map((u) => [u.id, u]))
  const appNameMap = new Map(data.apps.map((a) => [a.app_key, a.name]))

  const accessItems: ReviewItem[] = data.pendingAccess.map((req) => {
    const user = userMap.get(req.user_id)
    const appName = appNameMap.get(req.app_key) ?? req.app_key
    return {
      id: `access-${req.id}`,
      avatarId: req.user_id,
      name: user?.display_name ?? null,
      email: user?.email ?? req.user_id,
      avatarUrl: user?.avatar_url ?? null,
      title: user?.display_name || user?.email || req.user_id,
      subtitle: `Access to ${appName}${req.note ? ` · ${req.note}` : ""}`,
      to: "/app/users",
      requestedAt: req.requested_at,
    }
  })

  const changeItems: ReviewItem[] = data.pendingChange.map((req) => ({
    id: `change-${req.id}`,
    avatarId: req.requester_user_id,
    name: req.requester_display_name,
    email: req.requester_email,
    avatarUrl: userMap.get(req.requester_user_id)?.avatar_url ?? null,
    title: req.requester_display_name || req.requester_email,
    subtitle: `${kindLabel[req.kind] ?? "Request"}${req.name ? ` · ${req.name}` : ""}`,
    to: kindRoute(req.kind),
    requestedAt: req.requested_at,
  }))

  const publicItems: ReviewItem[] = data.pendingPublic.map((req) => ({
    id: `public-${req.id}`,
    avatarId: req.requester_email,
    name: req.requester_name,
    email: req.requester_email,
    avatarUrl: null,
    title: req.requester_name,
    subtitle: `Public request · ${kindLabel[req.kind] ?? "Request"}${req.name ? ` · ${req.name}` : ""}`,
    to: kindRoute(req.kind),
    requestedAt: req.requested_at,
  }))

  const recent = [...accessItems, ...changeItems, ...publicItems]
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5)

  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-5 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[0.96875rem] font-semibold text-fg-strong">Needs review</h4>
        <Link to="/app/users" className="text-[0.78125rem] font-semibold text-accent hover:underline">
          All requests →
        </Link>
      </div>
      {recent.length > 0 ? (
        <div className="flex flex-col">
          {recent.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-[0.6875rem] py-[0.6875rem] border-b border-line last:border-b-0"
            >
              <UserAvatar
                id={item.avatarId}
                name={item.name}
                email={item.email}
                avatarUrl={item.avatarUrl}
                size="xs"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[0.84375rem] font-semibold text-fg-strong truncate">
                  {item.title}
                </span>
                <span className="text-[0.71875rem] text-fg-subtle truncate">
                  {item.subtitle} · {formatDate(item.requestedAt)}
                </span>
              </div>
              <Link
                to={item.to}
                className="text-[0.78125rem] font-semibold text-accent hover:underline shrink-0"
              >
                Review →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.8125rem] text-fg-subtle">
          Nothing pending. New access, change and public requests will appear here.
        </p>
      )}
    </div>
  )
}
