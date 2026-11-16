import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva("inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
      neutral: "border-transparent bg-muted text-muted-foreground",
      success: "border-transparent bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
      warning: "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
      info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
      danger: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    },
    shape: {
      default: "rounded-md",
      pill: "rounded-full",
    },
  },
  defaultVariants: { variant: "default", shape: "pill" },
})

/** `dot` adds a small status dot before the text. */
function Badge({ className, variant, shape, dot = false, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, shape }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
