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
  size?: "sm" | "md" | "lg"
  placeholder?: React.ReactNode
  className?: string
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
}

export function ImageUpload({
  value,
  onChange,
  folder,
  shape = "square",
  size = "md",
  placeholder,
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
          "relative overflow-hidden border-2 border-dashed border-areia/40 flex items-center justify-center bg-surface-alt/50 cursor-pointer transition-colors hover:border-telha/40 group",
          shape === "circle" ? "rounded-full" : "rounded-xl",
          sizeClasses[size],
          value && "border-solid border-areia/20",
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-verde/40 animate-spin" />
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
          placeholder || <Upload className="h-6 w-6 text-verde/30 group-hover:text-verde/50 transition-colors" />
        )}
        {value && !uploading && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 bg-preto/50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
              shape === "circle" ? "rounded-full" : "rounded-xl",
            )}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              aria-label="Change image"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-surface/90 text-preto hover:bg-surface transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              aria-label="Remove image"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-surface/90 text-red-600 hover:bg-surface transition-colors"
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
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs"
        >
          {uploading ? "Uploading..." : value ? "Change" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="text-xs text-red-500 hover:text-red-600 gap-1"
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
