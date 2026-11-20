import { chatsToTodos } from "./chatTodos"
import { pendingDocActions } from "./folderTree"

/**
 * Everything waiting on the client, grouped by category.
 * Built from the same data each page uses, so Home, the menu badges
 * and the pages always agree.
 */
export function getPending({ chats = [], invoices = [], proposals = [], organizers = [], documents = [] }) {
  return {
    // Most urgent first: earliest due date, then most unread
    chats: chatsToTodos(chats).sort(
      (a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || b.unread - a.unread
    ),
    invoices: invoices.filter((i) => i.status !== "Paid"),
    proposals: proposals.filter((p) => p.status === "Awaiting signature"),
    organizers: organizers.filter((o) => o.status !== "Submitted"),
    documents: documents.filter((d) => d.status === "Requested"),
  }
}

/** Counts shown as small badges next to menu items. */
export function getMenuBadges(data) {
  const p = getPending(data)
  return {
    "/chatstasks": (data.chats || []).reduce((sum, c) => sum + (c.unread || 0), 0),
    "/billing": p.invoices.length,
    "/proposalsels": p.proposals.length,
    "/organizers": p.organizers.length,
    // requested uploads + files waiting for approval or signature
    "/document": p.documents.length + pendingDocActions(data.folders || []).length,
  }
}
