import { Link } from "react-router-dom"
import { ArrowLeft, Lock, MessageSquare, Printer } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import OrganizerQuestion from "./OrganizerQuestion"
import { formatDate, formatTime } from "../../lib/dates"
import { answerKey, isQuestion, visibleQuestions, visibleSections } from "../../lib/organizer"

/** A submitted organizer: sealed, read-only, every section on one page. */
export default function OrganizerReadView({ organizer, chatPath }) {
  const answers = organizer.answers || {}
  const copies = organizer.copies || {}
  const sections = visibleSections(organizer, answers)

  return (
    <div className="flex flex-col gap-5">
      <Link to="/organizers" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline print:hidden">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All organizers
      </Link>

      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Organizer</div>
            <h1 className="mt-0.5 flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
              {organizer.name}
              <Badge variant="success" dot>
                Submitted
              </Badge>
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
            <Printer /> Print
          </Button>
        </div>

        {/* Sealed notice */}
        <div className="flex flex-wrap items-start gap-3 border-b bg-subtle px-5 py-4 sm:px-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
            <Lock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 basis-60">
            <p className="font-semibold">
              Sealed{" "}
              {organizer.submittedAt &&
                `on ${formatDate(organizer.submittedAt.slice(0, 10), { month: "long", day: "numeric", year: "numeric" })} at ${formatTime(organizer.submittedAt)}`}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your answers and files are locked exactly as you sent them. If something needs changing, ask your accountant to reopen it.
            </p>
          </div>
          {chatPath && (
            <Button asChild variant="outline" size="sm" className="print:hidden">
              <Link to={chatPath}>
                <MessageSquare /> Message your accountant
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-8 p-5 sm:p-6">
          {sections.map((section) =>
            Array.from({ length: 1 + (copies[section.id] || 0) }, (_, copy) => {
              const questions = visibleQuestions(section, answers).filter(isQuestion)
              if (!questions.length) return null
              return (
                <section key={`${section.id}-${copy}`} aria-labelledby={`ro-${section.id}-${copy}`}>
                  <h2 id={`ro-${section.id}-${copy}`} className="mb-3 border-b pb-2 text-base font-semibold">
                    {section.text}
                    {section.sectionsettings?.sectionRepeatingMode ? ` ${copy + 1}` : ""}
                  </h2>
                  <dl className="flex flex-col gap-4">
                    {questions.map((q) => {
                      const key = answerKey(q.id, copy)
                      return <OrganizerQuestion key={key} q={q} answerKey={key} value={answers[key]} readOnly />
                    })}
                  </dl>
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
