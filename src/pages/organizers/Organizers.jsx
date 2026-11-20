import { Link, useSearchParams } from "react-router-dom"
import { ChevronRight, Lock } from "lucide-react"
import OrganizerFill from "../../components/organizer/OrganizerFill"
import OrganizerReadView from "../../components/organizer/OrganizerReadView"
import { PageHeader } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { toast } from "../../components/ui/sonner"
import { useData } from "../../context/DataContext"
import { chatLink } from "../../lib/chatTodos"
import { formatDate, isDueThisWeek, nowIso, relativeDue } from "../../lib/dates"
import { withProgress } from "../../lib/organizer"
import { cn } from "../../lib/utils"

const statusVariant = { "Not started": "neutral", "In progress": "info", Submitted: "success" }

/** Link that opens one organizer: /organizers?open=org-1 */
export const organizerLink = (id) => `/organizers?open=${encodeURIComponent(id)}`

export default function Organizers() {
  const { organizers = [], setOrganizers } = useData()
  const [searchParams] = useSearchParams()
  const openId = searchParams.get("open")
  const open = organizers.find((o) => o._id === openId)

  const update = (id, change) => setOrganizers((all) => all.map((o) => (o._id === id ? withProgress(change(o)) : o)))

  if (open) {
    const chatPath = open.chatId ? chatLink(open.chatId) : null

    // Submitted = sealed: read-only
    if (open.status === "Submitted") return <OrganizerReadView organizer={open} chatPath={chatPath} />

    return (
      <OrganizerFill
        key={open._id}
        organizer={open}
        chatPath={chatPath}
        resume={searchParams.get("resume") === "1"}
        onSave={(answers, copies) => update(open._id, (o) => ({ ...o, answers, copies, updatedAt: nowIso() }))}
        onSubmit={() => {
          update(open._id, (o) => ({ ...o, status: "Submitted", sealed: true, submittedAt: nowIso() }))
          window.scrollTo({ top: 0 })
          toast.success("Organizer submitted", { description: "It’s now sealed. Your accountant will review it." })
        }}
      />
    )
  }

  if (openId && !open) {
    return (
      <>
        <PageHeader title="Organizer not found" description="It may have been removed. Pick one from the list below." />
        <OrganizerList organizers={organizers} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Organizers" description="Questionnaires your accountant uses to prepare your return. Answers save as you go." />
      <OrganizerList organizers={organizers} />
    </>
  )
}

function OrganizerList({ organizers }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {organizers.map((o) => {
        const pct = o.total ? Math.round((o.answered / o.total) * 100) : 0
        const submitted = o.status === "Submitted"
        const soon = !submitted && isDueThisWeek(o.dueDate)
        return (
          <Link
            key={o._id}
            to={organizerLink(o._id)}
            className="group flex flex-col gap-4 rounded-xl border bg-card p-6 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{o.name}</h2>
              <Badge variant={statusVariant[o.status]} dot={submitted}>
                {o.status}
              </Badge>
            </div>
            {o.description && <p className="-mt-2 text-sm text-muted-foreground">{o.description}</p>}
            <Progress value={pct} aria-label={`${o.name}: ${pct}% answered`} />
            <p className="text-sm text-muted-foreground">
              {o.sections ? `${o.sections.length} sections · ` : ""}
              {o.answered} of {o.total} questions answered
              {submitted && o.submittedAt
                ? ` · Submitted ${formatDate(o.submittedAt.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}`
                : ` · Due ${formatDate(o.dueDate, { month: "short", day: "numeric", year: "numeric" })}`}
              {soon && <strong className="font-semibold text-amber-700 dark:text-amber-400"> · {relativeDue(o.dueDate)}</strong>}
            </p>
            <span
              className={cn(
                "mt-auto flex items-center gap-1.5 text-sm font-semibold",
                submitted ? "text-muted-foreground" : "text-primary"
              )}
            >
              {submitted ? (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" /> Sealed · View answers
                </>
              ) : (
                <>
                  {o.answered ? "Continue" : "Start"} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
