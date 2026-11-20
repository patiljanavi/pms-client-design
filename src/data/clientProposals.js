import { proposalName, proposalTotals } from "../lib/proposal"

/**
 * Proposals & engagement letters sent to this client.
 * List fields: type ("Proposal" | "Engagement letter"), status ("Awaiting signature" | "Signed" | "Expired"),
 * sentBy, sentAt, dueDate. Content fields (general, introduction, terms, services, payments)
 * match what the admin fills with applyProposalTemplate(). See lib/proposal.js.
 */
const ava = { name: "Ava Thompson", role: "Senior accountant", initials: "AT" }
const jonas = { name: "Jonas Berg", role: "Bookkeeper", initials: "JB" }

const row = (id, service, description, quantity, rate, tax = 0) => ({ id, service, description, quantity, rate, tax })

const STANDARD_TERMS = `
<h3>1. Scope of work</h3>
<p>We will prepare the services listed in this proposal using information you provide. We are not responsible for errors that come from incomplete or inaccurate information.</p>
<h3>2. Your responsibilities</h3>
<ul>
  <li>Send requested documents by the dates in your client portal.</li>
  <li>Review drafts and reply to questions within 10 business days.</li>
  <li>Keep records that support every item on your return.</li>
</ul>
<h3>3. Fees and payment</h3>
<p>Fees are listed under <strong>Services &amp; fees</strong>. Invoices are due within 14 days. Work outside this scope is billed separately after we agree it with you.</p>
<h3>4. Ending the engagement</h3>
<p>Either of us may end this engagement in writing. You will be billed for work completed up to that date.</p>
<blockquote>By signing, you confirm you have read and agree to these terms.</blockquote>`

