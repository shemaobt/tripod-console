import { useState } from "react"
import { NavLink } from "react-router-dom"
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
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { ProfileDialog } from "@/components/common/ProfileDialog"

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItemDef {
  to: string
  label: string
  icon: LucideIcon
}

interface NavSectionDef {
  label: string
  items: NavItemDef[]
}

function NavItem({ item, onNavigate }: { item: NavItemDef; onNavigate?: () => void }) {
  const { icon: Icon, to, label } = item
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-[11px] w-full px-2.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors",
          isActive
            ? "bg-[var(--shell-active)] text-shell-fg"
            : "text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg",
        )
      }
    >
      <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
    </NavLink>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <div className="inline-flex bg-[rgba(246,245,235,0.07)] rounded-full p-[3px] shrink-0">
      <button
        onClick={() => setTheme("light")}
        title="Light theme"
        aria-label="Light theme"
        className={cn(
          "w-[30px] h-[26px] rounded-full grid place-items-center transition-colors",
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
          "w-[30px] h-[26px] rounded-full grid place-items-center transition-colors",
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

function SidebarContent({
  sections,
  onNavigate,
  onProfile,
  onLogout,
  userName,
  userRole,
  userInitial,
  avatarUrl,
}: {
  sections: NavSectionDef[]
  onNavigate?: () => void
  onProfile: () => void
  onLogout: () => void
  userName: string
  userRole: string
  userInitial: string
  avatarUrl?: string | null
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2.5 px-2.5 pb-1">
        <img src="/assets/logo-branco.svg" alt="Shemá" className="h-[22px] w-auto" />
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="mt-[22px] flex flex-col gap-0.5">
            <span className="px-2.5 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[var(--shell-dim)]">
              {section.label}
            </span>
            {section.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-[18px]">
        <div className="border-t border-[var(--shell-line)] pt-3.5 flex items-center gap-2.5">
          <button
            onClick={onProfile}
            className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[10px] p-1 hover:bg-[var(--shell-active)] transition-colors"
          >
            <span className="w-[34px] h-[34px] rounded-full bg-[rgba(246,245,235,0.14)] text-shell-fg grid place-items-center text-xs font-bold shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                userInitial
              )}
            </span>
            <span className="flex flex-col min-w-0 text-left">
              <span className="text-[13.5px] font-semibold text-shell-fg truncate">{userName}</span>
              <span className="text-[11px] text-[var(--shell-dim)]">{userRole}</span>
            </span>
          </button>
          <button
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="w-8 h-8 rounded-[9px] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { isPlatformAdmin, isManager, logout, user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const userInitial =
    user?.display_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?"
  const userName = user?.display_name || user?.email || "Account"
  const userRole = isPlatformAdmin ? "Platform admin" : isManager ? "Manager" : "Member"

  const sections: NavSectionDef[] = [
    {
      label: "Main",
      items: [{ to: "/app/dashboard", label: "My Apps", icon: LayoutGrid }],
    },
  ]

  if (isPlatformAdmin || isManager) {
    sections.push({
      label: "Content",
      items: [
        { to: "/app/languages", label: "Languages", icon: Languages },
        { to: "/app/projects", label: "Projects", icon: FolderOpen },
        { to: "/app/map", label: "Map", icon: Globe },
      ],
    })
  }

  if (isPlatformAdmin) {
    sections.push({
      label: "Administration",
      items: [
        { to: "/app/phases", label: "Phases", icon: GitBranch },
        { to: "/app/users", label: "Users", icon: Users },
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
      <aside className="hidden lg:flex w-[258px] shrink-0 h-screen sticky top-0 bg-shell text-shell-fg flex-col px-3.5 pt-[22px] pb-4">
        <SidebarContent
          sections={sections}
          onProfile={() => setProfileOpen(true)}
          onLogout={logout}
          userName={userName}
          userRole={userRole}
          userInitial={userInitial}
          avatarUrl={user?.avatar_url}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-preto/50 animate-fade-in" onClick={onMobileClose} />
          <aside className="relative z-50 h-full w-[min(258px,calc(100vw-3rem))] bg-shell text-shell-fg flex flex-col px-3.5 pt-[22px] pb-4">
            <button
              onClick={onMobileClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 w-8 h-8 rounded-[9px] grid place-items-center text-[var(--shell-dim)] hover:bg-[var(--shell-active)] hover:text-shell-fg transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
            <SidebarContent
              sections={sections}
              onNavigate={onMobileClose}
              onProfile={openProfile}
              onLogout={logout}
              userName={userName}
              userRole={userRole}
              userInitial={userInitial}
              avatarUrl={user?.avatar_url}
            />
          </aside>
        </div>
      )}

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
