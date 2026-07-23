import { useRef, useState } from "react"
import { Upload, X, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { uploadsAPI } from "@/services/api"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  folder: string
  shape?: "square" | "circle"
  size?: "sm" | "md" | "lg" | "xl"
  actions?: "buttons" | "links"
  placeholder?: React.ReactNode
  uploadLabel?: string
  changeLabel?: string
  removeLabel?: string
  hint?: React.ReactNode
  className?: string
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-36 w-36",
}

export function ImageUpload({
  value,
  onChange,
  folder,
  shape = "square",
  size = "md",
  actions = "buttons",
  placeholder,
  uploadLabel,
  changeLabel,
  removeLabel,
  hint,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or SVG image")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB")
      return
    }

    setUploading(true)
    try {
      const { data } = await uploadsAPI.image(file, folder)
      onChange(data.url)
      toast.success("Image uploaded")
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      toast.error(detail || "Failed to upload image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-line flex items-center justify-center bg-muted cursor-pointer transition-colors hover:border-accent group",
          shape === "circle" ? "rounded-full" : "rounded-xl",
          sizeClasses[size],
          value && "border-solid border-line",
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-fg-subtle animate-spin" />
        ) : value ? (
          <img
            src={value}
            alt="Uploaded"
            className={cn(
              "h-full w-full object-cover",
              shape === "circle" ? "rounded-full" : "rounded-xl",
            )}
          />
        ) : (
          placeholder || <Upload className="h-6 w-6 text-fg-subtle group-hover:text-fg-muted transition-colors" />
        )}
        {value && !uploading && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
              shape === "circle" ? "rounded-full" : "rounded-xl",
            )}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              aria-label="Change image"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-elevated/90 text-fg-strong hover:bg-elevated transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              aria-label="Remove image"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-elevated/90 text-st-warn hover:bg-elevated transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      <div className={cn("flex flex-col", actions === "links" ? "gap-2" : "gap-1.5")}>
        {actions === "links" ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[0.8125rem] font-semibold text-accent hover:underline disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : value
                  ? changeLabel ?? "Change"
                  : uploadLabel ?? "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={uploading}
                className="text-[0.8125rem] font-semibold text-st-warn hover:underline disabled:opacity-50"
              >
                {removeLabel ?? "Remove"}
              </button>
            )}
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              {uploading
                ? "Uploading..."
                : value
                  ? changeLabel ?? "Change"
                  : uploadLabel ?? "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                disabled={uploading}
                className="text-xs text-st-warn gap-1"
              >
                <X className="h-3 w-3" />
                {removeLabel ?? "Remove"}
              </Button>
            )}
          </>
        )}
        {hint && <p className="text-[0.6875rem] text-fg-subtle leading-snug max-w-[11.875rem]">{hint}</p>}
      </div>
    </div>
  )
}
