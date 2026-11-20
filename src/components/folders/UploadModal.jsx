import { useRef, useState } from "react"
import { CloudUpload, FolderOpen, X } from "lucide-react"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import FolderPicker, { FileTypeIcon, pathLabel } from "./FolderPicker"
import { childrenOf, fileSize, uniqueName } from "../../lib/folderTree"
import { cn } from "../../lib/utils"

const MAX_SIZE = 25 * 1024 * 1024 // 25 MB per file

/**
 * Pick where to upload, then choose (or drop) files.
 * Calls onUpload([{ name, size, type, file }], targetId) — `file` is the browser File, for the real upload.
 * isDisabled limits the picker (client portal: only "Client Uploaded Documents").
 */
export default function UploadModal({ items, initialTarget, onUpload, onClose, isDisabled, title = "Upload files", description = "Choose a folder, then add the files to upload." }) {
  const [target, setTarget] = useState(initialTarget)
  const [files, setFiles] = useState([])
  const [rejected, setRejected] = useState([])
  const [over, setOver] = useState(false)
  const input = useRef(null)
  const add = (list) => {
    const all = [...list]
    setRejected(all.filter((x) => x.size > MAX_SIZE).map((x) => x.name))
    setFiles((f) => [
      ...f,
      ...all.filter((x) => x.size <= MAX_SIZE).map((x) => ({ key: `${x.name}-${x.size}-${Math.random()}`, name: x.name, size: x.size, type: x.type, file: x })),
    ])
  }

  // names after upload in the chosen folder ("W2.pdf" → "W2 (2).pdf" if taken)
  const finalNames = (() => {
    const sib = [...childrenOf(items, target)]
    return files.map((f) => {
      const n = uniqueName(f.name, sib)
      sib.push({ name: n })
      return n
    })
  })()
  const totalSize = files.reduce((n, f) => n + (f.size || 0), 0)

  return (
    <Modal
      title={title}
      description={description}
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          {files.length > 0 && (
            <span className="mr-auto text-xs tabular-nums text-muted-foreground">
              {files.length} file{files.length > 1 ? "s" : ""} · {fileSize(totalSize)}
            </span>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!files.length || !target} onClick={() => onUpload(files.map((f, i) => ({ ...f, name: finalNames[i] })), target)}>
            {files.length ? `Upload ${files.length} file${files.length > 1 ? "s" : ""}` : "Upload"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Upload to</span>
          <FolderPicker items={items} value={target} onChange={setTarget} isDisabled={isDisabled} showRoot={false} label="Upload to" maxHeight="max-h-48" />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
            Files go to: <span className="truncate font-medium text-foreground">{pathLabel(items, target)}</span>
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            add(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            over ? "border-primary bg-primary/5" : "border-line-strong bg-subtle/50 hover:border-muted-foreground/40"
          )}
        >
          <span
            className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-card shadow-card transition-colors", over ? "text-primary" : "text-muted-foreground")}
            aria-hidden="true"
          >
            <CloudUpload className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium">{over ? "Drop to add files" : "Drag and drop files here"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">PDF, Word, Excel, images and more · up to 25 MB each</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            Browse files
          </Button>
          <input
            ref={input}
            type="file"
            multiple
            className="hidden"
            aria-label="Choose files to upload"
            onChange={(e) => {
              add(e.target.files || [])
              e.target.value = ""
            }}
          />
        </div>

        {rejected.length > 0 && (
          <p role="alert" className="text-xs font-medium text-destructive">
            Over 25 MB, not added: {rejected.join(", ")}
          </p>
        )}

        {files.length > 0 && (
          <ul aria-label="Files to upload" className="flex max-h-48 flex-col divide-y overflow-y-auto rounded-lg border">
            {files.map((f, i) => (
              <li key={f.key} className="flex items-center gap-3 px-3 py-2 text-sm">
                <FileTypeIcon name={f.name} tile />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{finalNames[i]}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {fileSize(f.size)}
                    {finalNames[i] !== f.name && <span className="text-amber-700 dark:text-amber-400"> · renamed — “{f.name}” exists</span>}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFiles((l) => l.filter((x) => x.key !== f.key))}
                  aria-label={`Remove ${f.name}`}
                  className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300"
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
