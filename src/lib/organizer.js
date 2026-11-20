/**
 * Organizer helpers shared by the fill view, the sealed read view, Home and the list.
 *
 * Organizer shape (same field names as the admin organizer templates):
 *   sections: [{ id, text, sectionsettings, formElements: [question] }]
 *   question: { id, type, text, options: [{ id, text }], questionsectionsettings }
 *   answers:  { [questionId]: value, [`${questionId}#2`]: value for repeated copies }
 *   copies:   { [sectionId]: number of extra copies of a repeating section }
 *
 * Conditions (on sectionsettings or questionsectionsettings):
 *   { conditional: true, conditionMode: "all" | "any",
 *     conditions: [{ questionId, value }] }   // value matches the answer, or is included in a checkbox answer
 */

export const TEXT_BLOCK = "Text Block"
export const FILE_UPLOAD = "File Upload"

/**
 * True when the item has no conditions, or its conditions match the answers.
 * resolveKey maps a condition's questionId to the answer key to read
 * (inside a repeated section copy, it points at that copy's answers).
 */
export function conditionsMet(settings, answers = {}, resolveKey = (id) => id) {
  if (!settings?.conditional || !settings.conditions?.length) return true
  const check = ({ questionId, value }) => {
    const answer = answers[resolveKey(questionId)]
    return Array.isArray(answer) ? answer.includes(value) : answer === value
  }
  return settings.conditionMode === "any" ? settings.conditions.some(check) : settings.conditions.every(check)
}

export const isQuestion = (q) => q.type !== TEXT_BLOCK

export function visibleSections(organizer, answers) {
  return (organizer.sections || []).filter((s) => conditionsMet(s.sectionsettings, answers))
}

/** Answer key for a question in copy n of a repeating section (copy 0 = the original). */
export const answerKey = (questionId, copy) => (copy ? `${questionId}#${copy}` : questionId)

/**
 * Questions shown in one copy of a section. A condition that points at a question
 * in the same section reads that copy's answer — e.g. Employee 2's "Hourly" shows
 * Employee 2's hourly-rate question, whatever Employee 1 answered.
 */
export function visibleQuestions(section, answers, copy = 0) {
  const ownIds = new Set(section.formElements.map((q) => q.id))
  const resolveKey = (id) => (ownIds.has(id) ? answerKey(id, copy) : id)
  return section.formElements.filter((q) => conditionsMet(q.questionsectionsettings, answers, resolveKey))
}

export function hasAnswer(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null && String(value).trim() !== ""
}

/** Every visible question slot (including repeated copies) with its answer key. */
export function questionSlots(organizer, answers = organizer.answers, copies = organizer.copies || {}) {
  const slots = []
  visibleSections(organizer, answers).forEach((section) => {
    const count = 1 + (copies[section.id] || 0)
    for (let copy = 0; copy < count; copy++) {
      visibleQuestions(section, answers, copy)
        .filter(isQuestion)
        .forEach((q) => slots.push({ section, question: q, copy, key: answerKey(q.id, copy) }))
    }
  })
  return slots
}

/** { answered, total } over visible questions. */
export function organizerProgress(organizer, answers = organizer.answers || {}, copies = organizer.copies) {
  const slots = questionSlots(organizer, answers, copies)
  return { answered: slots.filter((s) => hasAnswer(answers[s.key])).length, total: slots.length }
}

/** Required questions that are visible but still empty. */
export function missingRequired(organizer, answers, copies) {
  return questionSlots(organizer, answers, copies).filter(
    (s) => s.question.questionsectionsettings?.required && !hasAnswer(answers[s.key])
  )
}

/** Keeps the list/Home fields (answered, total, status) in step with the answers. */
export function withProgress(organizer) {
  if (!organizer.sections) return organizer
  const { answered, total } = organizerProgress(organizer)
  // Pre-filled answers don't count as starting: it's "In progress" once the client saves something
  const status = organizer.status === "Submitted" ? "Submitted" : organizer.updatedAt ? "In progress" : "Not started"
  return { ...organizer, answered, total, status }
}

export function formatFileSize(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Where to pick up: the first visible question without an answer
 * (required ones first). Returns a slot { section, question, copy, key } or null.
 */
export function firstUnanswered(organizer, answers = organizer.answers || {}, copies = organizer.copies || {}) {
  const open = questionSlots(organizer, answers, copies).filter((s) => !hasAnswer(answers[s.key]))
  return open.find((s) => s.question.questionsectionsettings?.required) || open[0] || null
}

/** Link that opens an organizer at the first unanswered question: /organizers?open=org-1&resume=1 */
export const organizerResumeLink = (id) => `/organizers?open=${encodeURIComponent(id)}&resume=1`

/** "Income", or "Property 2" for a copy of a repeating section. */
export const slotSectionTitle = (slot) =>
  `${slot.section.text}${slot.section.sectionsettings?.sectionRepeatingMode ? ` ${slot.copy + 1}` : ""}`
