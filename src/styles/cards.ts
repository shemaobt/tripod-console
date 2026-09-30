export const card = {
  base: "bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)]",
  hover: "transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
  interactive: "bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer",
  padded: "bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-5 sm:p-6",
  stretchedLink: "after:absolute after:inset-0",
  revealActions: "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
} as const
