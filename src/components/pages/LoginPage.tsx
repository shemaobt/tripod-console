import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Loader2 } from "lucide-react"

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
    <div className="min-h-screen flex">
      {/* Left — Background image panel */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden">
        <img
          src="/assets/background.pptx.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-preto/80 via-preto/30 to-preto/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-preto/30" />

        {/* Branding overlay */}
        <div className="relative mt-auto p-12 pb-14 w-full">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="h-12 w-12 rounded-2xl bg-telha flex items-center justify-center shadow-lg">
              <img
                src="/assets/icon-dark.svg"
                alt="Shema"
                className="h-7 w-7 brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-branco font-semibold text-xl tracking-tight">Tripod Console</p>
              <p className="text-branco/40 text-xs tracking-wide">by Shema</p>
            </div>
          </div>
          <p className="text-branco/50 text-sm max-w-lg leading-relaxed">
            Supporting language preservation through technology for Bible Translation.
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col bg-branco relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-telha), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[400px] h-[400px] rounded-full opacity-[0.03] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-azul), transparent 70%)" }}
        />

        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 relative">
          <div className="w-full max-w-[420px]">
            {/* Mobile hero with background image */}
            <div className="lg:hidden -mx-8 sm:-mx-12 -mt-12 mb-10">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/assets/background.pptx.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-branco via-preto/20 to-transparent" />
                <div className="absolute bottom-5 left-8 sm:left-12 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-telha flex items-center justify-center shadow-lg">
                    <img src="/assets/icon-dark.svg" alt="Shema" className="h-6 w-6 brightness-0 invert" />
                  </div>
                  <span className="text-branco font-semibold text-lg tracking-tight drop-shadow-md">
                    Tripod
                  </span>
                </div>
              </div>
            </div>

            {/* Brand wordmark + heading */}
            <div className="mb-10 space-y-5">
              <div className="hidden lg:flex items-center gap-3 mb-2">
                <div className="h-1.5 w-10 rounded-full bg-telha" />
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-telha/80">
                  Console
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-preto tracking-tight leading-[0.95]">
                Tripod
              </h1>

              <p className="text-base sm:text-lg text-verde/50 leading-relaxed max-w-sm">
                Sign in to manage languages, communities, and projects.
              </p>
            </div>

            {/* Three-pillar visual — representing the "tripod" */}
            <div className="hidden lg:flex items-center gap-3 mb-10">
              {[
                { label: "Languages", color: "bg-azul" },
                { label: "Communities", color: "bg-verde-claro" },
                { label: "Projects", color: "bg-telha" },
              ].map((pillar) => (
                <div key={pillar.label} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${pillar.color}`} />
                  <span className="text-xs text-verde/40 font-medium">{pillar.label}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-preto">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-preto">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold mt-1"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-areia/15 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-verde/40">
                  Need access? Contact your administrator.
                </p>
                <Link
                  to="/request"
                  className="text-sm font-medium text-telha hover:underline"
                >
                  Request a new project or language
                </Link>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-telha/8 flex items-center justify-center">
                  <img src="/assets/icon-dark.svg" alt="" className="h-3.5 w-3.5 opacity-35" />
                </div>
                <span className="text-xs text-verde/30 font-medium tracking-wide">Shema</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
