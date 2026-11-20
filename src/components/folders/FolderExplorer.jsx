import { useMemo, useState } from "react"
import { ChevronRight, Download, FileCheck2, FileSignature, FolderInput, FolderOpen, FolderPlus, House, LayoutGrid, List, Lock, PencilLine, Trash2, Upload } from "lucide-react"
import RowActionsMenu from "../RowActionsMenu"
import { EmptyState } from "../page"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Modal } from "../ui/modal"
import { ToastBridge } from "../ui/sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import FolderTree from "./FolderTree"
import MoveModal from "./MoveModal"
import NameModal from "./NameModal"
import UploadModal from "./UploadModal"
import { FileTypeIcon, FolderGlyph } from "./FolderPicker"
import { ActionBadge } from "./DocActionModals"
import {
  childrenOf,
  clientRoot,
  countItems,
  fileKind,
  fileSize,
  findNode,
  findPath,
  insertInto,
  isEditable,
  moveNode,
  newFile,
  newFolder,
  parentIdOf,
  removeNode,
  updateNode,
  visibleTree,
} from "../../lib/folderTree"
import { cn } from "../../lib/utils"

/** A file waiting for the client's approval or signature (done ones act like normal files). */
const needsAction = (n) => n.type === "file" && n.action?.status === "pending"

const itemsLabel = (c) => `${c.folders + c.files} item${c.folders + c.files === 1 ? "" : "s"}`

/**
 * Client file explorer (same layout as the admin's).
 * Props: items (full tree) · onChange(items) · onDownload(file) · me (name for "Added by")
 *
 * • Folders named "Private" are never shown.
 * • Only "Client Uploaded Documents" can be changed (upload, new folder, rename, move, delete).
 * • Everything else — e.g. "Firm Docs Shared With Client" — is read only: open and download.
 * • Default (locked) folders can't be renamed, moved or deleted.
 * • Files waiting for approval / signature open the review window via onReview(file);
 *   once approved, disapproved or signed they behave like normal files (status badge only).
 */
