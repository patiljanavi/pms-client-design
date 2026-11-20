import { useId, useRef, useState } from "react"
import { CloudUpload, FileText, Image as ImageIcon, X } from "lucide-react"
import { toast } from "../ui/sonner"
import { formatDate } from "../../lib/dates"
import { formatFileSize } from "../../lib/organizer"
import { cn } from "../../lib/utils"

const MAX_SIZE = 25 * 1024 * 1024 // 25 MB per file

let nextId = 1
const fileId = () => `file-${Date.now()}-${nextId++}`

/**
 * Multiple-file upload: drag & drop or "Choose files".
 * value = [{ id, name, size, type, uploadedAt, url }]
 * Swap the body of addFiles for your upload API when the backend is ready.
 */
export default function FileDropzone({ value = [], onChange, id, describedBy, invalid = false, accept }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const hintId = useId()

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    const tooBig = files.filter((f) => f.size > MAX_SIZE)
    const ok = files.filter((f) => f.size <= MAX_SIZE)
    if (tooBig.length) {
      toast.error(`${tooBig.length === 1 ? `“${tooBig[0].name}” is` : `${tooBig.length} files are`} over 25 MB`, {
        description: "Try a smaller scan or split the PDF.",
      })
    }
    if (!ok.length) return
    const added = ok.map((f) => ({
      id: fileId(),
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(f), // local preview link until the API returns a real one
    }))
    onChange([...value, ...added])
    toast.success(`${added.length} file${added.length === 1 ? "" : "s"} added`)
  }

  const remove = (fileToRemove) => {
    onChange(value.filter((f) => f.id !== fileToRemove.id))
    toast(`Removed “${fileToRemove.name}”`)
  }

  return (
    <div className="mt-1 flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm transition-colors",
          dragging ? "border-primary bg-primary/5" : invalid ? "border-destructive bg-destructive/5" : "border-line-strong bg-subtle"
        )}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card shadow-xs" aria-hidden="true">
          <CloudUpload className="h-4 w-4 text-muted-foreground" />
        </span>
        <p className="text-muted-foreground">
          Drag files here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            choose files
          </button>
        </p>
        <p id={hintId} className="text-xs text-muted-foreground">
          You can add several files at once · up to 25 MB each
        </p>
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          aria-describedby={[describedBy, hintId].filter(Boolean).join(" ")}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {value.length > 0 && <FileList files={value} onRemove={remove} />}
    </div>
  )
}

/** Uploaded files; pass onRemove to show remove buttons (left out in the sealed view). */
export function FileList({ files, onRemove }) {
  return (
    <ul className="divide-y rounded-lg border bg-card" aria-label="Uploaded files">
      {files.map((f) => {
        const Icon = f.type?.startsWith("image/") ? ImageIcon : FileText
        return (
          <li key={f.id} className="flex items-center gap-3 px-3 py-2.5">
            <Icon className={cn("h-5 w-5 shrink-0", f.type?.startsWith("image/") ? "text-sky-600 dark:text-sky-400" : "text-red-600 dark:text-red-400")} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              {f.url ? (
                <a href={f.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-foreground hover:underline">
                  {f.name}
                </a>
              ) : (
                <span className="block truncate text-sm font-medium">{f.name}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatFileSize(f.size)}
                {f.uploadedAt && ` · Added ${formatDate(f.uploadedAt, { month: "short", day: "numeric", year: "numeric" })}`}
              </span>
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(f)}
                aria-label={`Remove ${f.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
