import { Banknote, CreditCard, Landmark } from "lucide-react"
import { RICH_TEXT } from "../organizer/OrganizerQuestion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { rowAmount, rowsTotals, proposalTotals } from "../../lib/proposal"
import { cn, formatMoney } from "../../lib/utils"

/** Introduction or terms — HTML written in the admin's text editor. */
export function TextSection({ section }) {
  if (!section?.content) return <p className="text-sm text-muted-foreground">Nothing to show here.</p>
  // Content comes from the firm's own proposal template editor
  return <div className={RICH_TEXT} dangerouslySetInnerHTML={{ __html: section.content }} />
}

function RowsTable({ rows, caption }) {
  const t = rowsTotals(rows)
  const hasTax = rows.some((r) => Number(r.tax))
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="min-w-[520px]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="bg-subtle hover:bg-subtle">
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            {hasTax && <TableHead className="text-right">Tax</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <span className="font-medium">{r.service}</span>
                {r.description && <span className="block text-xs text-muted-foreground">{r.description}</span>}
              </TableCell>
              <TableCell className="text-right tabular-nums">{r.quantity}</TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(Number(r.rate) || 0)}</TableCell>
              {hasTax && <TableCell className="text-right tabular-nums">{Number(r.tax) ? `${r.tax}%` : "—"}</TableCell>}
              <TableCell className="text-right font-medium tabular-nums">{formatMoney(rowAmount(r))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <dl className="flex flex-col gap-1 border-t bg-subtle px-5 py-3 text-sm">
        {t.tax > 0 && (
          <>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(t.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="tabular-nums">{formatMoney(t.tax)}</dd>
            </div>
          </>
        )}
        <div className="flex justify-between font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(t.total)}</dd>
        </div>
      </dl>
    </div>
  )
}

/** Services & fees: one table per invoice, plus itemized rows, then the grand total. */
export function ServicesSection({ proposal }) {
  const s = proposal.services || {}
  const invoices = (s.invoices || []).filter((inv) => inv.rows?.length)
  const itemized = s.itemizedData?.rows || []
  const grand = proposalTotals(proposal)

  return (
    <div className="flex flex-col gap-5">
      {invoices.map((inv) => (
        <div key={inv.id} className="flex flex-col gap-2">
          <div>
            <h3 className="font-semibold">{inv.name}</h3>
            {inv.description && <p className="text-sm text-muted-foreground">{inv.description}</p>}
          </div>
          <RowsTable rows={inv.rows} caption={inv.name} />
        </div>
      ))}
      {itemized.length > 0 && <RowsTable rows={itemized} caption="Services" />}
      {s.notes && <p className="text-sm text-muted-foreground">{s.notes}</p>}
      {(invoices.length > 1 || (invoices.length > 0 && itemized.length > 0)) && (
        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-5 py-3">
          <span className="font-semibold">Total for this proposal</span>
          <span className="text-lg font-bold tabular-nums">{formatMoney(grand.total)}</span>
        </div>
      )}
    </div>
  )
}

const METHOD_ICON = { "Credit card": CreditCard, "Bank transfer (ACH)": Landmark }

/** Payment: schedule + choosing how to pay (readOnly shows the chosen method). */
export function PaymentSection({ proposal, method, onMethod, readOnly = false, invalid = false }) {
  const p = proposal.payments || {}
  return (
    <div className="flex flex-col gap-4">
      {p.schedule && <p className="text-sm leading-relaxed">{p.schedule}</p>}
      {p.methods?.length > 0 &&
        (readOnly ? (
          <p className="text-sm">
            Payment method: <strong>{method || "Not chosen"}</strong>
          </p>
        ) : (
          <fieldset aria-describedby={invalid ? "pay-err" : undefined}>
            <legend className="text-sm font-medium">
              How would you like to pay?
              {p.requireOnSign && <span className="text-destructive"> *</span>}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {p.methods.map((m) => {
                const Icon = METHOD_ICON[m] || Banknote
                const on = method === m
                return (
                  <label
                    key={m}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                      on ? "border-primary/50 bg-primary/10" : "bg-card hover:bg-accent",
                      invalid && !on && "border-destructive/50"
                    )}
                  >
                    <input type="radio" name="payment-method" checked={on} onChange={() => onMethod(m)} className="h-4 w-4 accent-primary" />
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">{m}</span>
                  </label>
                )
              })}
            </div>
            {invalid && (
              <p id="pay-err" className="mt-1.5 text-sm font-medium text-destructive">
                Choose how you’d like to pay.
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">You’ll add payment details securely after signing. Nothing is charged now.</p>
          </fieldset>
        ))}
      {p.notes && <p className="text-sm text-muted-foreground">{p.notes}</p>}
    </div>
  )
}

/** Typed signature in a handwriting font. */
export function SignatureMark({ name, className }) {
  return (
    <span className={cn("font-signature text-3xl leading-none text-foreground", className)} style={{ fontFamily: '"Dancing Script", "Segoe Script", "Brush Script MT", cursive' }}>
      {name}
    </span>
  )
}
