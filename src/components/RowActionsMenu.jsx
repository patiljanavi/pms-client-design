import { MoreVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { cn } from "../lib/utils"

/**
 * "⋮" menu for a row (same props as the admin's RowActionsMenu).
 * extra = [{ label, icon, onClick }]; onDelete adds a red Delete item at the bottom.
 */
export default function RowActionsMenu({ label, extra = [], onDelete, className }) {
  if (!extra.length && !onDelete) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${label}`}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {extra.map(({ label: l, icon: Icon, onClick }) => (
          <DropdownMenuItem key={l} onSelect={onClick}>
            {Icon && <Icon />} {l}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <>
            {extra.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
