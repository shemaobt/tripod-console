import { useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import AccessDeniedPage from "@/components/pages/AccessDeniedPage"
import AppHeader from "./AppHeader"
import Sidebar from "./Sidebar"

export default function AppShell() {
  const { user, isLoading, isPlatformAdmin, isManager } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isPlatformAdmin && !isManager) {
    return (
      <div className="min-h-screen bg-canvas flex">
        <AccessDeniedPage variant="logout" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex">
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
