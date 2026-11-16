import { TODAY } from "../config"

const DAY = 24 * 60 * 60 * 1000

export function formatDate(iso, opts = { month: "short", day: "numeric" }) {
  if (!iso) return "—"
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", opts)
}

/** Whole days from today to the given date (negative = overdue). */
export function daysUntil(iso) {
  const today = TODAY ? new Date(`${TODAY}T00:00:00`) : new Date(new Date().toDateString())
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / DAY)
}

export function relativeDue(iso) {
  const d = daysUntil(iso)
  if (d < 0) return `${Math.abs(d)} day${d === -1 ? "" : "s"} overdue`
  if (d === 0) return "today"
  if (d === 1) return "tomorrow"
  return `in ${d} days`
}

/** True when the date is within the next 7 days (or overdue). */
export function isDueThisWeek(iso) {
  return Boolean(iso) && daysUntil(iso) <= 7
}

/** "9:15 AM" */
export function formatTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

/** Day label for chat separators and the chat list: "Today", "Yesterday", "Nov 10". */
export function formatChatDay(isoDateTime) {
  const day = isoDateTime.slice(0, 10)
  const diff = daysUntil(day)
  if (diff === 0) return "Today"
  if (diff === -1) return "Yesterday"
  return formatDate(day, { month: "short", day: "numeric", year: day.slice(0, 4) === (TODAY || "").slice(0, 4) ? undefined : "numeric" })
}

/** Local date-time string without a timezone, matching the dummy data format. */
export function nowIso() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const date = TODAY || `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
