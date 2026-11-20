import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Lock, MessageSquare, Plus, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "../ui/sonner"
import OrganizerQuestion from "./OrganizerQuestion"
import { formatDate, formatTime, relativeDue, isDueThisWeek } from "../../lib/dates"
import { answerKey, firstUnanswered, missingRequired, organizerProgress, visibleQuestions, visibleSections } from "../../lib/organizer"

/**
 * The client fills in an organizer one section at a time (same flow as the admin preview).
 * Conditions apply live, answers save as you go, and submitting seals it.
 */
export default function OrganizerFill({ organizer, onSave, onSubmit, chatPath, resume = false }) {
  const [answers, setAnswers] = useState(organizer.answers || {})
  const [copies, setCopies] = useState(organizer.copies || {})
  // Opened from Home ("Continue"): start on the section with the first unanswered question
  const resumeAt = resume ? firstUnanswered(organizer) : null
  const [step, setStep] = useState(() => {
    if (!resumeAt) return 0
    const pagesAtStart = visibleSections(organizer, organizer.answers || {}).flatMap((section) =>
      Array.from({ length: 1 + ((organizer.copies || {})[section.id] || 0) }, (_, copy) => ({ section, copy }))
    )
    return Math.max(0, pagesAtStart.findIndex((p) => p.section.id === resumeAt.section.id && p.copy === resumeAt.copy))
  })
  const [showErrors, setShowErrors] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [savedAt, setSavedAt] = useState(organizer.updatedAt)

  const [highlightKey, setHighlightKey] = useState(resumeAt?.key || null)

  // …and put the cursor in that question, with a short highlight
  useEffect(() => {
    if (!resumeAt) return
    const t = setTimeout(() => setHighlightKey(null), 4000)
    const el =
      document.getElementById(`f-${resumeAt.key}`) || document.querySelector(`input[name="${CSS.escape(resumeAt.key)}"]`)
    // File questions: focus the visible "choose files" button, not the hidden input
    const target = el?.type === "file" ? el.closest("div")?.querySelector("button") || el : el
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: "center", behavior: "smooth" })
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Every copy of a repeating section is its own step: Property 1, Property 2, …
  const pages = useMemo(
    () =>
      visibleSections(organizer, answers).flatMap((section) =>
        Array.from({ length: 1 + (copies[section.id] || 0) }, (_, copy) => ({ section, copy }))
      ),
    [organizer, answers, copies]
  )
  const at = Math.min(step, Math.max(0, pages.length - 1))
  const current = pages[at]?.section
  const currentCopy = pages[at]?.copy || 0
  const repeating = Boolean(current?.sectionsettings?.sectionRepeatingMode)
  const copyCount = current ? 1 + (copies[current.id] || 0) : 1
  const isLast = at === pages.length - 1
  const pageTitle = (p) => `${p.section.text || "Untitled section"}${p.section.sectionsettings?.sectionRepeatingMode ? ` ${p.copy + 1}` : ""}`
  const progress = organizerProgress(organizer, answers, copies)
  const missing = missingRequired(organizer, answers, copies)
  const missingKeys = new Set(missing.map((m) => m.key))
  const pct = progress.total ? Math.round((progress.answered / progress.total) * 100) : 0

  // Answers save as you go
  const save = (nextAnswers, nextCopies) => {
    onSave(nextAnswers, nextCopies)
    setSavedAt(new Date().toISOString())
  }
  const answer = (key, v) => {
    const next = { ...answers, [key]: v }
    setAnswers(next)
    save(next, copies)
  }
  const addCopy = () => {
    const next = { ...copies, [current.id]: (copies[current.id] || 0) + 1 }
    setCopies(next)
    save(answers, next)
    // The new copy sits right after this section's last copy
    const lastCopyIndex = pages.findIndex((p) => p.section.id === current.id) + copyCount - 1
    goTo(lastCopyIndex + 1)
    toast.success(`${current.text} ${copyCount + 1} added`)
  }
  // Only the last copy can be removed, so answer keys never shift
  const removeLastCopy = () => {
    const n = copies[current.id] || 0
    if (!n) return
    const nextAnswers = { ...answers }
    current.formElements.forEach((q) => delete nextAnswers[answerKey(q.id, n)])
    const nextCopies = { ...copies, [current.id]: n - 1 }
    setAnswers(nextAnswers)
    setCopies(nextCopies)
    save(nextAnswers, nextCopies)
    goTo(Math.max(0, at - 1)) // back to the previous copy
    toast(`Removed ${current.text} ${n + 1}`)
  }

  const goTo = (i) => {
    setStep(i)
    setConfirming(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const trySubmit = () => {
    if (missing.length) {
      setShowErrors(true)
      const firstPage = pages.findIndex((p) => p.section.id === missing[0].section.id && p.copy === missing[0].copy)
      if (firstPage >= 0) goTo(firstPage)
      toast.error(`${missing.length} required question${missing.length === 1 ? "" : "s"} still need${missing.length === 1 ? "s" : ""} an answer`, {
        description: `Starting with “${missing[0].question.text}”.`,
      })
      return
    }
    setConfirming(true)
  }

  const pageHasMissing = (p) => missing.some((m) => m.section.id === p.section.id && m.copy === p.copy)

  return (
    <div className="flex flex-col gap-5">
      <Link to="/organizers" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All organizers
      </Link>

      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-card">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Organizer</div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">{organizer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Due {formatDate(organizer.dueDate, { month: "short", day: "numeric", year: "numeric" })}
              {isDueThisWeek(organizer.dueDate) && (
                <strong className="font-semibold text-amber-700 dark:text-amber-400"> · {relativeDue(organizer.dueDate)}</strong>
              )}
              {" · "}
              {progress.answered} of {progress.total} answered
            </p>
          </div>
          <p role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-green-700 dark:text-green-400" aria-hidden="true" />
            {savedAt ? `Saved ${formatTime(savedAt)}` : "Saves as you go"}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {!pages.length ? (
            <p className="text-sm text-muted-foreground">There are no questions to answer yet.</p>
          ) : (
            <>
              {/* Step picker + progress */}
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="org-step" className="sr-only">
                  Go to section
                </label>
                <select
                  id="org-step"
                  value={at}
                  onChange={(e) => goTo(Number(e.target.value))}
                  className="h-9 max-w-[280px] rounded-md border border-input bg-card px-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {pages.map((p, i) => (
                    <option key={`${p.section.id}-${p.copy}`} value={i}>
                      {i + 1}. {pageTitle(p)}
                      {showErrors && pageHasMissing(p) ? " — needs answers" : ""}
                    </option>
                  ))}
                </select>
                <div
                  className="h-1.5 min-w-[80px] flex-1 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Questions answered"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  Step {at + 1} of {pages.length}
                </span>
              </div>

              {/* Current section — each repeated copy is its own step */}
              <section aria-label={`Section: ${pageTitle(pages[at])}`} className="mt-6 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{pageTitle(pages[at])}</h2>
                    {repeating && (
                      <p className="text-sm text-muted-foreground">
                        {currentCopy + 1} of {copyCount}
                      </p>
                    )}
                  </div>
                  {repeating && currentCopy > 0 && currentCopy === copyCount - 1 && (
                    <Button variant="ghost" size="sm" onClick={removeLastCopy} className="text-muted-foreground">
                      <Trash2 /> Remove {current.text.toLowerCase()} {currentCopy + 1}
                    </Button>
                  )}
                </div>
                {visibleQuestions(current, answers, currentCopy).map((q) => {
                  const key = answerKey(q.id, currentCopy)
                  return (
                    <OrganizerQuestion
                      key={key}
                      q={q}
                      answerKey={key}
                      value={answers[key]}
                      onAnswer={(v) => {
                        if (key === highlightKey) setHighlightKey(null)
                        answer(key, v)
                      }}
                      highlighted={key === highlightKey}
                      error={showErrors && missingKeys.has(key) ? "This question needs an answer." : undefined}
                    />
                  )
                })}
                {/* Add another copy (from the last copy) — it opens as a new section */}
                {repeating && currentCopy === copyCount - 1 && (
                  <div className="rounded-lg border border-dashed bg-subtle px-4 py-3">
                    <Button variant="outline" size="sm" onClick={addCopy}>
                      <Plus aria-hidden="true" /> {current.sectionsettings.buttonName || "Repeat section"}
                    </Button>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Adds “{current.text} {copyCount + 1}” as a new section after this one.
                    </p>
                  </div>
                )}
              </section>

              {/* Submit confirmation — submitting seals the organizer */}
              {confirming ? (
                <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10" role="alertdialog" aria-labelledby="seal-title" aria-describedby="seal-desc">
                  <p id="seal-title" className="flex items-center gap-2 font-semibold">
                    <Lock className="h-4 w-4" aria-hidden="true" /> Submit and seal this organizer?
                  </p>
                  <p id="seal-desc" className="mt-1 text-sm text-muted-foreground">
                    Once submitted, your answers and files are locked and can’t be changed. If something needs fixing later, your accountant can reopen it.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={onSubmit} autoFocus>
                      <Lock /> Submit organizer
                    </Button>
                    <Button variant="outline" onClick={() => setConfirming(false)}>
                      Keep editing
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <Button variant="outline" onClick={() => goTo(Math.max(0, at - 1))} disabled={at === 0}>
                    <ChevronLeft aria-hidden="true" /> Back
                  </Button>
                  {chatPath && (
                    <Button asChild variant="ghost" size="sm" className="order-last w-full sm:order-none sm:w-auto">
                      <Link to={chatPath}>
                        <MessageSquare /> Ask your accountant
                      </Link>
                    </Button>
                  )}
                  {isLast ? (
                    <Button onClick={trySubmit}>Review & submit</Button>
                  ) : (
                    <Button onClick={() => goTo(at + 1)}>
                      Next <ChevronRight aria-hidden="true" />
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
