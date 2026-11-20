import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, CircleAlert, Download, FileSignature, Loader2, MessageSquare, PenLine, Printer } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "../ui/sonner"
import { PaymentSection, ServicesSection, SignatureMark, TextSection } from "./ProposalSections"
import { loadFont } from "../../context/AppearanceContext"
import { formatDate, formatTime, isDueThisWeek, relativeDue } from "../../lib/dates"
import { downloadElementAsPdf, pdfFileName } from "../../lib/pdf"
import { proposalSteps, proposalTotals } from "../../lib/proposal"
import { cn, formatMoney } from "../../lib/utils"

const SIGNATURE_FONT = { id: "signature", href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap" }
const statusVariant = { "Awaiting signature": "warning", Signed: "success", Expired: "danger" }
const longDate = (iso) => formatDate(iso.slice(0, 10), { month: "long", day: "numeric", year: "numeric" })
const sectionId = (stepId) => `proposal-${stepId}`

/**
 * View & sign a proposal. Only the steps enabled in proposal.general are shown.
 * All steps are on one scrolling page. Unless general.skipStepper is set, a step list
 * sits on the left: it highlights the step you're reading and jumps to a step on click.
 * Print outputs only the proposal; signed proposals can also be downloaded as a PDF.
 */
export default function ProposalView({ proposal, me, chatPath, onSign, startStep }) {
  const steps = proposalSteps(proposal)
  const canSign = proposal.status === "Awaiting signature"
  const isSigned = proposal.status === "Signed"
  const g = proposal.general || {}
  const showStepList = !g.skipStepper

  const docRef = useRef(null)
  const [active, setActive] = useState(steps[0]?.id)
  const [seen, setSeen] = useState(() => new Set())
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [method, setMethod] = useState(proposal.signature?.paymentMethod || "")
  const [signerName, setSignerName] = useState(me || "")
  const [consent, setConsent] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => loadFont(SIGNATURE_FONT), [])

  // Opened from Home ("Review & sign"): go straight to the first step to act on
  useEffect(() => {
    if (!startStep || !canSign || !steps.some((st) => st.id === startStep)) return
    const t = setTimeout(() => {
      const el = document.getElementById(sectionId(startStep))
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
      setActive(startStep)
      // Put focus on what to do there: the terms checkbox, a payment option, or the name field
      const target = { terms: "#accept-terms", payments: 'input[name="payment-method"]', sign: "#signer-name" }[startStep]
      el?.querySelector(target)?.focus({ preventScroll: true })
    }, 150)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal._id, startStep])

  // Highlight the step you're reading: the last section whose top has passed just under the header.
  // At the very bottom of the page, the last step wins. Steps you reach count as seen.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const OFFSET = 140 // sticky header + a little room
      let current = steps[0]?.id
      for (const st of steps) {
        const el = document.getElementById(sectionId(st.id))
        if (el && el.getBoundingClientRect().top <= OFFSET) current = st.id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = steps[steps.length - 1]?.id
      setActive(current)
      setSeen((prev) => (prev.has(current) ? prev : new Set(prev).add(current)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal._id])

  const jumpTo = useCallback((stepId) => {
    const el = document.getElementById(sectionId(stepId))
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setActive(stepId)
    el.querySelector("h2")?.focus({ preventScroll: true })
  }, [])

  const needsMethod = g.paymentsEnabled && proposal.payments?.requireOnSign && proposal.payments?.methods?.length > 0
  const problems = {
    terms: g.termsEnabled && !termsAccepted,
    payments: needsMethod && !method,
    name: !signerName.trim(),
    consent: !consent,
  }

  const stepDone = (id) => {
    if (!canSign) return isSigned
    if (id === "terms") return termsAccepted
    if (id === "payments") return needsMethod ? Boolean(method) : seen.has(id)
    if (id === "sign") return false
    return seen.has(id)
  }

  const sign = () => {
    if (Object.values(problems).some(Boolean)) {
      setShowErrors(true)
      if (problems.terms) jumpTo("terms")
      else if (problems.payments) jumpTo("payments")
      return
    }
    onSign({ name: signerName.trim(), paymentMethod: method || null })
  }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadElementAsPdf(docRef.current, pdfFileName(proposal.name))
      toast.success("PDF downloaded", { description: pdfFileName(proposal.name) })
    } catch {
      toast.error("Couldn’t create the PDF", { description: "Try Print and choose “Save as PDF” instead." })
    } finally {
      setDownloading(false)
    }
  }

  const total = proposalTotals(proposal).total

  const renderStep = (id) => {
    switch (id) {
      case "introduction":
        return <TextSection section={proposal.introduction} />
      case "terms":
        return (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border bg-subtle p-4">
              <TextSection section={proposal.terms} />
            </div>
            {canSign && (
              <div data-html2canvas-ignore className="print:hidden">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="accept-terms"
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(v === true)}
                    className="mt-0.5"
                    aria-describedby={showErrors && problems.terms ? "terms-err" : undefined}
                  />
                  <Label htmlFor="accept-terms" className="font-normal leading-snug">
                    I have read and agree to the {proposal.terms?.title?.toLowerCase() || "terms"}.
                  </Label>
                </div>
                {showErrors && problems.terms && (
                  <p id="terms-err" className="mt-1.5 text-sm font-medium text-destructive">
                    Please agree to the terms before signing.
                  </p>
                )}
              </div>
            )}
          </div>
        )
      case "services":
        return <ServicesSection proposal={proposal} />
      case "payments":
        return <PaymentSection proposal={proposal} method={method} onMethod={setMethod} readOnly={!canSign} invalid={showErrors && problems.payments} />
      case "sign":
        return canSign ? (
          <SignForm
            proposal={proposal}
            total={total}
            method={method}
            signerName={signerName}
            setSignerName={setSignerName}
            consent={consent}
            setConsent={setConsent}
            showErrors={showErrors}
            problems={problems}
            onSign={sign}
          />
        ) : (
          <SignedOrExpired proposal={proposal} chatPath={chatPath} />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/proposalsels" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All proposals & ELs
        </Link>
        <div className="flex flex-wrap gap-2">
          {chatPath && (
            <Button asChild variant="ghost" size="sm">
              <Link to={chatPath}>
                <MessageSquare /> Ask a question
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          {isSigned && (
            <Button size="sm" onClick={download} disabled={downloading}>
              {downloading ? <Loader2 className="animate-spin" /> : <Download />}
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </Button>
          )}
        </div>
      </div>

      <div className={cn("grid items-start gap-6 print:block", showStepList && "lg:grid-cols-[220px_minmax(0,1fr)]")}>
        {/* Left: steps — highlights while you scroll, click to jump */}
        {showStepList && (
          <nav aria-label="Proposal steps" className="print:hidden lg:sticky lg:top-24">
            <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">Steps</p>
            <ol className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {steps.map((s, i) => {
                const isActive = active === s.id
                const done = stepDone(s.id)
                return (
                  <li key={s.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => jumpTo(s.id)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "lg:border-l-2 lg:rounded-l-none",
                        isActive ? "bg-primary/10 font-semibold text-foreground lg:border-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground lg:border-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          done ? "bg-primary text-primary-foreground" : isActive ? "border-2 border-primary text-primary" : "border border-line-strong"
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                      </span>
                      {s.id === "sign" && !canSign ? "Signature" : s.label}
                      {done && <span className="sr-only"> (done)</span>}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        {/* The proposal document — this is what prints and downloads */}
        <article
          ref={docRef}
          className={cn(
            "w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-card print:rounded-none print:border-0 print:shadow-none",
            !showStepList && "mx-auto max-w-3xl",
            "print:max-w-none"
          )}
        >
          <header className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-8">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{proposal.type}</div>
              <h1 className="mt-0.5 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
                {proposal.name}
                <Badge variant={statusVariant[proposal.status]} dot={isSigned}>
                  {proposal.status}
                </Badge>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sent by {proposal.sentBy} on {formatDate(proposal.sentAt, { month: "short", day: "numeric", year: "numeric" })}
                {canSign && proposal.dueDate && (
                  <>
                    {" · "}Sign by {formatDate(proposal.dueDate)}
                    {isDueThisWeek(proposal.dueDate) && (
                      <strong className="font-semibold text-amber-700 dark:text-amber-400"> · {relativeDue(proposal.dueDate)}</strong>
                    )}
                  </>
                )}
              </p>
            </div>
            {g.teamMembers?.length > 0 && (
              <div className="flex -space-x-2" aria-label={`Your team: ${g.teamMembers.map((m) => m.name).join(", ")}`}>
                {g.teamMembers.map((m) => (
                  <Avatar key={m.name} className="h-8 w-8 ring-2 ring-card" title={`${m.name}, ${m.role}`}>
                    <AvatarFallback className="bg-blue-100 text-xs text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{m.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </header>

          <div className="divide-y">
            {steps.map((s) => (
              <section
                key={s.id}
                id={sectionId(s.id)}
                data-step={s.id}
                aria-labelledby={`${sectionId(s.id)}-title`}
                className="scroll-mt-24 px-5 py-7 sm:px-8"
              >
                <h2 id={`${sectionId(s.id)}-title`} tabIndex={-1} className="mb-4 text-lg font-semibold tracking-tight outline-none">
                  {s.id === "sign" ? (canSign ? "Review & sign" : "Signature") : s.label}
                </h2>
                {renderStep(s.id)}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}

function SignForm({ proposal, total, method, signerName, setSignerName, consent, setConsent, showErrors, problems, onSign }) {
  const g = proposal.general || {}
  const summary = [
    g.termsEnabled && { ok: !problems.terms, text: problems.terms ? "Terms not agreed yet" : "Terms agreed" },
    g.paymentsEnabled && proposal.payments?.methods?.length > 0 && { ok: !problems.payments, text: method ? `Paying by ${method}` : "Payment method not chosen" },
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-5" data-html2canvas-ignore>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-subtle px-5 py-4">
        <div>
          <p className="text-sm text-muted-foreground">You’re signing</p>
          <p className="font-semibold">{proposal.name}</p>
        </div>
        {g.servicesEnabled && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold tabular-nums">{formatMoney(total)}</p>
          </div>
        )}
      </div>

      {summary.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm">
          {summary.map((item) => (
            <li key={item.text} className={cn("flex items-center gap-2", item.ok ? "text-green-700 dark:text-green-400" : "font-medium text-destructive")}>
              {item.ok ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <CircleAlert className="h-4 w-4" aria-hidden="true" />}
              {item.text}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 print:hidden">
        <Label htmlFor="signer-name">Type your full name to sign</Label>
        <Input
          id="signer-name"
          autoComplete="name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          aria-invalid={(showErrors && problems.name) || undefined}
          aria-describedby={showErrors && problems.name ? "name-err" : undefined}
          className={cn(showErrors && problems.name && "border-destructive")}
        />
        {showErrors && problems.name && (
          <p id="name-err" className="text-sm font-medium text-destructive">
            Type your name to sign.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-dashed px-5 pb-3 pt-6">
        <div className="min-h-[40px] border-b border-line-strong pb-1">
          {signerName.trim() ? <SignatureMark name={signerName.trim()} /> : <span className="text-sm text-muted-foreground">Your signature appears here</span>}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Signature · {formatDate(new Date().toISOString().slice(0, 10), { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      <div className="print:hidden">
        <div className="flex items-start gap-3">
          <Checkbox id="esign-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <Label htmlFor="esign-consent" className="font-normal leading-snug">
            I agree that typing my name above is my electronic signature, and that it’s as binding as signing on paper.
          </Label>
        </div>
        {showErrors && problems.consent && <p className="mt-1.5 text-sm font-medium text-destructive">Please confirm to sign electronically.</p>}
      </div>

      <Button size="lg" onClick={onSign} className="w-full print:hidden sm:w-auto sm:self-start">
        <PenLine /> Sign {proposal.type === "Engagement letter" ? "engagement letter" : "proposal"}
      </Button>
    </div>
  )
}

function SignedOrExpired({ proposal, chatPath }) {
  if (proposal.status === "Signed" && proposal.signature) {
    const sig = proposal.signature
    return (
      <div className="pdf-avoid-break rounded-lg border bg-subtle px-5 py-5">
        <div className="border-b border-line-strong pb-1">
          <SignatureMark name={sig.name} />
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <FileSignature className="h-4 w-4 text-green-700 dark:text-green-400" aria-hidden="true" />
          Signed by <strong>{sig.name}</strong> on {longDate(sig.signedAt)} at {formatTime(sig.signedAt)}
        </p>
        {sig.paymentMethod && <p className="mt-1 text-sm text-muted-foreground">Payment method: {sig.paymentMethod}</p>}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/30 dark:bg-red-500/10">
      <CircleAlert className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">
        This {proposal.type.toLowerCase()} expired{proposal.dueDate ? ` on ${longDate(proposal.dueDate)}` : ""} and can no longer be signed. Ask {proposal.sentBy} to send a new one.
      </p>
      {chatPath && (
        <Button asChild variant="outline" size="sm" className="print:hidden">
          <Link to={chatPath} data-html2canvas-ignore>
            <MessageSquare /> Message {proposal.sentBy.split(" ")[0]}
          </Link>
        </Button>
      )}
    </div>
  )
}
