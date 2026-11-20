/**
 * Folder tree helpers for the client portal — same names and nested shape as the admin's
 * data/folderTemplates.js, plus the client rules:
 *
 *   items = [{ id, type: "folder", name, locked?, children: [...] }, { id, type: "file", name, size, mime, url? }]
 *
 *   • A folder named "Private" (any level, any case) is hidden from the client, with everything in it.
 *   • "Client Uploaded Documents" is the client's own space: upload, new folder, rename, move, delete.
 *   • "Firm Documents Shared with Client" (and anything else) is read only: open and download.
 *   • Locked (default) folders can't be renamed, moved or deleted — same as the admin.
 */

export const CLIENT_FOLDER_NAME = "Client Uploaded Documents"
export const FIRM_SHARED_FOLDER_NAME = "Firm Documents Shared with Client"

// Folder names are compared ignoring case and extra spaces
const norm = (name = "") => name.trim().replace(/\s+/g, " ").toLowerCase()
const isPrivateName = (name) => norm(name) === "private"
const isClientFolderName = (name) => norm(name) === norm(CLIENT_FOLDER_NAME)

let seq = 1
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

/* ---------- visibility & permissions ---------- */

/** The tree the client may see: every folder named "Private" removed (with its contents). */
export function visibleTree(items) {
  return items
    .filter((n) => !(n.type === "folder" && isPrivateName(n.name)))
    .map((n) => (n.type === "folder" ? { ...n, children: visibleTree(n.children || []) } : n))
}

/** The client's own top-level folder. */
export const clientRoot = (items) => items.find((n) => n.type === "folder" && isClientFolderName(n.name)) || null

/** True when the node is the client folder or anywhere inside it. Top level (null) isn't editable. */
export function isEditable(items, id) {
  if (!id) return false
  const path = findPath(items, id)
  return Boolean(path?.length && isClientFolderName(path[0].name))
}

/* ---------- reading ---------- */

export function findNode(items, id) {
  for (const n of items) {
    if (n.id === id) return n
    if (n.type === "folder") {
      const hit = findNode(n.children || [], id)
      if (hit) return hit
    }
  }
  return null
}

/** Folders from the top down to the node (inclusive), or null if not found. */
export function findPath(items, id, trail = []) {
  for (const n of items) {
    const next = [...trail, n]
    if (n.id === id) return next.filter((x) => x.type === "folder")
    if (n.type === "folder") {
      const hit = findPath(n.children || [], id, next)
      if (hit) return hit
    }
  }
  return null
}

export function parentIdOf(items, id, parentId = null) {
  for (const n of items) {
    if (n.id === id) return parentId
    if (n.type === "folder") {
      const hit = parentIdOf(n.children || [], id, n.id)
      if (hit !== undefined) return hit
    }
  }
  return undefined
}

/** Children of a folder (null = top level). */
export const childrenOf = (items, id) => (id ? findNode(items, id)?.children || [] : items)

/** Counts everything inside: { folders, files }. */
export function countItems(children = []) {
  return children.reduce(
    (acc, n) => {
      if (n.type === "folder") {
        const inner = countItems(n.children)
        return { folders: acc.folders + 1 + inner.folders, files: acc.files + inner.files }
      }
      return { ...acc, files: acc.files + 1 }
    },
    { folders: 0, files: 0 }
  )
}

/** Ids of a node and everything inside it. */
export function subtreeIds(node, acc = new Set()) {
  if (!node) return acc
  acc.add(node.id)
  if (node.type === "folder") (node.children || []).forEach((c) => subtreeIds(c, acc))
  return acc
}

/* ---------- writing (all return a new tree) ---------- */

export function insertInto(items, targetId, nodes) {
  if (!targetId) return [...items, ...nodes]
  return items.map((n) =>
    n.id === targetId
      ? { ...n, children: [...(n.children || []), ...nodes] }
      : n.type === "folder"
        ? { ...n, children: insertInto(n.children || [], targetId, nodes) }
        : n
  )
}

export function updateNode(items, id, change) {
  return items.map((n) => (n.id === id ? change(n) : n.type === "folder" ? { ...n, children: updateNode(n.children || [], id, change) } : n))
}

export function removeNode(items, id) {
  return items.filter((n) => n.id !== id).map((n) => (n.type === "folder" ? { ...n, children: removeNode(n.children || [], id) } : n))
}

export function moveNode(items, id, targetId) {
  const node = findNode(items, id)
  if (!node) return items
  return insertInto(removeNode(items, id), targetId, [node])
}

export const newFolder = (name) => ({ id: uid("folder"), type: "folder", name, children: [], updatedAt: new Date().toISOString() })
export const newFile = (name, size = 0, mime = "", extra = {}) => ({ id: uid("file"), type: "file", name, size, mime, updatedAt: new Date().toISOString(), ...extra })

/* ---------- names & labels ---------- */

/** "Report.pdf" → "Report (2).pdf" when the name is already used among siblings. */
export function uniqueName(name, siblings = []) {
  const taken = new Set(siblings.map((s) => s.name.toLowerCase()))
  if (!taken.has(name.toLowerCase())) return name
  const dot = name.lastIndexOf(".")
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ""
  for (let i = 2; ; i++) {
    const candidate = `${base} (${i})${ext}`
    if (!taken.has(candidate.toLowerCase())) return candidate
  }
}

/** Error text for a name, or "" when it’s fine. */
export function nameError(name, siblings = [], exceptId) {
  const clean = (name || "").trim()
  if (!clean) return "Enter a name."
  if (/[\\/:*?"<>|]/.test(clean)) return "Names can’t contain \\ / : * ? \" < > |"
  if (isPrivateName(clean)) return "“Private” is reserved for your firm. Choose another name."
  if (siblings.some((s) => s.id !== exceptId && s.name.trim().toLowerCase() === clean.toLowerCase())) return "Something with this name is already here."
  return ""
}

const KINDS = { pdf: "PDF", doc: "Word", docx: "Word", xls: "Excel", xlsx: "Excel", csv: "CSV", jpg: "Image", jpeg: "Image", png: "Image", gif: "Image", webp: "Image", heic: "Image", zip: "Archive", txt: "Text" }
export const fileKind = (name = "") => {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : ""
  return KINDS[ext] || (ext ? ext.toUpperCase() : "File")
}

export function fileSize(bytes = 0) {
  if (!bytes) return "—"
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/* ---------- document actions (approve / sign) ---------- */

/** Every file in the tree with the folder path it sits in: [{ file, path }]. */
export function allFiles(items, trail = []) {
  return items.flatMap((n) => (n.type === "folder" ? allFiles(n.children || [], [...trail, n]) : [{ file: n, path: trail }]))
}

/** Files waiting for the client's approval or signature (only ones the client can see). */
export function pendingDocActions(items) {
  return allFiles(visibleTree(items)).filter(({ file }) => file.action?.status === "pending")
}
