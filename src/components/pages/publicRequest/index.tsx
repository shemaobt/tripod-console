import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageRequestForm } from "./LanguageRequestForm"
import { ProjectRequestForm } from "./ProjectRequestForm"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function PublicRequestPage() {
  const [requesterName, setRequesterName] = useState("")
  const [requesterEmail, setRequesterEmail] = useState("")
  const [languages, setLanguages] = useState<PublicLanguageOption[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(true)
  const [languagesError, setLanguagesError] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const requesterValid =
    requesterName.trim().length > 0 && EMAIL_PATTERN.test(requesterEmail.trim())

  const fetchLanguages = useCallback(async () => {
    setLanguagesLoading(true)
    setLanguagesError(false)
    try {
      const { data } = await publicAPI.listLanguages()
      setLanguages(data)
    } catch {
      setLanguagesError(true)
      toast.error("Failed to load languages")
    } finally {
      setLanguagesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLanguages()
  }, [fetchLanguages])

  function handleSuccess() {
    setSubmittedEmail(requesterEmail.trim())
  }

  function handleReset() {
    setSubmittedEmail(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 sm:px-11 py-[18px] border-b border-line">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo-verde.svg"
            alt="Shema"
            className="h-[22px] w-auto dark:hidden"
          />
          <img
            src="/assets/logo-branco.svg"
            alt="Shema"
            className="h-[22px] w-auto hidden dark:block"
          />
          <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-fg-subtle border border-line-strong rounded-full px-[9px] py-[3px]">
            Public requests
          </span>
        </div>
        <Link
          to="/login"
          className="text-[13.5px] font-semibold text-fg-muted hover:text-fg-strong"
        >
          Sign in →
        </Link>
      </header>

      <div className="w-full max-w-[660px] mx-auto px-6 pt-[52px] pb-20">
        {submittedEmail ? (
          <div className="bg-elevated rounded-[22px] shadow-[var(--shadow-card)] px-10 py-12 flex flex-col items-center gap-3.5 text-center">
            <span className="w-14 h-14 rounded-full bg-accent-soft text-on-accent-soft grid place-items-center">
              <Check className="w-[26px] h-[26px]" strokeWidth={2.4} />
            </span>
            <h2 className="text-[24px] font-bold text-fg-strong">Request received</h2>
            <p className="text-[14.5px] text-fg-muted max-w-[380px] leading-relaxed">
              A platform admin will review it. We will reply to{" "}
              <span className="font-semibold text-fg-strong">{submittedEmail}</span>.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2.5 text-[14px] font-semibold text-accent hover:underline"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5 mb-[26px]">
              <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted">
                No account needed
              </span>
              <h1 className="text-[34px] font-bold text-fg-strong tracking-tight">
                Request a project or language.
              </h1>
              <p className="font-serif italic text-[15.5px] text-fg-muted">
                Tell us where the Word still needs to be heard.
              </p>
            </div>

            <div className="bg-elevated rounded-[22px] shadow-[var(--shadow-card)] p-8">
              <Tabs defaultValue="project" className="flex flex-col gap-6">
                <TabsList className="self-start">
                  <TabsTrigger value="project" className="px-[18px] py-2 text-[13.5px]">
                    New project
                  </TabsTrigger>
                  <TabsTrigger value="language" className="px-[18px] py-2 text-[13.5px]">
                    New language
                  </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <Label htmlFor="requester-name">Your name</Label>
                    <Input
                      id="requester-name"
                      placeholder="Full name"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="requester-email">Your email</Label>
                    <Input
                      id="requester-email"
                      type="email"
                      placeholder="you@example.org"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <TabsContent
                  value="project"
                  forceMount
                  className="mt-0 data-[state=inactive]:hidden"
                >
                  <ProjectRequestForm
                    requesterName={requesterName}
                    requesterEmail={requesterEmail}
                    requesterValid={requesterValid}
                    languages={languages}
                    languagesLoading={languagesLoading}
                    languagesError={languagesError}
                    onRetryLanguages={fetchLanguages}
                    onSuccess={handleSuccess}
                  />
                </TabsContent>
                <TabsContent
                  value="language"
                  forceMount
                  className="mt-0 data-[state=inactive]:hidden"
                >
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
          </>
        )}
      </div>
    </div>
  )
}
