export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[0.75rem] font-semibold text-on-accent-soft">
      {children}
    </p>
  )
}
