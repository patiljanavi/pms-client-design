import { Input } from "../ui/input"
import FileDropzone, { FileList } from "./FileDropzone"
import { formatDate } from "../../lib/dates"
import { FILE_UPLOAD, TEXT_BLOCK, hasAnswer } from "../../lib/organizer"
import { cn } from "../../lib/utils"

/** Typography for text blocks written in the admin rich text editor (theme tokens → works in dark mode). */
export const RICH_TEXT = cn(
  "text-sm leading-relaxed text-foreground",
  "[&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:font-semibold",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-line-strong [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground"
)

const CHOICE_TYPES = ["Radio Buttons", "Yes/No", "Checkboxes"]
const INPUT_TYPE = { Email: "email", Number: "number", Date: "date" }

/**
 * One organizer question as the client sees it.
 * answerKey = question id, plus "#n" for repeated section copies.
 * readOnly = sealed (submitted) organizer: shows the answer, no inputs.
 */
export default function OrganizerQuestion({ q, value, onAnswer, answerKey, error, readOnly = false, highlighted = false }) {
  const st = q.questionsectionsettings || {}

  if (q.type === TEXT_BLOCK) {
    if (readOnly) return null
    // Text comes from the firm's own organizer template editor
    return <div className={cn(RICH_TEXT, "rounded-lg bg-subtle px-4 py-3")} dangerouslySetInnerHTML={{ __html: q.text }} />
  }

  const fieldId = `f-${answerKey}`
  const descId = st.descriptionEnabled && st.description ? `${fieldId}-desc` : undefined
  const errorId = error ? `${fieldId}-err` : undefined
  const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined

  const labelText = (
    <>
      {q.text || `Untitled ${q.type.toLowerCase()}`}
      {st.required && !readOnly && (
        <span className="text-destructive" aria-hidden="true">
          {" "}
          *
        </span>
      )}
      {st.required && !readOnly && <span className="sr-only"> (required)</span>}
    </>
  )

  if (readOnly) return <ReadOnlyAnswer q={q} value={value} label={labelText} />

  const description = descId && (
    <p id={descId} className="mt-0.5 text-sm text-muted-foreground">
      {st.description}
    </p>
  )
  const errorText = error && (
    <p id={errorId} className="mt-1.5 text-sm font-medium text-destructive">
      {error}
    </p>
  )
  const opts = q.options.filter((o) => o.text.trim())

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg transition-shadow duration-500",
        highlighted && "ring-2 ring-primary/40 ring-offset-8 ring-offset-card"
      )}
    >
      {highlighted && <span className="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Pick up here</span>}
      {CHOICE_TYPES.includes(q.type) ? (
        <fieldset aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
          <legend className="text-sm font-medium text-foreground">{labelText}</legend>
          {description}
          <div className={cn("mt-2 flex gap-2", q.type === "Yes/No" ? "flex-row flex-wrap" : "flex-col")}>
            {opts.map((o) => {
              const multi = q.type === "Checkboxes"
              const checked = multi ? (value || []).includes(o.text) : value === o.text
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                    checked ? "border-primary/50 bg-primary/10 text-foreground" : "bg-card hover:bg-accent",
                    error && !checked && "border-destructive/50",
                    q.type === "Yes/No" && "min-w-[96px]"
                  )}
                >
                  <input
                    type={multi ? "checkbox" : "radio"}
                    name={answerKey}
                    checked={checked}
                    className="h-4 w-4 accent-primary"
                    onChange={() =>
                      onAnswer(multi ? (checked ? (value || []).filter((x) => x !== o.text) : [...(value || []), o.text]) : o.text)
                    }
                  />
                  {o.text}
                </label>
              )
            })}
          </div>
          {errorText}
        </fieldset>
      ) : (
        <div className="flex flex-col gap-1">
          {q.type === FILE_UPLOAD ? (
            <>
              <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
                {labelText}
              </label>
              {description}
              <FileDropzone id={fieldId} value={value || []} onChange={onAnswer} describedBy={describedBy} invalid={Boolean(error)} />
            </>
          ) : (
            <>
              <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
                {labelText}
              </label>
              {description}
              {q.type === "Dropdown" ? (
                <select
                  id={fieldId}
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(error) || undefined}
                  className={cn(
                    "mt-1 flex h-11 w-full rounded-lg border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    error ? "border-destructive" : "border-input"
                  )}
                  value={value || ""}
                  onChange={(e) => onAnswer(e.target.value)}
                >
                  <option value="">Select…</option>
                  {opts.map((o) => (
                    <option key={o.id}>{o.text}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={fieldId}
                  className={cn("mt-1", error && "border-destructive")}
                  type={INPUT_TYPE[q.type] || "text"}
                  inputMode={q.type === "Number" ? "decimal" : undefined}
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(error) || undefined}
                  value={value || ""}
                  onChange={(e) => onAnswer(e.target.value)}
                />
              )}
            </>
          )}
          {errorText}
        </div>
      )}
      {st.prefilled && <span className="mt-1 text-xs text-muted-foreground">Pre-filled from your previous organizer — please check it’s still right.</span>}
    </div>
  )
}

function ReadOnlyAnswer({ q, value, label }) {
  let answer
  if (!hasAnswer(value)) answer = <span className="italic text-muted-foreground">Not answered</span>
  else if (q.type === FILE_UPLOAD) answer = <FileList files={value} />
  else if (Array.isArray(value)) answer = value.join(", ")
  else if (q.type === "Date") answer = formatDate(value, { month: "long", day: "numeric", year: "numeric" })
  else if (q.type === "Number") answer = Number(value).toLocaleString("en-US")
  else answer = value

  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">{answer}</dd>
    </div>
  )
}
