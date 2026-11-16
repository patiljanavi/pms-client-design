/** status: "Due" | "Paid" | "Overdue". Amount owed = amount - credit. */
export const clientInvoices = [
  { _id: "inv-1", number: "INV-1002", description: "October bookkeeping", issuedAt: "2026-11-10", dueDate: "2026-11-20", amount: 742.8, credit: 50, status: "Due" },
  { _id: "inv-2", number: "INV-0998", description: "September bookkeeping", issuedAt: "2026-10-10", dueDate: "2026-10-20", amount: 450, credit: 0, status: "Paid" },
  { _id: "inv-3", number: "INV-0991", description: "Payroll setup", issuedAt: "2026-09-30", dueDate: "2026-10-10", amount: 300, credit: 0, status: "Paid" },
]
