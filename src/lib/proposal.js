/**
 * Proposal helpers for the client view & sign flow.
 *
 * A proposal uses the same fields the admin fills with applyProposalTemplate():
 *   general:      { proposalName, teamMembers, introductionEnabled, termsEnabled,
 *                   servicesEnabled, paymentsEnabled, skipStepper }
 *   introduction: { title, content }               content = HTML from the admin text editor
 *   terms:        { title, content }
 *   services:     { invoices: [invoice], itemizedData: { rows: [row] }, notes }
 *                 invoice = { id, name, description, dueText, rows: [row] }
 *                 row     = { id, service, description, quantity, rate, tax }   tax = % (optional)
 *   payments:     { methods: ["Credit card", ...], requireOnSign, schedule, notes }
 *
 * If your admin stores these with different names, only this file needs to change.
 */

/** The steps the client sees, in order — only the enabled ones, then "Sign". */
export function proposalSteps(proposal) {
  const g = proposal.general || {}
  const steps = []
  if (g.introductionEnabled) steps.push({ id: "introduction", label: proposal.introduction?.title || "Introduction" })
  if (g.termsEnabled) steps.push({ id: "terms", label: proposal.terms?.title || "Terms" })
  if (g.servicesEnabled) steps.push({ id: "services", label: "Services & fees" })
  if (g.paymentsEnabled) steps.push({ id: "payments", label: "Payment" })
  steps.push({ id: "sign", label: "Sign" })
  return steps
}

export const rowAmount = (r) => (Number(r.quantity) || 0) * (Number(r.rate) || 0)
export const rowTax = (r) => (rowAmount(r) * (Number(r.tax) || 0)) / 100

export function rowsTotals(rows = []) {
  const subtotal = rows.reduce((sum, r) => sum + rowAmount(r), 0)
  const tax = rows.reduce((sum, r) => sum + rowTax(r), 0)
  return { subtotal, tax, total: subtotal + tax }
}

/** Grand total across invoices and itemized rows. */
export function proposalTotals(proposal) {
  const s = proposal.services || {}
  const groups = [...(s.invoices || []).map((inv) => inv.rows), s.itemizedData?.rows || []]
  return groups.reduce(
    (acc, rows) => {
      const t = rowsTotals(rows)
      return { subtotal: acc.subtotal + t.subtotal, tax: acc.tax + t.tax, total: acc.total + t.total }
    },
    { subtotal: 0, tax: 0, total: 0 }
  )
}

/** Name shown in lists: the proposal’s own name, falling back to the template name. */
export const proposalName = (p) => p.general?.proposalName || p.name || "Untitled proposal"

/**
 * The first step that needs the client: terms to agree, then a payment method
 * (when required), otherwise sign.
 */
export function firstActionStep(proposal) {
  const g = proposal.general || {}
  if (g.termsEnabled) return "terms"
  if (g.paymentsEnabled && proposal.payments?.requireOnSign && proposal.payments?.methods?.length) return "payments"
  return "sign"
}

/** Link that opens a proposal at the first step to act on: /proposalsels?open=pr-1&step=terms */
export const proposalActionLink = (proposal) =>
  `/proposalsels?open=${encodeURIComponent(proposal._id)}&step=${firstActionStep(proposal)}`
