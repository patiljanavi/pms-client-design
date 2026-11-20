import { useEffect, useState } from "react"
import { ArrowLeft, CalendarClock, Check, CircleAlert, ExternalLink, FileCheck2, FileSignature, PenLine, ThumbsDown, ThumbsUp } from "lucide-react"
import { Modal } from "../ui/modal"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { FileTypeIcon } from "./FolderPicker"
import { SignatureMark } from "../proposal/ProposalSections"
import { loadFont } from "../../context/AppearanceContext"
import { formatDate, isDueThisWeek, relativeDue } from "../../lib/dates"
import { fileSize } from "../../lib/folderTree"
import { cn } from "../../lib/utils"

const SIGNATURE_FONT = { id: "signature", href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap" }
const initialsOf = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

/** Status badge for a file that needs (or had) the client's approval or signature. */
export function ActionBadge({ action, className }) {
  if (!action) return null
  const map = {
    pending: { variant: "warning", text: action.type === "signature" ? "Needs signature" : "Needs approval" },
    approved: { variant: "success", text: "Approved" },
    disapproved: { variant: "danger", text: "Disapproved" },
    signed: { variant: "success", text: "Signed" },
  }
  const { variant, text } = map[action.status] || map.pending
  return (
    <Badge variant={variant} dot={action.status !== "pending"} className={cn("whitespace-nowrap", className)}>
      {text}
    </Badge>
  )
}

/** The document being reviewed, plus who asked for it and their note. */
function DocumentSummary({ file, path, onDownload }) {
  const a = file.action
  const soon = a.dueDate && isDueThisWeek(a.dueDate)
  return (
    <div className="flex flex-col gap-4">
      {/* Document */}
      <div className="flex items-center gap-3.5 rounded-xl border bg-card p-3.5 shadow-xs">
        <FileTypeIcon name={file.name} tile className="h-12 w-12 rounded-lg [&_svg]:h-6 [&_svg]:w-6" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-words font-semibold leading-snug">{file.name}</p>
          {/* Just the file's own folder; the full path shows on hover */}
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={path?.map((f) => f.name).join(" › ")}>
            {path?.length ? path[path.length - 1].name : "Shared document"} · {fileSize(file.size)}
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex-none px-2.5 sm:px-3" onClick={() => onDownload(file)} aria-label={`Open ${file.name}`}>
          <ExternalLink />
          <span className="hidden sm:inline">Open</span>
        </Button>
      </div>

      {/* Request details */}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-subtle px-3.5 py-2.5">
          <dt className="text-xs text-muted-foreground">Requested by</dt>
          <dd className="mt-0.5 font-medium">{a.requestedBy}</dd>
        </div>
        <div className={cn("rounded-lg px-3.5 py-2.5", soon ? "bg-amber-50 dark:bg-amber-500/10" : "bg-subtle")}>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Due
          </dt>
          <dd className={cn("mt-0.5 font-medium", soon && "text-amber-800 dark:text-amber-300")}>
            {a.dueDate ? (
              <>
                {formatDate(a.dueDate, { month: "short", day: "numeric" })}
                {soon && <span className="font-normal"> · {relativeDue(a.dueDate)}</span>}
              </>
            ) : (
              "No due date"
            )}
          </dd>
        </div>
      </dl>

      {/* Note from the accountant */}
      {a.note && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-none">
            <AvatarFallback className="bg-blue-100 text-xs text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{initialsOf(a.requestedBy)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {a.requestedBy}
              {a.requestedAt && <span className="font-normal"> · {formatDate(a.requestedAt, { month: "short", day: "numeric" })}</span>}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{a.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Approve or disapprove a document. Disapprove asks for a reason in the next window. */
export function ApprovalModal({ file, path, onApprove, onDisapprove, onDownload, onClose }) {
  const [step, setStep] = useState("review") // "review" | "reason"

  if (step === "reason")
    return <DisapproveReasonModal file={file} onBack={() => setStep("review")} onClose={onClose} onSubmit={(reason) => onDisapprove(reason)} />

  return (
    <Modal
      icon={FileCheck2}
      tone="primary"
      title="Review and approve"
      description="Open the document and check it. Approve it, or tell your accountant what needs to change."
      onClose={onClose}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" className="sm:mr-auto" onClick={onClose}>
            Not now
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
            onClick={() => setStep("reason")}
          >
            <ThumbsDown /> Disapprove
          </Button>
          <Button onClick={onApprove}>
            <ThumbsUp /> Approve
          </Button>
        </>
      }
    >
      <DocumentSummary file={file} path={path} onDownload={onDownload} />
    </Modal>
  )
}

const QUICK_REASONS = ["Some figures look wrong", "Information is missing", "Wrong name or details", "I need to discuss this first"]
const MIN = 10
const MAX = 500

/** Second window: the reason for disapproving (required). */
export function DisapproveReasonModal({ file, onBack, onClose, onSubmit }) {
  const [picked, setPicked] = useState([])
  const [details, setDetails] = useState("")
  const [error, setError] = useState("")

  const reason = [...picked.map((r) => `${r}.`), details.trim()].filter(Boolean).join(" ")

  const togglePick = (r) => {
    setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))
    setError("")
  }

  const submit = (e) => {
    e?.preventDefault()
    if (reason.trim().length < MIN) {
      setError(reason.trim() ? `Please add a little more detail (at least ${MIN} characters).` : "Choose a reason or describe what needs to change.")
      return
    }
    onSubmit(reason.trim())
  }

  return (
    <Modal
      icon={ThumbsDown}
      tone="danger"
      title="Why are you disapproving?"
      description={
        <>
          <span className="font-medium text-foreground">{file.name}</span> goes back to {file.action.requestedBy} with your reason, so they can fix it.
        </>
      }
      onClose={onClose}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" className="sm:mr-auto" onClick={onBack}>
            <ArrowLeft /> Back
          </Button>
          <Button variant="destructive" onClick={submit}>
            <ThumbsDown /> Send disapproval
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-medium">What’s the problem?</legend>
          <p className="text-xs text-muted-foreground">Pick any that apply.</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_REASONS.map((r) => {
              const on = picked.includes(r)
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePick(r)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "border-red-300 bg-red-50 font-medium text-red-800 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200" : "bg-card hover:bg-muted"
                  )}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                  {r}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="disapprove-reason">Details for {file.action.requestedBy.split(" ")[0]}</Label>
          <textarea
            id="disapprove-reason"
            autoFocus
            rows={4}
            maxLength={MAX}
            value={details}
            onChange={(e) => {
              setDetails(e.target.value)
              setError("")
            }}
            placeholder="e.g. Office rent for October ($2,400) is missing from expenses."
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "reason-err" : "reason-hint"}
            className={cn(
              "w-full resize-none rounded-xl border bg-card px-4 py-3 text-base leading-relaxed text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring",
              error ? "border-destructive" : "border-input"
            )}
          />
          <div className="flex items-start justify-between gap-3">
            {error ? (
              <p id="reason-err" role="alert" className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <CircleAlert className="h-4 w-4 flex-none" aria-hidden="true" />
                {error}
              </p>
            ) : (
              <p id="reason-hint" className="text-xs text-muted-foreground">
                Be specific — it helps your accountant fix it in one go.
              </p>
            )}
            <span className="flex-none text-xs tabular-nums text-muted-foreground">
              {details.length}/{MAX}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

/** Sign a document: typed name, live signature, consent. */
export function SignDocumentModal({ file, path, me, onSign, onDownload, onClose }) {
  const [name, setName] = useState(me || "")
  const [consent, setConsent] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  useEffect(() => loadFont(SIGNATURE_FONT), [])

  const today = formatDate(new Date().toISOString().slice(0, 10), { month: "long", day: "numeric", year: "numeric" })

  const sign = () => {
    if (!name.trim() || !consent) {
      setShowErrors(true)
      return
    }
    onSign(name.trim())
  }

  return (
    <Modal
      icon={FileSignature}
      tone="warning"
      title="Review and sign"
      description="Open the document and check it, then sign below."
      onClose={onClose}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" className="sm:mr-auto" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={sign}>
            <PenLine /> Sign document
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <DocumentSummary file={file} path={path} onDownload={onDownload} />

        <div className="flex flex-col gap-1.5 border-t pt-5">
          <Label htmlFor="doc-signer">Full name</Label>
          <Input
            id="doc-signer"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={(showErrors && !name.trim()) || undefined}
            aria-describedby={showErrors && !name.trim() ? "signer-err" : undefined}
            className={cn(showErrors && !name.trim() && "border-destructive")}
          />
          {showErrors && !name.trim() && (
            <p id="signer-err" className="text-sm font-medium text-destructive">
              Type your name to sign.
            </p>
          )}
        </div>

        {/* Signature area, like the signing line on paper */}
        <div className="relative rounded-xl border bg-gradient-to-b from-card to-subtle px-5 pb-3 pt-7 shadow-xs">
          <span className="absolute left-5 top-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Signature</span>
          <div className="flex min-h-[52px] items-end gap-3 border-b-2 border-dashed border-line-strong pb-1.5">
            <span className="pb-1 text-lg text-muted-foreground" aria-hidden="true">
              ✕
            </span>
            {name.trim() ? (
              <SignatureMark name={name.trim()} className="text-4xl" />
            ) : (
              <span className="pb-1.5 text-sm text-muted-foreground">Type your name above to sign</span>
            )}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{name.trim() || "Your name"}</span>
            <span>{today}</span>
          </div>
        </div>

        <div className={cn("rounded-xl border px-4 py-3.5 transition-colors", showErrors && !consent ? "border-destructive/60 bg-red-50/60 dark:bg-red-500/10" : "bg-subtle")}>
          <div className="flex items-start gap-3">
            <Checkbox id="doc-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
            <Label htmlFor="doc-consent" className="font-normal leading-relaxed">
              I agree that typing my name is my electronic signature, and that it’s as binding as signing on paper.
            </Label>
          </div>
          {showErrors && !consent && <p className="mt-2 pl-8 text-sm font-medium text-destructive">Please confirm to sign electronically.</p>}
        </div>
      </div>
    </Modal>
  )
}
