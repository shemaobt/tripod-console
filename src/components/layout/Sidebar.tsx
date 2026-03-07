import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutGrid,
  Languages,
  Building2,
  FolderOpen,
  Globe,
  Users,
  AppWindow,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/utils/cn"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const mainNavItems = [
  { to: "/app/dashboard", label: "My Apps", icon: LayoutGrid },
]

const contentNavItems = [
  { to: "/app/languages", label: "Languages", icon: Languages },
  { to: "/app/organizations", label: "Organizations", icon: Building2 },
  { to: "/app/projects", label: "Projects", icon: FolderOpen },
  { to: "/app/map", label: "Map", icon: Globe },
]

const adminNavItems = [
  { to: "/app/users", label: "Users", icon: Users },
  { to: "/app/apps", label: "Manage Apps", icon: AppWindow },
]

function NavItem({
  to,
  label,
  icon: Icon,
  collapsed,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  collapsed: boolean
}) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/")

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-telha/10 text-telha"
          : "text-verde hover:bg-surface-alt hover:text-preto",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const sidebarContent = (
    <div className={cn(
      "bg-surface border-r border-areia/30 h-full flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between h-14 px-3 border-b border-areia/30">
        {!collapsed && (
          <span className="text-sm font-semibold text-preto tracking-tight">
            Navigation
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-surface-alt text-verde transition-colors hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        <div className="my-2 border-t border-areia/20" />

        {contentNavItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        <div className="my-2 border-t border-areia/20" />

        {adminNavItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-2 border-t border-areia/30">
        <button
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-verde hover:bg-surface-alt hover:text-preto transition-colors w-full",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-preto/40"
            onClick={onMobileClose}
          />
          <aside className="relative z-50 h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
