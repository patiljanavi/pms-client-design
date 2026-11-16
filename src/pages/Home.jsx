import { Link } from "react-router-dom"
import { ArrowRight, Banknote, CalendarCheck, Check, FileSignature, FileText, MessageSquare, Upload } from "lucide-react"
import { PageHeader } from "../components/page"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { useAuth } from "../context/AuthContext"
import { useData } from "../context/DataContext"
import { chatLink } from "../lib/chatTodos"
import { formatDate, isDueThisWeek, relativeDue } from "../lib/dates"
import { getPending } from "../lib/pending"
import { cn, formatMoney } from "../lib/utils"

/** Icon + colour for each category (summary cards and section headers). */
const CATEGORY = {
  chats: { label: "Chats", icon: MessageSquare, tile: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300", path: "/chatstasks" },
  invoices: { label: "Invoices", icon: Banknote, tile: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300", path: "/billing" },
  proposals: { label: "Proposals & ELs", icon: FileSignature, tile: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", path: "/proposalsels" },
  organizers: { label: "Organizers", icon: CalendarCheck, tile: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", path: "/organizers" },
  documents: { label: "Documents", icon: FileText, tile: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300", path: "/document" },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`

/** "Due Nov 20 · in 4 days" — the relative part only when it’s close. */
function DueText({ date }) {
  if (!date) return null
  const soon = isDueThisWeek(date)
  return (
    <>
      Due {formatDate(date)}
      {soon && <strong className="font-semibold text-amber-700 dark:text-amber-400"> · {relativeDue(date)}</strong>}
    </>
  )
}

export default function Home() {
  const { user } = useAuth()
  const data = useData()
  const { recentlyCompleted = [], accountant, chats = [] } = data
  const pending = getPending(data)

  const unread = chats.reduce((sum, c) => sum + (c.unread || 0), 0)
  const amountDue = pending.invoices.reduce((sum, i) => sum + i.amount - i.credit, 0)
  const organizer = pending.organizers[0]

  const total = Object.values(pending).reduce((sum, list) => sum + list.length, 0)
  const dueThisWeek = Object.values(pending)
    .flat()
    .filter((item) => isDueThisWeek(item.dueDate)).length

  // "Send a message" opens the newest chat with the assigned accountant
  const accountantChat = chats
    .filter((c) => c.participants.some((p) => p.name === accountant?.name))
    .sort((a, b) => (b.messages.at(-1)?.sentAt || "").localeCompare(a.messages.at(-1)?.sentAt || ""))[0]

  const summary = [
    { key: "chats", value: unread, extra: "unread" },
    { key: "invoices", value: formatMoney(amountDue), extra: "due" },
    { key: "proposals", value: pending.proposals.length, extra: "to sign" },
    {
      key: "organizers",
      value: pending.organizers.length,
      extra: organizer ? `${Math.round((organizer.answered / organizer.total) * 100)}% done` : "open",
    },
    { key: "documents", value: pending.documents.length, extra: "to upload" },
  ]

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.firstName}`}
        description={
          total ? (
            <>
              <strong className="text-foreground">{plural(total, "thing")}</strong> need your attention · {dueThisWeek} due this week
            </>
          ) : (
            "You’re all caught up."
          )
        }
        action={
          <Button asChild size="lg">
            <Link to="/document">
              <Upload /> Upload documents
            </Link>
          </Button>
        }
      />

      {/* One card per category — jumps to its section below */}
      <nav aria-label="Pending work by category" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {summary.map((s) => {
          const { label, icon: Icon, tile } = CATEGORY[s.key]
          return (
            <a
              key={s.key}
              href={`#section-${s.key}`}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tile)} aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </span>
              <span className="text-2xl font-extrabold tabular-nums">
                {s.value}
                <span className="ml-2 text-sm font-medium text-muted-foreground">{s.extra}</span>
              </span>
            </a>
          )
        })}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          {/* Chats — full width */}
          <Section category="chats" count={pending.chats.length} countLabel="waiting on you" empty="No unread messages or open chat tasks." className="md:col-span-2">
            {pending.chats.map((c) => {
              const chat = chats.find((x) => x._id === c.chatId)
              const person = chat?.participants[0]
              return (
                <Row key={c._id}>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{person?.initials}</AvatarFallback>
                  </Avatar>
                  <RowText
                    title={
                      <>
                        {c.title}
                        {c.unread > 0 && (
                          <span className="rounded-full bg-primary px-1.5 text-xs font-bold leading-5 text-primary-foreground">
                            {c.unread}
                            <span className="sr-only"> unread</span>
                          </span>
                        )}
                      </>
                    }
                    quote={c.preview}
                    meta={
                      <>
                        {c.detail}
                        {c.dueDate && " · "}
                        <DueText date={c.dueDate} />
                      </>
                    }
                  />
                  <Button asChild variant={c.unread ? "default" : "outline"} size="sm">
                    <Link to={chatLink(c.chatId)}>{c.actionLabel}</Link>
                  </Button>
                </Row>
              )
            })}
          </Section>

          {/* Invoices */}
          <Section category="invoices" count={pending.invoices.length} countLabel="unpaid" empty="No unpaid invoices.">
            {pending.invoices.map((inv) => (
              <Row key={inv._id}>
                <RowText
                  title={`${inv.number} · ${inv.description}`}
                  meta={
                    <>
                      <DueText date={inv.dueDate} />
                      {inv.credit > 0 && ` · ${formatMoney(inv.credit)} credit applied`}
                    </>
                  }
                />
                <div className="flex items-center gap-3">
                  <span className="font-bold tabular-nums">{formatMoney(inv.amount - inv.credit)}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/billing">Pay</Link>
                  </Button>
                </div>
              </Row>
            ))}
          </Section>

          {/* Proposals & engagement letters */}
          <Section category="proposals" count={pending.proposals.length} countLabel="to sign" empty="Nothing waiting for your signature.">
            {pending.proposals.map((p) => (
              <Row key={p._id}>
                <RowText
                  title={p.name}
                  meta={
                    <>
                      {p.type}
                      {p.amount != null && ` · ${formatMoney(p.amount)} / year`}
                      {p.dueDate && " · "}
                      <DueText date={p.dueDate} />
                    </>
                  }
                />
                <Button asChild size="sm">
                  <Link to="/proposalsels">Review & sign</Link>
                </Button>
              </Row>
            ))}
          </Section>

          {/* Organizers */}
          <Section category="organizers" count={pending.organizers.length} countLabel="to finish" empty="No organizers to fill in.">
            {pending.organizers.map((o) => (
              <Row key={o._id}>
                <RowText
                  title={o.name}
                  meta={
                    <span className="flex flex-col gap-1.5">
                      <Progress value={(o.answered / o.total) * 100} className="max-w-[200px]" aria-label={`${o.name} progress`} />
                      <span>
                        {o.answered} of {o.total} questions · <DueText date={o.dueDate} />
                      </span>
                    </span>
                  }
                />
                <Button asChild variant="outline" size="sm">
                  <Link to="/organizers">{o.answered ? "Continue" : "Start"}</Link>
                </Button>
              </Row>
            ))}
          </Section>

          {/* Documents */}
          <Section category="documents" count={pending.documents.length} countLabel="requested" empty="No documents requested right now.">
            {pending.documents.map((d) => (
              <Row key={d._id}>
                <RowText title={d.name} meta={d.folder} />
                <Button asChild variant="outline" size="sm">
                  <Link to="/document">
                    <Upload /> Upload
                  </Link>
                </Button>
              </Row>
            ))}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {accountant && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Your accountant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{accountant.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{accountant.name}</p>
                    <p className="text-muted-foreground">{accountant.role}</p>
                  </div>
                </div>
                <Button asChild variant="outline" className="mt-5 h-11 w-full">
                  <Link to={accountantChat ? chatLink(accountantChat._id) : "/chatstasks"}>Send a message</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recently completed</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3.5">
                {recentlyCompleted.map((c) => (
                  <li key={c._id} className="grid grid-cols-[22px_1fr] gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 text-green-700 dark:text-green-400" strokeWidth={3} aria-hidden="true" />
                    <span>
                      {c.title}
                      <span className="block text-sm text-muted-foreground">{formatDate(c.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

/** A category card: icon, title, count, "View all" link, then its pending rows. */
function Section({ category, count, countLabel, empty, className, children }) {
  const { label, icon: Icon, tile, path } = CATEGORY[category]
  const headingId = `section-${category}-title`
  return (
    <section id={`section-${category}`} aria-labelledby={headingId} className={cn("scroll-mt-24 rounded-xl border bg-card", className)}>
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tile)} aria-hidden="true">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-bold leading-tight">
            {label}
          </h2>
          <p className="text-sm text-muted-foreground">{count ? `${count} ${countLabel}` : "All done"}</p>
        </div>
        <Link
          to={path}
          className="flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only"> {label}</span>
        </Link>
      </div>
      {count ? (
        <ul>{children}</ul>
      ) : (
        <p className="flex items-center gap-2 px-5 py-5 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-700 dark:text-green-400" strokeWidth={3} aria-hidden="true" />
          {empty}
        </p>
      )}
    </section>
  )
}

function Row({ children }) {
  return <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border/60 px-5 py-4 last:border-0">{children}</li>
}

function RowText({ title, quote, meta }) {
  return (
    <div className="min-w-0 flex-1 basis-48">
      <p className="flex flex-wrap items-center gap-2 font-semibold leading-snug">{title}</p>
      {quote && <p className="mt-0.5 truncate text-sm italic text-muted-foreground">“{quote}”</p>}
      {meta && <div className="mt-1 text-sm text-muted-foreground">{meta}</div>}
    </div>
  )
}
