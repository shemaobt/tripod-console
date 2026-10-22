/**
 * Touch-target sizing, the one place it is decided. The HIG asks for 44×44pt on a touch
 * screen and never less than 28×28pt (apple-hig, foundations/accessibility.md); the console
 * draws most of its small controls at 30px or less, sized for a mouse.
 *
 * Both rules only act under `touch:` — `(pointer: coarse)`, declared in index.css — so the
 * desktop drawing is untouched. 44px is written in px on purpose: it is a finger, not a
 * piece of the interface scale, and at lg the root is 82.8%, where 2.75rem would be 36px.
 */
export const touch = {
  /**
   * An invisible ::after centred on the control, at least 44×44, so the tap lands even
   * though the control keeps its drawn size. For controls that stand alone or sit in a row
   * with ≥ 44px of their own width (text links, switches, tab segments, the (i) icon, a
   * dialog's ×). Carries `relative`; an absolutely positioned control passes its own
   * `absolute` after this in `cn()` and tailwind-merge keeps that one.
   */
  target:
    "relative touch:after:absolute touch:after:left-1/2 touch:after:top-1/2 touch:after:h-[max(100%,44px)] touch:after:w-[max(100%,44px)] touch:after:-translate-x-1/2 touch:after:-translate-y-1/2",
  /**
   * Icon buttons drawn at 30×30 that sit next to each other (edit beside delete): an
   * invisible area would overlap the neighbour and hand a tap on Edit to Delete, so on a
   * touch screen the button itself grows to 44×44.
   */
  icon: "touch:h-[44px] touch:w-[44px]",
} as const
