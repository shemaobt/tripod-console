export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="text-[0.75rem] font-semibold text-st-warn">
      {children}
    </p>
  )
}
