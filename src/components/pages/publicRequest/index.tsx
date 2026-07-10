import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageRequestForm } from "./LanguageRequestForm"
import { ProjectRequestForm } from "./ProjectRequestForm"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function PublicRequestPage() {
  const [requesterName, setRequesterName] = useState("")
  const [requesterEmail, setRequesterEmail] = useState("")
  const [languages, setLanguages] = useState<PublicLanguageOption[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(true)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const requesterValid =
    requesterName.trim().length > 0 && EMAIL_PATTERN.test(requesterEmail.trim())

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const { data } = await publicAPI.listLanguages()
        setLanguages(data)
      } catch {
        toast.error("Failed to load languages")
      } finally {
        setLanguagesLoading(false)
      }
    }
    fetchLanguages()
  }, [])

  function handleSuccess() {
    setSubmittedEmail(requesterEmail.trim())
  }

  function handleReset() {
    setSubmittedEmail(null)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src="/assets/background.pptx.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-preto/80 via-preto/30 to-preto/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-preto/30" />
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

      <div className="flex-1 flex flex-col bg-branco relative overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-telha), transparent 70%)" }}
        />

        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 py-12 relative">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 rounded-full bg-telha" />
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-telha/80">
                  Creation Request
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-preto tracking-tight">
                Request a project or language
              </h1>
              <p className="text-base text-verde/50 leading-relaxed">
                No account needed. Tell us who you are and what you would like created — a
                platform admin will review your request and get back to you.
              </p>
            </div>

            {submittedEmail ? (
              <div className="rounded-2xl border border-areia/20 bg-surface p-8 shadow-sm text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-verde-claro mx-auto" />
                <h2 className="text-lg font-semibold text-preto">Request received</h2>
                <p className="text-sm text-verde/70 leading-relaxed">
                  Your request is pending review. We will contact you at{" "}
                  <span className="font-medium text-preto">{submittedEmail}</span> once it has
                  been reviewed.
                </p>
                <Button variant="outline" className="rounded-xl" onClick={handleReset}>
                  Submit another request
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requester-name">Your name</Label>
                    <Input
                      id="requester-name"
                      placeholder="e.g. Ana Silva"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requester-email">Your email</Label>
                    <Input
                      id="requester-email"
                      type="email"
                      placeholder="you@example.com"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs defaultValue="project">
                  <TabsList className="w-full">
                    <TabsTrigger value="project" className="flex-1">
                      Project
                    </TabsTrigger>
                    <TabsTrigger value="language" className="flex-1">
                      Language
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="project">
                    <ProjectRequestForm
                      requesterName={requesterName}
                      requesterEmail={requesterEmail}
                      requesterValid={requesterValid}
                      languages={languages}
                      languagesLoading={languagesLoading}
                      onSuccess={handleSuccess}
                    />
                  </TabsContent>
                  <TabsContent value="language">
                    <LanguageRequestForm
                      requesterName={requesterName}
                      requesterEmail={requesterEmail}
                      requesterValid={requesterValid}
                      languages={languages}
                      onSuccess={handleSuccess}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-areia/15 flex items-center justify-between">
              <p className="text-sm text-verde/40">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-telha hover:underline">
                  Sign in
                </Link>
              </p>
              <span className="text-xs text-verde/30 font-medium tracking-wide">Shema</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
