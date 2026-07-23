import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutGrid,
  Languages,
  FolderOpen,
  GitBranch,
  Globe,
  Users,
  AppWindow,
  LogOut,
  Sun,
  Moon,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { ProfileDialog } from "@/components/common/ProfileDialog"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useRequestCountsStore } from "@/stores/requestCountsStore"
import { useSidebarStore } from "@/stores/sidebarStore"

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItemDef {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface NavSectionDef {
  label: string
  items: NavItemDef[]
}

function NavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItemDef
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { icon: Icon, to, label, badge } = item
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "relative flex items-center rounded-[0.625rem] text-sm font-medium transition-colors",
          collapsed ? "justify-center w-11 h-11 mx-auto" : "gap-[0.6875rem] w-full px-2.5 py-2.5",
          isActive
            ? "bg-[var(--shell-active)] text-shell-fg"
            : "text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg",
        )
      }
    >
      <Icon className="w-[1.0625rem] h-[1.0625rem] shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="flex-1">{label}</span>}
      {badge ? (
        collapsed ? (
          <span className="absolute top-0.5 right-0.5 min-w-[0.9375rem] h-[0.9375rem] px-1 grid place-items-center bg-telha text-on-dark rounded-full text-[0.5625rem] font-bold leading-none">
            {badge}
          </span>
        ) : (
          <span className="bg-telha text-on-dark rounded-full text-[0.65625rem] font-bold px-[0.4375rem] py-px shrink-0">
            {badge}
          </span>
        )
      ) : null}
    </NavLink>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <div className="inline-flex bg-[rgba(246,245,235,0.07)] rounded-full p-[0.1875rem] shrink-0">
      <button
        onClick={() => setTheme("light")}
        title="Light theme"
        aria-label="Light theme"
        className={cn(
          "w-[1.875rem] h-[1.625rem] rounded-full grid place-items-center transition-colors",
          resolvedTheme === "light"
            ? "bg-[rgba(246,245,235,0.16)] text-shell-fg"
            : "text-[var(--shell-dim)] hover:text-shell-fg",
        )}
      >
        <Sun className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        title="Dark theme"
        aria-label="Dark theme"
        className={cn(
          "w-[1.875rem] h-[1.625rem] rounded-full grid place-items-center transition-colors",
          resolvedTheme === "dark"
            ? "bg-[rgba(246,245,235,0.16)] text-shell-fg"
            : "text-[var(--shell-dim)] hover:text-shell-fg",
        )}
      >
        <Moon className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

function ThemeToggleIcon() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Light theme" : "Dark theme"}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-[0.5625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" strokeWidth={2} /> : <Moon className="w-4 h-4" strokeWidth={2} />}
    </button>
  )
}

