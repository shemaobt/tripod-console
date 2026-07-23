import { Link } from "react-router-dom"
import { LayoutGrid } from "lucide-react"
import type { UserAppResponse } from "@/types"
import { EmptyState } from "@/components/common/EmptyState"
import { AppCard } from "./AppCard"

export function MyAppsCard({
  apps,
  showManageLink,
}: {
  apps: UserAppResponse[]
  showManageLink: boolean
}) {
  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-[0.96875rem] font-semibold text-fg-strong">My apps</h4>
        {showManageLink && (
          <Link to="/app/apps" className="text-[0.78125rem] font-semibold text-accent hover:underline">
            Manage apps →
          </Link>
        )}
      </div>
      {apps.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="You don't have access to any apps yet"
          description="Contact your administrator to request access. Once you're granted a role, your apps will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
