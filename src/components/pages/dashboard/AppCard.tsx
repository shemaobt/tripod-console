import { LayoutGrid, ExternalLink, Smartphone, ArrowUpRight, Shield, CircleSlash } from "lucide-react"
import type { UserAppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

function platformLabel(platform: string | null): string {
  switch (platform) {
    case "ios":
      return "iOS"
    case "android":
      return "Android"
    case "mobile":
      return "Mobile"
    case "both":
      return "Web + Mobile"
    default:
      return "Web"
  }
}

export function AppCard({ app }: { app: UserAppResponse }) {
  const hasLinks = app.app_url || app.ios_url || app.android_url

  return (
    <div className={cn(
      "group relative rounded-2xl border bg-surface overflow-hidden transition-all duration-200",
      app.is_active
        ? "border-areia/20 hover:shadow-lg hover:border-telha/25 hover:-translate-y-0.5"
        : "border-areia/15 opacity-70",
    )}>
      {/* Decorative top accent */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        app.is_active
          ? "from-telha/60 via-azul/40 to-verde-claro/40"
          : "from-areia/40 via-areia/20 to-areia/10",
      )} />

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.name}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border border-areia/15 shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-azul/20 to-azul/5 flex items-center justify-center ring-1 ring-azul/10">
              <LayoutGrid className="h-6 w-6 sm:h-7 sm:w-7 text-azul" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-preto tracking-tight truncate">
                {app.name}
              </h3>
              {hasLinks && app.is_active && (
                <ArrowUpRight className="h-4 w-4 text-verde/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </div>
            {app.description && (
              <p className="text-sm text-verde/70 mt-1.5 line-clamp-2 leading-relaxed">{app.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {!app.is_active && (
            <Badge variant="inactive" className="gap-1">
              <CircleSlash className="h-3 w-3" />
              Inactive
            </Badge>
          )}
          {app.is_platform_admin && (
            <Badge variant="admin" className="gap-1">
              <Shield className="h-3 w-3" />
              Platform Admin
            </Badge>
          )}
          {app.roles.map((role) => (
            <Badge key={role} variant="default">{role}</Badge>
          ))}
          {!app.is_platform_admin && app.roles.length === 0 && (
            <Badge variant="inactive">No role</Badge>
          )}
          <Badge variant="success">{platformLabel(app.platform)}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-areia/10">
          {app.app_url && app.is_active && (
            <a
              href={app.app_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Launch
            </a>
          )}
          {app.ios_url && app.is_active && (
            <a
              href={app.ios_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <Smartphone className="h-3.5 w-3.5" />
              iOS
            </a>
          )}
          {app.android_url && app.is_active && (
            <a
              href={app.android_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Android
            </a>
          )}
          {(!hasLinks || !app.is_active) && (
            <span className="text-xs text-verde/40 italic">
              {!app.is_active ? "App is currently inactive" : "No launch links available"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
