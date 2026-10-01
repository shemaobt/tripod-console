import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-scrim/44 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>

// Radix returns focus to a DialogTrigger, and every dialog here opens from state, so without
// this the focus lands on <body> on close; it goes back to whatever held it when the dialog opened.
function useReturnFocus({ onOpenAutoFocus, onCloseAutoFocus }: ContentProps) {
  const openedFrom = React.useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus: (event: Event) => {
      openedFrom.current = document.activeElement as HTMLElement | null
      onOpenAutoFocus?.(event)
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event)
      if (event.defaultPrevented) return
      event.preventDefault()
      openedFrom.current?.focus()
    },
  }
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      {...props}
      {...useReturnFocus(props)}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] sm:w-full max-w-[33.125rem] translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-elevated p-5 sm:p-6 shadow-[var(--shadow-lg)] rounded-[1.25rem] max-h-[88vh] overflow-y-auto animate-pop-in",
        className
      )}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 w-8 h-8 rounded-[0.5625rem] grid place-items-center text-fg-subtle hover:bg-muted hover:text-fg-strong transition-colors focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[1.0625rem] font-semibold leading-tight text-fg-strong", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-fg-subtle leading-relaxed", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogSideSheet = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      {...props}
      {...useReturnFocus(props)}
      className={cn("fixed inset-y-0 left-0 z-50 flex flex-col", className)}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogSideSheet.displayName = "DialogSideSheet"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogSideSheet,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
