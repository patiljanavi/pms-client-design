import { useState } from "react"
import { ChevronRight, File, FileArchive, FileImage, FileSpreadsheet, FileText, Folder, FolderLock, House } from "lucide-react"
import { RadioDot } from "../ui/radio-dot"
import { findPath } from "../../lib/folderTree"
import { cn } from "../../lib/utils"

/* ---------- File-type icons (shared by the explorer, tree and upload dialog) ---------- */
const FILE_TYPES = [
  { exts: ["pdf"], icon: FileText, tone: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  { exts: ["doc", "docx", "txt", "rtf", "odt"], icon: FileText, tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { exts: ["xls", "xlsx", "csv", "ods", "numbers"], icon: FileSpreadsheet, tone: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
  { exts: ["jpg", "jpeg", "png", "gif", "webp", "heic", "svg"], icon: FileImage, tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { exts: ["zip", "rar", "7z", "gz"], icon: FileArchive, tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
]
const typeOf = (name = "") => {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : ""
  return FILE_TYPES.find((t) => t.exts.includes(ext)) || { icon: File, tone: "bg-muted text-muted-foreground" }
}

/** Coloured file icon picked from the file name's extension. `tile` draws it on a soft square. */
export function FileTypeIcon({ name, tile = false, className }) {
  const { icon: Icon, tone } = typeOf(name)
  if (!tile) {
    const text = tone.split(" ").filter((c) => c.startsWith("text-") || c.startsWith("dark:text-"))
    return <Icon className={cn("h-4 w-4 flex-none", text, className)} aria-hidden="true" />
  }
  return (
    <span className={cn("inline-flex h-8 w-8 flex-none items-center justify-center rounded-md", tone, className)} aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  )
}

/** Folder icon: a lock for default (locked) folders. */
export function FolderGlyph({ locked, className, label }) {
  return locked ? (
    <FolderLock className={cn("h-4 w-4 flex-none text-muted-foreground", className)} aria-label={label} aria-hidden={label ? undefined : true} />
  ) : (
    <Folder className={cn("h-4 w-4 flex-none fill-amber-100 text-amber-500 dark:fill-amber-400/20 dark:text-amber-400", className)} aria-hidden="true" />
  )
}

/**
 * Choose a folder from the tree (same props as the admin).
 * Props: items · value (folder id, null = top level) · onChange(id) · isDisabled(folder) · label · showRoot · expandTo
 * The client portal passes isDisabled so only "Client Uploaded Documents" folders can be picked.
 */
export default function FolderPicker({ items, value, onChange, isDisabled = () => false, label = "Folder", showRoot = true, maxHeight = "max-h-60", expandTo }) {
  const [open, setOpen] = useState(() => {
    const start = expandTo ?? value
    if (!start) return new Set()
    return new Set((findPath(items, start) || []).map((f) => f.id))
  })
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const optionClass = (on, disabled) =>
    cn(
      "flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      on ? "bg-primary/10 font-medium text-foreground" : "hover:bg-accent",
      disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
    )

  const row = (f, depth) => {
    const kids = f.children.filter((c) => c.type === "folder")
    const disabled = isDisabled(f)
    const isOpen = open.has(f.id)
    const on = value === f.id
    return (
      <li key={f.id}>
        <div className="flex items-center" style={{ paddingLeft: depth * 16 }}>
          <button
            type="button"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${f.name}`}
            disabled={!kids.length}
            onClick={() => toggle(f.id)}
            className={cn(
              "inline-flex h-6 w-6 flex-none items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",
              !kids.length && "invisible"
            )}
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
          </button>
          <button type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => onChange(f.id)} className={optionClass(on, disabled)}>
            <RadioDot on={on} />
            <FolderGlyph locked={f.locked} />
            <span className="truncate">{f.name}</span>
          </button>
        </div>
        {isOpen && kids.length > 0 && <ul>{kids.map((k) => row(k, depth + 1))}</ul>}
      </li>
    )
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("overflow-y-auto rounded-lg border bg-card p-1.5", maxHeight)}>
      {showRoot && (
        <div className="flex items-center">
          <span className="h-6 w-6 flex-none" aria-hidden="true" />
          <button type="button" role="radio" aria-checked={value === null} onClick={() => onChange(null)} className={optionClass(value === null, false)}>
            <RadioDot on={value === null} />
            <House className="h-4 w-4 flex-none text-muted-foreground" aria-hidden="true" />
            Top level
          </button>
        </div>
      )}
      <ul>{items.filter((n) => n.type === "folder").map((f) => row(f, 0))}</ul>
    </div>
  )
}

/** "Client Uploaded Documents › Receipts" (or "Top level"). */
export const pathLabel = (items, id) => (id ? (findPath(items, id) || []).map((f) => f.name).join(" › ") : "Top level")
