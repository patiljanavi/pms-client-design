import { cn } from "../../lib/utils"

/** Small radio indicator used inside custom radio buttons (e.g. the folder picker). */
export function RadioDot({ on }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full border transition-colors", on ? "border-primary" : "border-line-strong bg-card")}
    >
      {on && <span className="h-2 w-2 rounded-full bg-primary" />}
    </span>
  )
}
