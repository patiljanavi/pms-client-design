/**
 * Everything waiting on the client. Home splits these by `type`
 * (sign, pay, organizer, upload) for the summary cards.
 * Chat items (unread messages, open chat tasks) are added on Home from clientChats.js
 * and lists them sorted by due date.
 */
export const clientTodos = [
  {
    _id: "td-1",
    type: "sign",
    title: "Sign your 2026 engagement letter",
    detail: "Proposal",
    dueDate: "2026-11-18",
    actionLabel: "Review & sign",
    actionPath: "/proposalsels",
  },
  {
    _id: "td-2",
    type: "pay",
    title: "Pay invoice INV-1002 · $692.80",
    detail: "October bookkeeping · $50.00 credit already applied",
    dueDate: "2026-11-20",
    amount: 692.8,
    actionLabel: "Pay now",
    actionPath: "/billing",
  },
  {
    _id: "td-3",
    type: "organizer",
    title: "Finish the 2026 tax organizer",
    detail: "Tax return",
    dueDate: "2026-11-30",
    progress: { done: 12, total: 20 },
    actionLabel: "Continue",
    actionPath: "/organizers",
  },
  {
    _id: "td-4",
    type: "upload",
    title: "Upload 3 documents",
    detail: "W-2 forms · 1099-INT from your bank · Q3 receipts",
    dueDate: "2026-12-05",
    files: ["W-2 forms", "1099-INT from your bank", "Q3 receipts"],
    actionLabel: "Upload",
    actionPath: "/document",
  },
]

export const recentlyCompleted = [
  { _id: "rc-1", title: "Paid INV-0998 · $450.00", date: "2026-11-02" },
  { _id: "rc-2", title: "Uploaded bank statements", date: "2026-10-28" },
  { _id: "rc-3", title: "Signed payroll authorization", date: "2026-10-15" },
]
