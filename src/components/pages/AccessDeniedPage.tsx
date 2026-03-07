import { Link } from "react-router-dom"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-branco">
      <h1 className="text-4xl font-bold text-preto mb-2">Unauthorized</h1>
      <p className="text-verde mb-6">You do not have permission to access this page.</p>
      <Link
        to="/app/dashboard"
        className="text-telha hover:underline font-medium"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
