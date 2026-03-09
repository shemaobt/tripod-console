import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "tc_theme"

const darkMQ = "(prefers-color-scheme: dark)"
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(darkMQ)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
const getSnapshot = () => window.matchMedia(darkMQ).matches

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored === "light" || stored === "dark" || stored === "system") ? stored : "light"
  })

  const systemIsDark = useSyncExternalStore(subscribe, getSnapshot)

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") return systemIsDark ? "dark" : "light"
    return theme
  }, [theme, systemIsDark])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
