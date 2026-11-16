import { APP_NAME } from "../config"
import { cn } from "../lib/utils"

export default function BrandMark({ small = false, hideNameOnMobile = false }) {
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground",
          small ? "h-9 w-9 text-base" : "h-10 w-10 text-lg"
        )}
      >
        H
      </span>
      <span className={cn("font-bold", small ? "text-base" : "text-lg", hideNameOnMobile && "hidden md:inline")}>
        {APP_NAME}
      </span>
    </span>
  )
}
