import type { ReactNode } from "react"
import { cn } from "@/utils/cn"
import { useDocumentTitle } from "@/utils/documentTitle"

interface PageHeaderProps {
  eyebrow: string
  title: ReactNode
  /** The tab title; defaults to `title` when that is plain text. */
  documentTitle?: string
  subtitle?: ReactNode
  /** Extra content under the subtitle (a legend, a filter hint). */
  children?: ReactNode
  actions?: ReactNode
  actionsClassName?: string
  className?: string
}

/**
 * The page header of every list screen (CLAUDE.md §9.3): eyebrow, the page's one h1, an optional
 * subtitle, and actions that sit on the right from sm and stack under the title on a phone.
 */
export function PageHeader({
  eyebrow,
  title,
  documentTitle,
  subtitle,
  children,
  actions,
  actionsClassName,
  className,
}: PageHeaderProps) {
  useDocumentTitle(documentTitle ?? (typeof title === "string" ? title : undefined))
  return (
    <div className={cn("mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
          {eyebrow}
        </span>
        <h1 className="flex items-center text-[1.5625rem] font-bold tracking-tight text-fg-strong">{title}</h1>
        {subtitle && <span className="text-[0.78125rem] text-fg-subtle">{subtitle}</span>}
        {children}
      </div>
      {actions && <div className={cn("flex flex-wrap items-center gap-[1.125rem]", actionsClassName)}>{actions}</div>}
    </div>
  )
}
