import { PageHeader, Section } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { useData } from "../../context/DataContext"
import { formatDate } from "../../lib/dates"
import { formatMoney } from "../../lib/utils"

const statusVariant = { Due: "warning", Paid: "success", Overdue: "danger" }

export default function Billing() {
  const { invoices = [] } = useData()
  const open = invoices.filter((i) => i.status !== "Paid")
  const balance = open.reduce((sum, i) => sum + i.amount - i.credit, 0)

  return (
    <>
      <PageHeader title="Billing" description="Your invoices and payments." />

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Amount due</p>
          <p className="text-4xl font-extrabold tabular-nums">{formatMoney(balance)}</p>
          {open[0] && <p className="mt-1 text-sm text-muted-foreground">Next due {formatDate(open[0].dueDate)}</p>}
        </div>
        <Button size="lg" disabled={balance === 0}>
          Pay {formatMoney(balance)}
        </Button>
      </Card>

      <Section title="Invoices" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="px-6 py-3 font-semibold">Invoice</th>
                <th scope="col" className="px-3 py-3 font-semibold">Issued</th>
                <th scope="col" className="px-3 py-3 font-semibold">Due</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Amount</th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3.5">
                    <span className="font-semibold">{inv.number}</span>
                    <span className="block text-muted-foreground">{inv.description}</span>
                  </td>
                  <td className="px-3 py-3.5">{formatDate(inv.issuedAt)}</td>
                  <td className="px-3 py-3.5">{formatDate(inv.dueDate)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    {formatMoney(inv.amount - inv.credit)}
                    {inv.credit > 0 && (
                      <span className="block text-xs text-muted-foreground">{formatMoney(inv.credit)} credit applied</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
