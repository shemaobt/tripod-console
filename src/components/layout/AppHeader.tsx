import { Menu } from "lucide-react"

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-areia/30 bg-surface flex items-center px-4 lg:hidden">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md hover:bg-surface-alt text-verde transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="ml-3 text-lg font-semibold text-preto tracking-tight">
        Tripod Console
      </span>
    </header>
  )
}
