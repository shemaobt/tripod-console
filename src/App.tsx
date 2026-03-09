import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import AppShell from "@/components/layout/AppShell"
import LoginPage from "@/components/pages/LoginPage"
import DashboardPage from "@/components/pages/DashboardPage"
import LanguagesPage from "@/components/pages/LanguagesPage"
import OrganizationsPage from "@/components/pages/OrganizationsPage"
import OrganizationDetailPage from "@/components/pages/OrganizationDetailPage"
import ProjectsPage from "@/components/pages/ProjectsPage"
import ProjectDetailPage from "@/components/pages/ProjectDetailPage"
import UsersPage from "@/components/pages/UsersPage"
import UserDetailPage from "@/components/pages/UserDetailPage"
import AppsPage from "@/components/pages/AppsPage"
import AppDetailPage from "@/components/pages/AppDetailPage"
import PhasesPage from "@/components/pages/PhasesPage"
import MapPage from "@/components/pages/MapPage"
import NotFoundPage from "@/components/pages/NotFoundPage"
import AccessDeniedPage from "@/components/pages/AccessDeniedPage"

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isPlatformAdmin } = useAuth()
  if (!isPlatformAdmin) return <AccessDeniedPage />
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="languages" element={<LanguagesPage />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="users/:userId" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
              <Route path="apps" element={<AdminRoute><AppsPage /></AdminRoute>} />
              <Route path="apps/:appId" element={<AdminRoute><AppDetailPage /></AdminRoute>} />
              <Route path="phases" element={<PhasesPage />} />
              <Route path="map" element={<MapPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
