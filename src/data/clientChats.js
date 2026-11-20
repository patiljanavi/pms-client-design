/**
 * Each chat has its own messages and its own task list.
 *
 * message.sender: "client" (the signed-in client, shown on the right in green)
 *                 "firm"   (Harbor staff, shown on the left in white)
 *                 "system" (activity like a completed task, shown in the middle)
 * message.type:   "text" | "file" | "task"
 * Optional: replyTo { _id, senderName, text, type } — the message being answered
 *           reactions { "👍": ["Ava Thompson"] } — emoji → people who reacted
 *           edited: true, deleted: true
 */
export const clientChats = [
  {
    _id: "ch-1",
    subject: "A few receipts are missing",
    participants: [{ name: "Ava Thompson", initials: "AT", role: "Senior accountant" }],
    unread: 2,
    tasks: [
      { _id: "tk-1", title: "Upload the Staples receipt from Aug 14", dueDate: "2026-11-21", done: false },
      { _id: "tk-2", title: "Upload the Staples receipt from Sep 3", dueDate: "2026-11-21", done: false },
      { _id: "tk-3", title: "Confirm the $214 Amazon charge was a business expense", dueDate: "2026-11-25", done: false },
    ],
    messages: [
      { _id: "m-1", sender: "firm", senderName: "Ava Thompson", type: "text", text: "Hi Grace, I’m reconciling Q3 and a few receipts are missing.", sentAt: "2026-11-14T10:02:00" },
      { _id: "m-2", sender: "firm", senderName: "Ava Thompson", type: "text", text: "I’ve added them as tasks on the right. Could you upload them when you get a chance?", sentAt: "2026-11-14T10:03:00" },
      {
        _id: "m-3",
        sender: "client",
        senderName: "Grace Okafor",
        type: "text",
        text: "Sure — I’ll dig them out this weekend.",
        sentAt: "2026-11-14T12:41:00",
        read: true,
        replyTo: { _id: "m-2", senderName: "Ava Thompson", type: "text", text: "I’ve added them as tasks on the right. Could you upload them when you get a chance?" },
        reactions: { "🙏": ["Ava Thompson"] },
      },
      { _id: "m-4", sender: "firm", senderName: "Ava Thompson", type: "text", text: "Thank you! The Amazon one is just a yes/no — was it for the office?", sentAt: "2026-11-16T09:15:00" },
      { _id: "m-5", sender: "firm", senderName: "Ava Thompson", type: "file", text: "Q3-missing-receipts.pdf", fileSize: "84 KB", sentAt: "2026-11-16T09:16:00" },
    ],
  },
  {
    _id: "ch-2",
    subject: "October books are closed",
    participants: [{ name: "Jonas Berg", initials: "JB", role: "Bookkeeper" }],
    unread: 1,
    tasks: [
      { _id: "tk-4", title: "Review October financial statements", dueDate: "2026-11-24", done: false },
      { _id: "tk-5", title: "Upload October bank statement", dueDate: "2026-11-21", done: true },
    ],
    messages: [
      { _id: "m-6", sender: "firm", senderName: "Jonas Berg", type: "text", text: "October is reconciled. Your statements are ready for review.", sentAt: "2026-11-10T15:20:00" },
      { _id: "m-7", sender: "system", type: "task", text: "Grace Okafor completed the task “Upload October bank statement”", sentAt: "2026-11-10T17:05:00" },
      { _id: "m-8", sender: "client", senderName: "Grace Okafor", type: "text", text: "Got it, I’ll look through them this week.", sentAt: "2026-11-10T17:06:00", read: true },
      { _id: "m-8b", sender: "firm", senderName: "Jonas Berg", type: "text", text: "Quick reminder — I need your sign-off on the statements by Nov 24.", sentAt: "2026-11-15T16:40:00" },
    ],
  },
  {
    _id: "ch-3",
    subject: "Payroll setup",
    participants: [{ name: "Ava Thompson", initials: "AT", role: "Senior accountant" }],
    unread: 0,
    tasks: [
      { _id: "tk-6", title: "Sign payroll authorization (Form 8655)", dueDate: "2026-10-15", done: true },
      { _id: "tk-7", title: "Share the payroll provider login invite", dueDate: "2026-10-14", done: true },
    ],
    messages: [
      { _id: "m-9", sender: "firm", senderName: "Ava Thompson", type: "text", text: "To start payroll we need two things from you — they’re in the task list.", sentAt: "2026-10-12T11:00:00" },
      { _id: "m-10", sender: "system", type: "task", text: "Grace Okafor completed the task “Share the payroll provider login invite”", sentAt: "2026-10-14T09:30:00" },
      { _id: "m-11", sender: "system", type: "task", text: "Grace Okafor completed the task “Sign payroll authorization (Form 8655)”", sentAt: "2026-10-15T14:12:00" },
      { _id: "m-12", sender: "firm", senderName: "Ava Thompson", type: "text", text: "Thanks for signing the authorization — we’re all set.", sentAt: "2026-10-15T14:40:00", reactions: { "👍": ["Grace Okafor"], "❤️": ["Grace Okafor"] } },
    ],
  },
  {
    _id: "ch-4",
    subject: "2026 tax organizer questions",
    participants: [{ name: "Ava Thompson", initials: "AT", role: "Senior accountant" }],
    unread: 3,
    tasks: [
      { _id: "tk-8", title: "Answer the home office questions in the organizer", dueDate: "2026-11-30", done: false },
      { _id: "tk-9", title: "Send last year’s charitable donation receipts", dueDate: "2026-11-30", done: false },
    ],
    messages: [
      { _id: "m-13", sender: "firm", senderName: "Ava Thompson", type: "text", text: "Hi Grace, I see you’re 12 questions into the organizer — great progress!", sentAt: "2026-11-16T08:05:00" },
      { _id: "m-14", sender: "firm", senderName: "Ava Thompson", type: "text", text: "Two sections are left: home office and charitable donations.", sentAt: "2026-11-16T08:06:00" },
      { _id: "m-15", sender: "firm", senderName: "Ava Thompson", type: "text", text: "If you work from home more than half the week, answer “Yes” to question 14.", sentAt: "2026-11-16T08:07:00" },
    ],
  },
  {
    _id: "ch-5",
    subject: "Invoice INV-1002",
    participants: [{ name: "Maya Patel", initials: "MP", role: "Billing" }],
    unread: 1,
    tasks: [{ _id: "tk-10", title: "Pay invoice INV-1002 ($692.80)", dueDate: "2026-11-20", done: false }],
    messages: [
      { _id: "m-16", sender: "firm", senderName: "Maya Patel", type: "text", text: "Hi Grace, your October invoice is ready. We applied your $50 credit, so the total is $692.80.", sentAt: "2026-11-10T10:30:00" },
      { _id: "m-17", sender: "firm", senderName: "Maya Patel", type: "file", text: "INV-1002.pdf", fileSize: "62 KB", sentAt: "2026-11-15T10:31:00" },
    ],
  },
  {
    _id: "ch-6",
    subject: "New business address",
    participants: [{ name: "Jonas Berg", initials: "JB", role: "Bookkeeper" }],
    unread: 0,
    tasks: [{ _id: "tk-11", title: "Confirm your new business address", dueDate: "2026-11-25", done: false }],
    messages: [
      { _id: "m-18", sender: "client", senderName: "Grace Okafor", type: "text", text: "We moved offices — the new address is 214 Harbor Street, Suite 5.", sentAt: "2026-11-08T13:12:00", read: true },
      { _id: "m-19", sender: "firm", senderName: "Jonas Berg", type: "text", text: "Thanks! Please tick the task once the lease is signed so we can update the IRS records.", sentAt: "2026-11-08T14:01:00" },
    ],
  },
]