export default function FolderExplorer({ items, onChange, onDownload, onReview, me = "You" }) {
  const view = useMemo(() => visibleTree(items), [items]) // what the client can see
  const home = clientRoot(view)

  const [currentId, setCurrentId] = useState(null) // null = top level
  const [expanded, setExpanded] = useState(() => new Set(home ? [home.id] : []))
  const [modal, setModal] = useState(null) // { kind: 'folder'|'upload'|'rename'|'move'|'delete', targetId, nodeId }
  const [layout, setLayout] = useState("list") // 'list' | 'grid'
  const [toast, setToast] = useState("")
  const notify = (m) => {
    setToast(m)
    setTimeout(() => setToast(""), 2400)
  }

  const current = currentId ? findNode(view, currentId) : null
  const path = currentId ? findPath(view, currentId) || [] : []
  const list = [...childrenOf(view, currentId)].sort((a, b) => (a.type === b.type ? 0 : a.type === "folder" ? -1 : 1))
  const where = (id) => (id ? findNode(view, id)?.name : "the top level")
  const canEdit = (id) => isEditable(view, id)
  const notEditable = (f) => !canEdit(f.id) // for the folder pickers
  const currentEditable = currentId ? canEdit(currentId) : true // top level: actions go to the client folder

  /** Where New folder / Upload start: the folder being viewed if editable, else "Client Uploaded Documents". */
  const defaultTarget = () => (currentId && canEdit(currentId) ? currentId : home?.id ?? null)
  const open = (id) => {
    setCurrentId(id)
    if (id) setExpanded((s) => new Set([...s, id, ...(findPath(view, id) || []).map((f) => f.id)]))
  }
  const toggle = (id) =>
    setExpanded((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const startUpload = (folderId) => setModal({ kind: "upload", targetId: folderId })

  // ── changes: every one checks the target is in the client's own folder ──
  const doUpload = (files, target) => {
    if (!canEdit(target)) return
    const nodes = files.map((f) =>
      newFile(f.name, f.size, f.type, { addedBy: me, url: f.file ? URL.createObjectURL(f.file) : undefined }) // local link until the API returns one
    )
    onChange(insertInto(items, target, nodes))
    open(target)
    setModal(null)
    notify(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""} to ${where(target)}`)
  }

  const menuFor = (n, className) => {
    const editable = canEdit(n.id)
    const extra = []
    if (n.type === "folder") {
      extra.push({ label: "Open", icon: FolderOpen, onClick: () => open(n.id) })
      if (editable) {
        extra.push({ label: "New folder", icon: FolderPlus, onClick: () => setModal({ kind: "folder", targetId: n.id }) })
        extra.push({ label: "Upload file", icon: Upload, onClick: () => startUpload(n.id) })
      }
    } else {
      // Only files still waiting on the client open the approve / sign window
      if (needsAction(n) && onReview) {
        const isSign = n.action.type === "signature"
        extra.push({ label: isSign ? "Review & sign" : "Review & approve", icon: isSign ? FileSignature : FileCheck2, onClick: () => onReview(n) })
      }
      extra.push({ label: "Download", icon: Download, onClick: () => onDownload(n) })
    }
    if (editable && !n.locked) {
      extra.push({ label: "Rename", icon: PencilLine, onClick: () => setModal({ kind: "rename", nodeId: n.id }) })
      extra.push({ label: "Move", icon: FolderInput, onClick: () => setModal({ kind: "move", nodeId: n.id }) })
    }
    return (
      <RowActionsMenu label={n.name} className={className} extra={extra} onDelete={editable && !n.locked ? () => setModal({ kind: "delete", nodeId: n.id }) : undefined} />
    )
  }

  const node = modal?.nodeId ? findNode(view, modal.nodeId) : null
  const delCount = node?.type === "folder" ? countItems(node.children) : null
  const crumb = (on) =>
    cn(
      "inline-flex h-7 max-w-[280px] items-center gap-1.5 truncate rounded-md px-2 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      on ? "font-medium text-foreground" : "text-muted-foreground"
    )
  const segBtn = (on) =>
    cn(
      "inline-flex h-[26px] items-center rounded px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      on ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
    )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Left: folder tree */}
      <nav aria-label="Folder tree" className="border-b bg-subtle/50 p-2 lg:border-b-0 lg:border-r">
        <div className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Folders</div>
        <FolderTree items={view} currentId={currentId} expanded={expanded} onToggle={toggle} onOpen={open} />
      </nav>

      {/* Right: toolbar + contents */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5 sm:px-4">
          <nav aria-label="Folder path" className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 text-sm">
            <button type="button" onClick={() => open(null)} className={crumb(!currentId)}>
              <House className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
              All folders
            </button>
            {path.map((f) => (
              <span key={f.id} className="flex min-w-0 items-center gap-0.5">
                <ChevronRight className="h-3.5 w-3.5 flex-none text-muted-foreground/60" aria-hidden="true" />
                <button type="button" onClick={() => open(f.id)} aria-current={f.id === currentId ? "page" : undefined} className={crumb(f.id === currentId)}>
                  {f.name}
                </button>
              </span>
            ))}
          </nav>
          <div role="toolbar" aria-label="Folder actions" className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Layout" className="inline-flex h-8 items-center gap-0.5 rounded-md border bg-muted p-0.5">
              <button type="button" aria-pressed={layout === "list"} aria-label="List view" title="List view" onClick={() => setLayout("list")} className={segBtn(layout === "list")}>
                <List className="h-4 w-4" />
              </button>
              <button type="button" aria-pressed={layout === "grid"} aria-label="Grid view" title="Grid view" onClick={() => setLayout("grid")} className={segBtn(layout === "grid")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            {currentEditable ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => setModal({ kind: "folder", targetId: defaultTarget() })}>
                  <FolderPlus />
                  New folder
                </Button>
                <Button type="button" size="sm" onClick={() => startUpload(defaultTarget())}>
                  <Upload />
                  Upload
                </Button>
              </>
            ) : (
              <Badge variant="neutral" shape="pill" className="h-8 px-3">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Read only
              </Badge>
            )}
          </div>
        </div>

        {/* Read-only notice inside firm folders */}
        {currentId && !currentEditable && (
          <p className="flex items-center gap-2 border-b bg-subtle px-4 py-2.5 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 flex-none" aria-hidden="true" />
            Shared with you by your firm. You can open and download these files, but not change them.
          </p>
        )}

        {list.length === 0 ? (
          <div className="p-4 sm:p-6">
            <div className="rounded-xl border-2 border-dashed bg-subtle/40">
              {currentEditable ? (
                <EmptyState
                  icon={FolderOpen}
                  title={current ? `“${current.name}” is empty` : "No folders yet"}
                  description="Upload files or create a folder to organise this space."
                  action={
                    <>
                      <Button size="sm" onClick={() => startUpload(defaultTarget())}>
                        <Upload />
                        Upload files
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setModal({ kind: "folder", targetId: defaultTarget() })}>
                        <FolderPlus />
                        New folder
                      </Button>
                    </>
                  }
                />
              ) : (
                <EmptyState icon={FolderOpen} title={`“${current?.name}” is empty`} description="Nothing has been shared in this folder yet." />
              )}
            </div>
          </div>
        ) : layout === "grid" ? (
          <ul aria-label={current ? `Contents of ${current.name}` : "Top level"} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4">
            {list.map((n) => {
              const isFolder = n.type === "folder"
              const c = isFolder ? countItems(n.children) : null
              return (
                <li key={n.id} className="group relative" onDoubleClick={() => isFolder && open(n.id)}>
                  <button
                    type="button"
                    onClick={() => (isFolder ? open(n.id) : needsAction(n) && onReview ? onReview(n) : onDownload(n))}
                    className="flex w-full flex-col items-start gap-3 rounded-lg border bg-card p-3.5 text-left shadow-xs transition-[border-color,box-shadow,background-color] hover:border-line-strong hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {isFolder ? (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10" aria-hidden="true">
                        <FolderGlyph locked={n.locked} className="h-5 w-5" />
                      </span>
                    ) : (
                      <FileTypeIcon name={n.name} tile className="h-10 w-10 [&_svg]:h-5 [&_svg]:w-5" />
                    )}
                    <span className="w-full min-w-0 pr-6">
                      <span className="block truncate text-sm font-medium text-foreground">{n.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{isFolder ? itemsLabel(c) : `${fileKind(n.name)} · ${fileSize(n.size)}`}</span>
                      {!isFolder && n.action && <ActionBadge action={n.action} className="mt-1.5" />}
                    </span>
                  </button>
                  {n.locked && (
                    <Badge variant="neutral" className="pointer-events-none absolute left-[3.75rem] top-3.5">
                      <Lock className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                  <div className="absolute right-2 top-2">{menuFor(n, "opacity-70 group-hover:opacity-100 data-[state=open]:opacity-100")}</div>
                </li>
              )
            })}
          </ul>
        ) : (
          <Table className="min-w-[520px]" aria-label={current ? `Contents of ${current.name}` : "Top level"}>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-28">Size</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((n) => {
                const c = n.type === "folder" ? countItems(n.children) : null
                return (
                  <TableRow key={n.id} onDoubleClick={() => n.type === "folder" && open(n.id)}>
                    <TableCell className="py-2">
                      {n.type === "folder" ? (
                        <button
                          type="button"
                          onClick={() => open(n.id)}
                          className="group/name flex min-w-0 items-center gap-2.5 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <FolderGlyph locked={n.locked} />
                          <span className="truncate underline-offset-4 group-hover/name:underline">{n.name}</span>
                          {n.locked && <Badge variant="neutral">Default</Badge>}
                          {!currentId && !canEdit(n.id) && (
                            <Badge variant="neutral">
                              <Lock className="h-3 w-3" />
                              Read only
                            </Badge>
                          )}
                        </button>
                      ) : (
                        <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                          <button
                            type="button"
                            onClick={() => (needsAction(n) && onReview ? onReview(n) : onDownload(n))}
                            title={needsAction(n) ? `Review ${n.name}` : `Download ${n.name}`}
                            className="group/name flex min-w-0 items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <FileTypeIcon name={n.name} />
                            <span className="truncate underline-offset-4 group-hover/name:underline">{n.name}</span>
                          </button>
                          <ActionBadge action={n.action} />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">{n.type === "folder" ? "Folder" : fileKind(n.name)}</TableCell>
                    <TableCell className="py-2 tabular-nums text-muted-foreground">{n.type === "folder" ? itemsLabel(c) : fileSize(n.size)}</TableCell>
                    <TableCell className="py-2 text-right">{menuFor(n)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals — pickers only offer folders the client can change */}
      {modal?.kind === "folder" && (
        <NameModal
          title="New folder"
          label="Folder name"
          placeholder="e.g. Receipts"
          submitLabel="Create folder"
          items={view}
          initialTarget={modal.targetId}
          isDisabled={notEditable}
          onClose={() => setModal(null)}
          onSave={(name, target) => {
            if (!canEdit(target)) return
            onChange(insertInto(items, target, [newFolder(name)]))
            open(target)
            setModal(null)
            notify(`Created folder “${name}” in ${where(target)}`)
          }}
        />
      )}
      {modal?.kind === "upload" && (
        <UploadModal items={view} initialTarget={modal.targetId} isDisabled={notEditable} onClose={() => setModal(null)} onUpload={doUpload} />
      )}
      {modal?.kind === "rename" && node && (
        <NameModal
          title={`Rename ${node.type}`}
          label={node.type === "folder" ? "Folder name" : "File name"}
          initial={node.name}
          submitLabel="Rename"
          siblings={childrenOf(view, parentIdOf(view, node.id))}
          exceptId={node.id}
          onClose={() => setModal(null)}
          onSave={(name) => {
            if (!canEdit(node.id) || node.locked) return
            onChange(updateNode(items, node.id, (x) => ({ ...x, name })))
            setModal(null)
            notify(`Renamed to “${name}”`)
          }}
        />
      )}
      {modal?.kind === "move" && node && (
        <MoveModal
          items={view}
          nodeId={node.id}
          isDisabled={notEditable}
          onClose={() => setModal(null)}
          onMove={(target) => {
            if (!canEdit(node.id) || !canEdit(target) || node.locked) return
            onChange(moveNode(items, node.id, target))
            setModal(null)
            notify(`Moved “${node.name}” to ${where(target)}`)
          }}
        />
      )}
      {modal?.kind === "delete" && node && (
        <Modal
          title={`Delete “${node.name}”?`}
          onClose={() => setModal(null)}
          description={
            node.type === "folder" && delCount.folders + delCount.files > 0
              ? `This also deletes everything inside it (${delCount.folders} folder${delCount.folders === 1 ? "" : "s"}, ${delCount.files} file${delCount.files === 1 ? "" : "s"}).`
              : "This can’t be undone."
          }
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (!canEdit(node.id) || node.locked) return
                  if (currentId && (node.id === currentId || (findPath(view, currentId) || []).some((f) => f.id === node.id))) setCurrentId(parentIdOf(view, node.id) ?? null)
                  onChange(removeNode(items, node.id))
                  setModal(null)
                  notify(`Deleted “${node.name}”`)
                }}
              >
                <Trash2 />
                Delete {node.type}
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-lg border bg-subtle px-3 py-2.5 text-sm">
            {node.type === "folder" ? <FolderGlyph locked={node.locked} /> : <FileTypeIcon name={node.name} />}
            <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
            <span className="text-xs text-muted-foreground">{node.type === "folder" ? itemsLabel(delCount) : fileSize(node.size)}</span>
          </div>
        </Modal>
      )}
      <ToastBridge message={toast} />
    </div>
  )
}
