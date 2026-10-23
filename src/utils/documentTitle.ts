import { useEffect } from "react"

const APP_NAME = "Tripod Console"

/**
 * Names the browser tab after the screen. Every route used to say "Tripod Console", so tabs,
 * history and a screen reader's page announcement could not tell Projects from Users.
 * `null` while the screen's subject is still loading keeps the plain app name.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
    return () => {
      document.title = APP_NAME
    }
  }, [title])
}

/** The hook as an element, for a screen that knows its title only in the branch that has loaded. */
export function DocumentTitle({ title }: { title: string }) {
  useDocumentTitle(title)
  return null
}
