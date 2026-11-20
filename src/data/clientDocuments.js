/**
 * Documents your accountant has asked for (shown on Home and at the top of Documents).
 * folderId = where the upload is saved, inside "Client Uploaded Documents".
 * status: "Requested" (still needed) | "Received".
 */
export const clientDocuments = [
  { _id: "req-1", name: "W-2 forms", folder: "2026 tax return", folderId: "c-tax", requestedBy: "Ava Thompson", status: "Requested" },
  { _id: "req-2", name: "1099-INT from your bank", folder: "2026 tax return", folderId: "c-tax", requestedBy: "Ava Thompson", status: "Requested" },
  { _id: "req-3", name: "Q3 receipts", folder: "Receipts › Q3 2026", folderId: "c-receipts-q3", requestedBy: "Jonas Berg", status: "Requested" },
]
