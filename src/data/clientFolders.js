/**
 * Some firm files ask the client to act. file.action:
 *   { type: "approval" | "signature", status: "pending" | "approved" | "disapproved" | "signed",
 *     requestedBy, requestedAt, dueDate, note,
 *     decidedAt, reason (disapproved), signedBy, signedAt (signed) }
 *
 * The client's folder tree — same nested shape as the admin folder templates.
 * The client has two folders: "Client Uploaded Documents" (theirs to manage) and
 * "Firm Documents Shared with Client" (read only). "Private" is filtered out before the client sees anything
 * (see lib/folderTree.js); only "Client Uploaded Documents" can be changed by the client.
 */
const folder = (id, name, children = [], extra = {}) => ({ id, type: "folder", name, children, ...extra })
const file = (id, name, size, updatedAt, addedBy, action) => ({
  id,
  type: "file",
  name,
  size,
  mime: name.endsWith(".pdf") ? "application/pdf" : /\.(jpe?g|png)$/i.test(name) ? "image/jpeg" : "",
  updatedAt,
  addedBy,
  ...(action && { action }),
})

export const clientFolders = [
  folder(
    "fd-client",
    "Client Uploaded Documents",
    [
      folder("c-tax", "2026 tax return", [file("c-w2", "W-2 Okafor Holdings 2026.pdf", 182000, "2026-11-12", "Grace Okafor")]),
      folder("c-bank", "Bank statements", [
        file("c-bank-sep", "Bank statement – Sep 2026.pdf", 412000, "2026-10-28", "Grace Okafor"),
        file("c-bank-aug", "Bank statement – Aug 2026.pdf", 398000, "2026-10-28", "Grace Okafor"),
        file("c-bank-jul", "Bank statement – Jul 2026.pdf", 405000, "2026-10-28", "Grace Okafor"),
      ]),
      folder("c-receipts", "Receipts", [
        folder("c-receipts-q3", "Q3 2026", [file("c-staples", "Staples receipt Aug 14.jpg", 1240000, "2026-11-02", "Grace Okafor")]),
        folder("c-receipts-q4", "Q4 2026"),
      ]),
      file("c-lease", "Office lease agreement.pdf", 655000, "2026-10-09", "Grace Okafor"),
    ],
    { locked: true }
  ),
  folder(
    "fd-firm",
    "Firm Documents Shared with Client",
    [
      folder("s-returns", "Tax returns", [
        file("s-2025", "2025 tax return – filed copy.pdf", 1840000, "2026-04-12", "Ava Thompson"),
        file("s-2024", "2024 tax return – filed copy.pdf", 1710000, "2025-04-10", "Ava Thompson"),
        file("s-8879", "Form 8879 – IRS e-file authorization.pdf", 64000, "2026-11-14", "Ava Thompson", {
          type: "signature",
          status: "pending",
          requestedBy: "Ava Thompson",
          requestedAt: "2026-11-14",
          dueDate: "2026-11-25",
          note: "This lets us e-file your 2025 amended return. Please check your name and the refund amount, then sign.",
        }),
        file("s-amend", "2024 amended return – summary.pdf", 210000, "2026-10-20", "Ava Thompson", {
          type: "approval",
          status: "disapproved",
          requestedBy: "Ava Thompson",
          requestedAt: "2026-10-20",
          decidedAt: "2026-10-22T10:14:00",
          reason: "The home office square footage should be 140, not 104.",
        }),
      ]),
      folder("s-statements", "Financial statements", [
        file("s-oct", "October 2026 financial statements.pdf", 240000, "2026-11-10", "Jonas Berg", {
          type: "approval",
          status: "pending",
          requestedBy: "Jonas Berg",
          requestedAt: "2026-11-10",
          dueDate: "2026-11-24",
          note: "Please review your October profit & loss and balance sheet. Approve if everything looks right.",
        }),
        file("s-q3", "Q3 2026 financial statements.pdf", 310000, "2026-10-12", "Jonas Berg", {
          type: "approval",
          status: "approved",
          requestedBy: "Jonas Berg",
          requestedAt: "2026-10-12",
          decidedAt: "2026-10-15T16:02:00",
        }),
      ]),
      folder("s-letters", "Engagement letters", [
        file("s-el-2025", "2025 engagement letter – signed.pdf", 120000, "2025-11-09", "Ava Thompson", {
          type: "signature",
          status: "signed",
          requestedBy: "Ava Thompson",
          requestedAt: "2025-11-08",
          signedBy: "Grace Okafor",
          signedAt: "2025-11-09T19:15:00",
        }),
        file("s-payroll-auth", "Payroll services authorization.pdf", 88000, "2026-11-13", "Ava Thompson", {
          type: "signature",
          status: "pending",
          requestedBy: "Ava Thompson",
          requestedAt: "2026-11-13",
          dueDate: "2026-11-27",
          note: "Authorizes Harbor to run payroll and file payroll taxes for Okafor Holdings.",
        }),
      ]),
      file("s-welcome", "Welcome to Harbor.pdf", 95000, "2025-01-15", "Ava Thompson"),
    ],
    { locked: true }
  ),
  // Hidden from the client (name is "Private")
  folder(
    "fd-private",
    "Private",
    [
      folder("p-work", "Internal workpapers", [file("p-work-1", "2026 planning workpaper.xlsx", 88000, "2026-11-05", "Ava Thompson")]),
      file("p-notes", "Partner review notes.docx", 41000, "2026-11-06", "Ava Thompson"),
    ],
    { locked: true }
  ),
]
