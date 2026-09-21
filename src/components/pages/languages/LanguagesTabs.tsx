import type { ReactNode } from "react"
import { cn } from "@/utils/cn"
import { ChangeRequestsSection } from "@/components/pages/ChangeRequestsSection"
import { MyChangeRequestsSection } from "@/components/pages/changeRequests/MyChangeRequestsSection"

const segClass = "rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold transition-colors"
const segActive = "bg-elevated text-fg-strong shadow-[var(--shadow-sm)]"

interface LanguagesTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isPlatformAdmin: boolean
  onReviewed: () => void
  children: ReactNode
}

export function LanguagesTabs({
  activeTab,
  onTabChange,
  isPlatformAdmin,
  onReviewed,
  children,
}: LanguagesTabsProps) {
  return (
    <>
      <div className="inline-flex bg-muted rounded-full p-[0.1875rem] mb-[1.125rem]">
        <button
          type="button"
          onClick={() => onTabChange("languages")}
          className={cn(segClass, activeTab === "languages" ? segActive : "text-fg-muted")}
        >
          All languages
        </button>
        <button
          type="button"
          onClick={() => onTabChange("requests")}
          className={cn(segClass, activeTab === "requests" ? segActive : "text-fg-muted")}
        >
          Change requests
        </button>
      </div>
      {activeTab === "languages" ? (
        children
      ) : isPlatformAdmin ? (
        <ChangeRequestsSection
          kinds={["create_language", "edit_language"]}
          emptyLabel="Managers' requests to create or edit a language appear here. Accept to apply the change or reject."
          onReviewed={onReviewed}
        />
      ) : (
        <MyChangeRequestsSection
          kinds={["create_language", "edit_language"]}
          emptyLabel="When you request a new language or an edit, it appears here with its status. Once a platform admin reviews it, their notes show up too."
        />
      )}
    </>
  )
}
