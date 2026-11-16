import { PageHeader } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { useData } from "../../context/DataContext"
import { formatDate, relativeDue } from "../../lib/dates"
import { formatMoney } from "../../lib/utils"

const statusVariant = { "Awaiting signature": "warning", Signed: "success", Expired: "danger" }

export default function ProposalsEls() {
  const { proposals = [] } = useData()
  return (
    <>
      <PageHeader title="Proposals & ELs" description="Proposals and engagement letters from Harbor." />
      <Card>
        <ul>
          {proposals.map((p) => {
            const awaiting = p.status === "Awaiting signature"
            return (
              <li key={p._id} className="flex flex-wrap items-center gap-4 border-b border-border/60 px-6 py-5 last:border-0">
                <span className="flex-1 basis-64">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    {p.name} <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {p.type} · Sent by {p.sentBy} on {formatDate(p.sentAt, { month: "short", day: "numeric", year: "numeric" })}
                    {p.amount != null && ` · ${formatMoney(p.amount)} / year`}
                    {p.dueDate && awaiting && (
                      <strong className="font-semibold text-amber-700 dark:text-amber-400">
                        {" "}
                        · Due {formatDate(p.dueDate)}, {relativeDue(p.dueDate)}
                      </strong>
                    )}
                  </span>
                </span>
                {awaiting ? <Button>Review & sign</Button> : <Button variant="outline">Download PDF</Button>}
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
