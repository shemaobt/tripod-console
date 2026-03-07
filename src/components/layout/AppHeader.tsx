import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/utils/cn"

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  function cycleTheme() {
    const next: Record<string, "light" | "dark" | "system"> = {
      light: "dark",
      dark: "system",
      system: "light",
    }
    setTheme(next[theme])
  }

  return (
    <header className="h-14 border-b border-areia/30 bg-surface flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-surface-alt text-verde transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold text-preto tracking-tight">
          Tripod Console
        </span>
      </div>

      <button
        onClick={cycleTheme}
        className={cn(
          "p-2 rounded-md hover:bg-surface-alt text-verde transition-colors",
          "flex items-center gap-2"
        )}
        aria-label={`Current theme: ${theme}. Click to change.`}
        title={`Theme: ${theme}`}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
        <span className="text-xs text-verde/60 hidden sm:inline">
          {theme}
        </span>
      </button>
    </header>
  )
}
