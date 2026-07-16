import { Menu } from "lucide-react"

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-line bg-canvas flex items-center px-4 lg:hidden sticky top-0 z-30">
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 grid place-items-center rounded-[9px] hover:bg-muted text-fg-muted hover:text-fg-strong transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" strokeWidth={1.75} />
      </button>
      <img
        src="/assets/logo-verde.svg"
        alt="Shemá"
        className="ml-3 h-5 w-auto dark:hidden"
      />
      <img
        src="/assets/logo-branco.svg"
        alt="Shemá"
        className="ml-3 h-5 w-auto hidden dark:block"
      />
    </header>
  )
}
