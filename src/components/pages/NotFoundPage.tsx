import { Link } from "react-router-dom"
import { touch } from "@/styles"
import { cn } from "@/utils/cn"
import { useDocumentTitle } from "@/utils/documentTitle"

export default function NotFoundPage() {
  useDocumentTitle("Page not found")
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted mb-2">
        Not found
      </span>
      <h1 className="text-[4rem] font-black text-fg-strong leading-none tracking-tight mb-3">404</h1>
      <p className="font-serif italic text-fg-muted mb-7">This page could not be found.</p>
      <Link
        to="/app/dashboard"
        className={cn(touch.target, "text-[0.84375rem] font-semibold text-link hover:underline")}
      >
        Go to dashboard →
      </Link>
    </div>
  )
}
