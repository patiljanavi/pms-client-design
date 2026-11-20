import { Link, useSearchParams } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import ProposalView from "../../components/proposal/ProposalView"
import { PageHeader } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { toast } from "../../components/ui/sonner"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { chatLink } from "../../lib/chatTodos"
import { formatDate, isDueThisWeek, nowIso, relativeDue } from "../../lib/dates"
import { proposalSteps } from "../../lib/proposal"
import { formatMoney } from "../../lib/utils"

const statusVariant = { "Awaiting signature": "warning", Signed: "success", Expired: "danger" }

/** Link that opens one proposal: /proposalsels?open=pr-1 */
export const proposalLink = (id) => `/proposalsels?open=${encodeURIComponent(id)}`

export default function ProposalsEls() {
  const { user } = useAuth()
  const { proposals = [], setProposals } = useData()
  const [searchParams] = useSearchParams()
  const openId = searchParams.get("open")
  const open = proposals.find((p) => p._id === openId)
  const me = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

  if (open) {
    return (
      <ProposalView
        key={open._id}
        proposal={open}
        me={me}
        startStep={searchParams.get("step")}
        chatPath={open.chatId ? chatLink(open.chatId) : null}
        onSign={({ name, paymentMethod }) => {
          setProposals((all) =>
            all.map((p) => (p._id === open._id ? { ...p, status: "Signed", signature: { name, paymentMethod, signedAt: nowIso() } } : p))
          )
          window.scrollTo({ top: 0 })
          toast.success(`${open.type} signed`, { description: `Thank you, ${name.split(" ")[0]}. ${open.sentBy} has been notified.` })
        }}
      />
    )
  }

  const waiting = proposals.filter((p) => p.status === "Awaiting signature")
  const others = proposals.filter((p) => p.status !== "Awaiting signature")

  return (
    <>
      <PageHeader
        title="Proposals & ELs"
        description={openId ? "That proposal couldn’t be found. Pick one below." : "Proposals and engagement letters from Harbor. Open one to read and sign it."}
      />
      {waiting.length > 0 && <ProposalGroup title={`Waiting for your signature (${waiting.length})`} items={waiting} />}
      {others.length > 0 && <ProposalGroup title="Signed & past" items={others} />}
    </>
  )
}

function ProposalGroup({ title, items }) {
  return (
    <Card>
      <h2 className="border-b px-6 py-4 text-lg font-bold">{title}</h2>
      <ul>
        {items.map((p) => {
          const awaiting = p.status === "Awaiting signature"
          const steps = proposalSteps(p).filter((s) => s.id !== "sign")
          return (
            <li key={p._id} className="border-b border-border/60 last:border-0">
              <Link
                to={proposalLink(p._id)}
                className="group flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1 basis-64">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    {p.name} <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {p.type} · Sent by {p.sentBy} on {formatDate(p.sentAt, { month: "short", day: "numeric", year: "numeric" })}
                    {p.amount > 0 && ` · ${formatMoney(p.amount)} total`}
                    {p.status === "Signed" && p.signature && ` · Signed ${formatDate(p.signature.signedAt.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}`}
                    {awaiting && p.dueDate && (
                      <strong className="font-semibold text-amber-700 dark:text-amber-400">
                        {" "}
                        · Sign by {formatDate(p.dueDate)}
                        {isDueThisWeek(p.dueDate) && `, ${relativeDue(p.dueDate)}`}
                      </strong>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {steps.map((s) => s.label).join(" · ")}
                    {p.general?.skipStepper ? " · one page" : ""}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                  {awaiting ? "Review & sign" : "View"}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
