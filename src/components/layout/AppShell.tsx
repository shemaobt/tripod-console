import { useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import AppHeader from "./AppHeader"
import Sidebar from "./Sidebar"

export default function AppShell() {
  const { user, isLoading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-branco flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleSidebar={() => setMobileOpen((o) => !o)} />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
