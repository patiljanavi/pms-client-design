import { cn } from "../../lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

/**
 * Admin-style modal on top of the shadcn dialog.
 * <Modal title subtitle description onClose width="max-w-lg" footer={…} bodyClassName>…</Modal>
 */
export function Modal({ title, subtitle, description, onClose, width = "max-w-lg", footer, bodyClassName, children }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className={cn("gap-0 p-0", width)}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <p className="text-sm font-medium text-foreground">{subtitle}</p>}
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        {children && <div className={cn("px-6 py-5", bodyClassName)}>{children}</div>}
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-3.5">{footer}</div>}
      </DialogContent>
    </Dialog>
  )
}
