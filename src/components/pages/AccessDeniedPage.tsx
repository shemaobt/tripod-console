import { Link } from "react-router-dom"
import { ShieldX } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AccessDeniedPageProps {
  variant?: "default" | "logout"
}

export default function AccessDeniedPage({ variant = "default" }: AccessDeniedPageProps) {
  const { logout } = useAuth()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <ShieldX className="h-12 w-12 text-areia mb-4" />
      <h1 className="text-2xl font-bold text-preto mb-2">Access Denied</h1>
      <p className="text-verde mb-6">You do not have permission to access this page.</p>
      {variant === "logout" ? (
        <button
          type="button"
          onClick={() => logout()}
          className="text-telha hover:underline font-medium"
        >
          Sign out
        </button>
      ) : (
        <Link
          to="/app/dashboard"
          className="text-telha hover:underline font-medium"
        >
          Go to Dashboard
        </Link>
      )}
    </div>
  )
}
