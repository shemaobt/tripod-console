import { Trash2 } from "lucide-react"
import { touch } from "@/styles"
import { cn } from "@/utils/cn"

export function RevokeButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "w-[1.875rem] h-[1.875rem] rounded-[0.5625rem] inline-grid place-items-center text-fg-subtle hover:bg-accent-soft hover:text-on-accent-soft transition-colors",
        touch.icon,
      )}
    >
      <Trash2 className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
    </button>
  )
}
