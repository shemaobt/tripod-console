import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted mb-2">
        Not found
      </span>
      <h1 className="text-[64px] font-black text-fg-strong leading-none tracking-tight mb-3">404</h1>
      <p className="font-serif italic text-fg-muted mb-7">This page could not be found.</p>
      <Link
        to="/app/dashboard"
        className="text-[13.5px] font-semibold text-accent hover:underline"
      >
        Go to dashboard →
      </Link>
    </div>
  )
}
