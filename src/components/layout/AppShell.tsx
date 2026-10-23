import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import AccessDeniedPage from "@/components/pages/AccessDeniedPage"
import { REGULAR_WIDTH_QUERY } from "@/utils/uiScale"
import AppHeader from "./AppHeader"
import Sidebar from "./Sidebar"

export default function AppShell() {
  const { user, isLoading, isPlatformAdmin, isManager } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia(REGULAR_WIDTH_QUERY)
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isPlatformAdmin && !isManager) {
    return (
      <div className="min-h-dvh bg-canvas flex">
        <AccessDeniedPage variant="logout" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-hidden bg-canvas flex">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleSidebar={() => setMobileOpen((o) => !o)} />

        <main className="flex-1 overflow-auto isolate">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