function SidebarContent({
  sections,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onProfile,
  onLogout,
  userId,
  userName,
  userEmail,
  userRole,
  avatarUrl,
}: {
  sections: NavSectionDef[]
  collapsed: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
  onProfile: () => void
  onLogout: () => void
  userId?: string
  userName: string
  userEmail: string
  userRole: string
  avatarUrl?: string | null
}) {
  return (
    <div className="flex flex-col h-full">
      {collapsed ? (
        <div className="flex justify-center pb-1">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="w-11 h-11 rounded-[0.625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors"
          >
            <PanelLeftOpen className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2.5 px-2.5 pb-1">
          <img src="/assets/logo-branco.svg" alt="Shemá" className="h-[1.375rem] w-auto" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="w-8 h-8 rounded-[0.5625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors shrink-0"
              >
                <PanelLeftClose className="w-[1.0625rem] h-[1.0625rem]" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto">
        {sections.map((section, i) => (
          <div
            key={section.label}
            className={cn("flex flex-col gap-0.5", collapsed ? "mt-3" : "mt-[1.375rem]")}
          >
            {collapsed
              ? i > 0 && <div className="mx-auto mb-2 h-px w-7 bg-[var(--shell-line)]" />
              : (
                <span className="px-2.5 pb-1.5 text-[0.65625rem] font-semibold tracking-[0.14em] uppercase text-[var(--shell-dim)]">
                  {section.label}
                </span>
              )}
            {section.items.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-[1.125rem]">
        {collapsed ? (
          <div className="border-t border-[var(--shell-line)] pt-3 flex flex-col items-center gap-1.5">
            <ThemeToggleIcon />
            <button
              onClick={onProfile}
              title={userName}
              aria-label="Open profile"
              className="rounded-full p-0.5 hover:ring-2 hover:ring-[var(--shell-active)] transition-shadow"
            >
              <UserAvatar
                id={userId}
                name={userName}
                email={userEmail}
                avatarUrl={avatarUrl ?? null}
                size="xs"
                className="h-9 w-9 text-xs"
              />
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              className="w-9 h-9 rounded-[0.5625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="border-t border-[var(--shell-line)] pt-3.5 flex items-center gap-2.5">
            <button
              onClick={onProfile}
              className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[0.625rem] p-1 hover:bg-[var(--shell-active)] transition-colors"
            >
              <UserAvatar
                id={userId}
                name={userName}
                email={userEmail}
                avatarUrl={avatarUrl ?? null}
                size="xs"
                className="h-[2.125rem] w-[2.125rem] text-xs"
              />
              <span className="flex flex-col min-w-0 text-left">
                <span className="text-[0.84375rem] font-semibold text-shell-fg truncate">{userName}</span>
                <span className="text-[0.6875rem] text-[var(--shell-dim)]">{userRole}</span>
              </span>
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              className="w-8 h-8 rounded-[0.5625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { isPlatformAdmin, isManager, logout, user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const { pathname } = useLocation()
  const counts = useRequestCountsStore((s) => s.counts)
  const fetchCounts = useRequestCountsStore((s) => s.fetch)
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggle)

  useEffect(() => {
    if (isPlatformAdmin) {
      void fetchCounts()
    }
  }, [isPlatformAdmin, fetchCounts, pathname])

  const userName = user?.display_name || user?.email || "Account"
  const userRole = isPlatformAdmin ? "Platform admin" : isManager ? "Manager" : "Member"

  const sections: NavSectionDef[] = [
    {
      label: "Main",
      items: [
        {
          to: "/app/dashboard",
          label: isPlatformAdmin ? "Dashboard" : "My Apps",
          icon: LayoutGrid,
        },
      ],
    },
  ]

  if (isPlatformAdmin || isManager) {
    sections.push({
      label: "Content",
      items: [
        { to: "/app/languages", label: "Languages", icon: Languages, badge: counts.languageChanges },
        { to: "/app/projects", label: "Projects", icon: FolderOpen, badge: counts.projectChanges },
        { to: "/app/map", label: "Map", icon: Globe },
      ],
    })
  }

  if (isPlatformAdmin) {
    sections.push({
      label: "Administration",
      items: [
        { to: "/app/phases", label: "Phases", icon: GitBranch },
        { to: "/app/users", label: "Users", icon: Users, badge: counts.access },
        { to: "/app/apps", label: "Manage Apps", icon: AppWindow },
      ],
    })
  }

  const openProfile = () => {
    setProfileOpen(true)
    onMobileClose()
  }

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex shrink-0 h-screen sticky top-0 bg-shell text-shell-fg flex-col pt-[1.375rem] pb-4 transition-[width] duration-200",
          collapsed ? "w-[4.5rem] px-2" : "w-[16.125rem] px-3.5",
        )}
      >
        <SidebarContent
          sections={sections}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onProfile={() => setProfileOpen(true)}
          onLogout={logout}
          userId={user?.id}
          userName={userName}
          userEmail={user?.email ?? ""}
          userRole={userRole}
          avatarUrl={user?.avatar_url}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-preto/50 animate-fade-in" onClick={onMobileClose} />
          <aside className="relative z-50 h-full w-[min(16.125rem,calc(100vw-3rem))] bg-shell text-shell-fg flex flex-col px-3.5 pt-[1.375rem] pb-4">
            <button
              onClick={onMobileClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 w-8 h-8 rounded-[0.5625rem] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
            <SidebarContent
              sections={sections}
              collapsed={false}
              onNavigate={onMobileClose}
              onProfile={openProfile}
              onLogout={logout}
              userId={user?.id}
              userName={userName}
              userEmail={user?.email ?? ""}
              userRole={userRole}
              avatarUrl={user?.avatar_url}
            />
          </aside>
        </div>
      )}

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
