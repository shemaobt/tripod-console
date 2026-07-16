import { Trash2 } from "lucide-react"

export function RevokeButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-[30px] h-[30px] rounded-[9px] inline-grid place-items-center text-fg-subtle hover:bg-accent-soft hover:text-on-accent-soft transition-colors"
    >
      <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.75} />
    </button>
  )
}