const proposals = [
  {
    _id: "pr-1",
    type: "Engagement letter",
    status: "Awaiting signature",
    sentBy: "Ava Thompson",
    sentAt: "2026-11-12",
    dueDate: "2026-11-18",
    chatId: "ch-1",
    general: {
      templateId: "tpl-annual-el",
      proposalName: "2026 engagement letter",
      teamMembers: [ava, jonas],
      introductionEnabled: true,
      termsEnabled: true,
      servicesEnabled: true,
      paymentsEnabled: true,
      skipStepper: false, // step-by-step
    },
    introduction: {
      title: "Welcome",
      content: `<h2>Thank you, Grace</h2>
<p>We’re glad to keep working with <strong>Okafor Holdings</strong> in 2026. This letter sets out what we’ll do, what we need from you, and our fees.</p>
<p>Your team this year is <strong>Ava Thompson</strong> (tax) and <strong>Jonas Berg</strong> (bookkeeping). Questions are always welcome in Chats.</p>`,
    },
    terms: { title: "Terms of engagement", content: STANDARD_TERMS },
    services: {
      invoices: [
        {
          id: "inv-a",
          name: "Due on signing",
          description: "Billed when you sign this letter.",
          rows: [row("r1", "2026 individual tax return", "Federal and one state return", 1, 1800), row("r2", "Year-end tax planning meeting", "60-minute call in December", 1, 600)],
        },
        {
          id: "inv-b",
          name: "Quarterly bookkeeping",
          description: "Billed at the end of each quarter.",
          rows: [row("r3", "Bookkeeping & reconciliation", "Per quarter", 4, 450, 0)],
        },
      ],
      itemizedData: { rows: [] },
      notes: "Prices include up to two revisions of each return.",
    },
    payments: {
      methods: ["Credit card", "Bank transfer (ACH)"],
      requireOnSign: true,
      schedule: "The first invoice is due within 14 days of signing. Quarterly invoices follow on Mar 31, Jun 30, Sep 30 and Dec 31.",
      notes: "Card payments have a 2.9% processing fee. Bank transfers are free.",
    },
  },
  {
    _id: "pr-4",
    type: "Proposal",
    status: "Awaiting signature",
    sentBy: "Ava Thompson",
    sentAt: "2026-11-15",
    dueDate: "2026-11-29",
    chatId: "ch-4",
    general: {
      templateId: "tpl-advisory",
      proposalName: "Quarterly advisory add-on",
      teamMembers: [ava],
      introductionEnabled: true,
      termsEnabled: false, // no terms step
      servicesEnabled: true,
      paymentsEnabled: false, // no payment step
      skipStepper: true, // everything on one page
    },
    introduction: {
      title: "Overview",
      content: `<p>Based on our last call, here’s an optional add-on: a <strong>45-minute advisory meeting every quarter</strong> to review cash flow and plan estimated taxes before each payment is due.</p>`,
    },
    terms: { title: "", content: "" },
    services: {
      invoices: [],
      itemizedData: {
        rows: [
          row("r4", "Quarterly advisory meeting", "45 minutes, video or in person", 4, 250),
          row("r5", "Cash-flow forecast", "Updated each quarter", 4, 150),
        ],
      },
      notes: "Billed with your quarterly bookkeeping invoice.",
    },
    payments: { methods: [], requireOnSign: false, schedule: "", notes: "" },
  },
  {
    _id: "pr-5",
    type: "Proposal",
    status: "Expired",
    sentBy: "Jonas Berg",
    sentAt: "2026-08-01",
    dueDate: "2026-08-31",
    chatId: "ch-2",
    general: {
      proposalName: "Bookkeeping clean-up 2025",
      teamMembers: [jonas],
      introductionEnabled: true,
      termsEnabled: true,
      servicesEnabled: true,
      paymentsEnabled: false,
      skipStepper: false,
    },
    introduction: { title: "Introduction", content: "<p>A one-off clean-up of 2025 transactions before we start monthly bookkeeping.</p>" },
    terms: { title: "Terms", content: STANDARD_TERMS },
    services: {
      invoices: [],
      itemizedData: { rows: [row("r6", "Bookkeeping clean-up", "Jan–Dec 2025, up to 600 transactions", 1, 1200)] },
      notes: "",
    },
    payments: { methods: [], requireOnSign: false, schedule: "", notes: "" },
  },
  {
    _id: "pr-2",
    type: "Proposal",
    status: "Signed",
    sentBy: "Ava Thompson",
    sentAt: "2026-10-02",
    dueDate: null,
    chatId: "ch-3",
    signature: { name: "Grace Okafor", signedAt: "2026-10-03T09:42:00", paymentMethod: "Bank transfer (ACH)" },
    general: {
      proposalName: "Payroll services proposal",
      teamMembers: [ava],
      introductionEnabled: true,
      termsEnabled: true,
      servicesEnabled: true,
      paymentsEnabled: true,
      skipStepper: false,
    },
    introduction: { title: "Introduction", content: "<p>Full-service payroll for your three employees, including filings and year-end W-2s.</p>" },
    terms: { title: "Terms", content: STANDARD_TERMS },
    services: {
      invoices: [],
      itemizedData: {
        rows: [row("r7", "Payroll processing", "Twice a month, up to 5 employees", 12, 120), row("r8", "Payroll setup", "One-time", 1, 360)],
      },
      notes: "",
    },
    payments: { methods: ["Credit card", "Bank transfer (ACH)"], requireOnSign: true, schedule: "Billed monthly.", notes: "" },
  },
  {
    _id: "pr-3",
    type: "Engagement letter",
    status: "Signed",
    sentBy: "Ava Thompson",
    sentAt: "2025-11-08",
    dueDate: null,
    chatId: "ch-1",
    signature: { name: "Grace Okafor", signedAt: "2025-11-09T19:15:00", paymentMethod: "Credit card" },
    general: {
      proposalName: "2025 engagement letter",
      teamMembers: [ava],
      introductionEnabled: false,
      termsEnabled: true,
      servicesEnabled: true,
      paymentsEnabled: false,
      skipStepper: true,
    },
    introduction: { title: "", content: "" },
    terms: { title: "Terms of engagement", content: STANDARD_TERMS },
    services: {
      invoices: [],
      itemizedData: { rows: [row("r9", "2025 individual tax return", "Federal and one state return", 1, 1700), row("r10", "Bookkeeping", "Per quarter", 4, 400)] },
      notes: "",
    },
    payments: { methods: [], requireOnSign: false, schedule: "", notes: "" },
  },
]

/** name + amount for lists and Home, worked out from the content. */
export const clientProposals = proposals.map((p) => ({ ...p, name: proposalName(p), amount: proposalTotals(p).total }))
