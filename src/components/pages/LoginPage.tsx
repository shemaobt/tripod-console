import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const axiosDetail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      toast.error(axiosDetail || "Invalid email or password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-canvas">
      <div className="hidden lg:flex relative overflow-hidden bg-inverse text-[#F6F5EB] flex-col justify-between px-[3.25rem] py-11">
        <img src="/assets/logo-branco.svg" alt="Shemá" className="h-7 w-auto self-start relative z-10" />
        <div className="relative z-10 max-w-[29.375rem] flex flex-col gap-[1.125rem] pb-8">
          <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-[#F6F5EB]/60">
            Tripod Console
          </span>
          <div className="font-black text-[3.125rem] leading-[1.03] tracking-[-0.01em] uppercase">
            Every mother tongue, heard.
          </div>
          <p className="font-serif text-[1.03125rem] leading-[1.65] text-[#F6F5EB]/80">
            Languages, projects, workflow phases and access — the governance console for the Shema oral
            Bible translation ecosystem.
          </p>
          <p className="font-serif italic text-[0.9375rem] text-[#F6F5EB]/65 mt-1.5">
            “Assim na terra como no céu.”
          </p>
        </div>
        <img
          src="/assets/icon-branco.svg"
          alt=""
          className="absolute -right-[4.375rem] -bottom-20 w-[22.5rem] opacity-10 pointer-events-none"
        />
      </div>

      <div className="flex flex-col items-center justify-center px-6 sm:px-10 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[22.5rem] flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="lg:hidden mb-4">
              <img src="/assets/logo-verde.svg" alt="Shemá" className="h-6 w-auto dark:hidden" />
              <img src="/assets/logo-branco.svg" alt="Shemá" className="h-6 w-auto hidden dark:block" />
            </div>
            <h3 className="text-[1.625rem] font-bold text-fg-strong tracking-tight">Sign in</h3>
            <p className="text-sm text-fg-muted">Use your Shema account to manage the platform.</p>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@shema.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <div className="border-t border-line pt-[1.125rem] flex flex-col gap-2">
            <span className="text-[0.8125rem] text-fg-muted">Need access? Contact your administrator.</span>
            <Link
              to="/request"
              className="text-[0.84375rem] font-semibold text-accent hover:text-accent-hover hover:underline self-start"
            >
              Submit a public request →
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
