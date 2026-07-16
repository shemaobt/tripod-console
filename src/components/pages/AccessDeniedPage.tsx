import { Link } from "react-router-dom"
import { ShieldX } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AccessDeniedPageProps {
  variant?: "default" | "logout"
}

export default function AccessDeniedPage({ variant = "default" }: AccessDeniedPageProps) {
  const { logout } = useAuth()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-[16px] bg-muted p-5 mb-5">
        <ShieldX className="h-9 w-9 text-fg-subtle" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-fg-strong mb-2">Access denied</h1>
      <p className="text-fg-muted mb-7">You do not have permission to access this page.</p>
      {variant === "logout" ? (
        <button
          type="button"
          onClick={() => logout()}
          className="text-[13.5px] font-semibold text-accent hover:underline"
        >
          Sign out →
        </button>
      ) : (
        <Link
          to="/app/dashboard"
          className="text-[13.5px] font-semibold text-accent hover:underline"
        >
          Go to dashboard →
        </Link>
      )}
    </div>
  )
}
