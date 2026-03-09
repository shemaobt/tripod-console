import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutGrid,
  Languages,
  Building2,
  FolderOpen,
  GitBranch,
  Globe,
  Users,
  AppWindow,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { cn } from "@/utils/cn"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { ProfileDialog } from "@/components/common/ProfileDialog"

interface SidebarProps {
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
  { to: "/app/phases", label: "Phases", icon: GitBranch },
  { to: "/app/map", label: "Map", icon: Globe },
]

const adminNavItems = [
  { to: "/app/users", label: "Users", icon: Users },
  { to: "/app/apps", label: "Manage Apps", icon: AppWindow },
]

function SidebarIcon({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const location = useLocation()
  const isActive =
    location.pathname === to || location.pathname.startsWith(to + "/")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
            isActive
              ? "bg-preto text-branco shadow-sm dark:bg-branco dark:text-preto"
              : "text-verde/50 hover:bg-surface-alt hover:text-verde"
          )}
        >
          <Icon className="w-[22px] h-[22px]" />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function MobileNavItem({
  to,
  label,
  icon: Icon,
  onClose,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClose: () => void
}) {
  const location = useLocation()
  const isActive =
    location.pathname === to || location.pathname.startsWith(to + "/")

  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-preto text-branco dark:bg-branco dark:text-preto"
          : "text-verde/70 hover:bg-surface-alt hover:text-verde"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { isPlatformAdmin, logout, user } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)

  const userInitial = user?.email?.charAt(0).toUpperCase() || "?"

  return (
    <>
      {/* Desktop sidebar — icon only */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0">
        <TooltipProvider delayDuration={0}>
          <div className="w-[72px] bg-surface border-r border-areia/15 h-full flex flex-col items-center py-5 gap-4">
            {/* Brand logo */}
            <NavLink
              to="/app/dashboard"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-telha shadow-sm hover:bg-telha/90 transition-colors"
            >
              <img
                src="/assets/icon-dark.svg"
                alt="Shema"
                className="w-5 h-5 brightness-0 invert"
              />
            </NavLink>

            {/* Theme toggle */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                  resolvedTheme === "light"
                    ? "bg-surface-alt text-preto shadow-inner"
                    : "text-verde/35 hover:text-verde/60"
                )}
                aria-label="Light mode"
              >
                <Sun className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                  resolvedTheme === "dark"
                    ? "bg-surface-alt text-preto shadow-inner"
                    : "text-verde/35 hover:text-verde/60"
                )}
                aria-label="Dark mode"
              >
                <Moon className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-8 border-t border-areia/20" />

            {/* Nav icons */}
            <nav className="flex-1 flex flex-col items-center gap-1.5">
              {mainNavItems.map((item) => (
                <SidebarIcon key={item.to} {...item} />
              ))}

              <div className="w-6 border-t border-areia/15 my-1.5" />

              {contentNavItems.map((item) => (
                <SidebarIcon key={item.to} {...item} />
              ))}

              {isPlatformAdmin && (
                <>
                  <div className="w-6 border-t border-areia/15 my-1.5" />
                  {adminNavItems.map((item) => (
                    <SidebarIcon key={item.to} {...item} />
                  ))}
                </>
              )}
            </nav>

            {/* Bottom: user + logout */}
            <div className="flex flex-col items-center gap-2 pt-3 border-t border-areia/15">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-azul/20 text-verde text-xs font-bold cursor-pointer select-none overflow-hidden hover:ring-2 hover:ring-telha/30 transition-all"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Edit profile
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-verde/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
                    aria-label="Log out"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Log out
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-preto/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative z-50 h-full w-[min(18rem,calc(100vw-3.5rem))] bg-surface shadow-2xl">
            <div className="h-full flex flex-col">
              {/* Mobile header */}
              <div className="flex items-center gap-3 h-14 px-4 border-b border-areia/15">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-telha">
                  <img
                    src="/assets/icon-dark.svg"
                    alt="Shema"
                    className="w-4 h-4 brightness-0 invert"
                  />
                </div>
                <span className="text-sm font-semibold text-preto tracking-tight">
                  Tripod Console
                </span>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {mainNavItems.map((item) => (
                  <MobileNavItem
                    key={item.to}
                    {...item}
                    onClose={onMobileClose}
                  />
                ))}

                <div className="my-2 border-t border-areia/15" />

                {contentNavItems.map((item) => (
                  <MobileNavItem
                    key={item.to}
                    {...item}
                    onClose={onMobileClose}
                  />
                ))}

                {isPlatformAdmin && (
                  <>
                    <div className="my-2 border-t border-areia/15" />
                    {adminNavItems.map((item) => (
                      <MobileNavItem
                        key={item.to}
                        {...item}
                        onClose={onMobileClose}
                      />
                    ))}
                  </>
                )}
              </nav>

              {/* Mobile footer */}
              <div className="p-3 border-t border-areia/15 space-y-2">
                {user && (
                  <button
                    onClick={() => { setProfileOpen(true); onMobileClose() }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl w-full hover:bg-surface-alt transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-azul/20 text-verde text-xs font-bold overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs text-verde truncate">{user.display_name || user.email}</p>
                      <p className="text-[10px] text-verde/50">Edit profile</p>
                    </div>
                  </button>
                )}

                <div className="flex items-center gap-1 px-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                      resolvedTheme === "light"
                        ? "bg-surface-alt text-preto"
                        : "text-verde/35"
                    )}
                    aria-label="Light mode"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                      resolvedTheme === "dark"
                        ? "bg-surface-alt text-preto"
                        : "text-verde/35"
                    )}
                    aria-label="Dark mode"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-verde/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all w-full"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
