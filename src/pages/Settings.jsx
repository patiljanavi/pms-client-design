import { useEffect, useState } from "react"
import { Check, Monitor, Moon, RotateCcw, Sun } from "lucide-react"
import { PageHeader, SectionHeading } from "../components/page"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/sonner"
import { Switch } from "../components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { useAppearance, loadFont } from "../context/AppearanceContext"
import { useAuth } from "../context/AuthContext"
import { useData } from "../context/DataContext"
import { DEFAULT_FONT, FONTS } from "../config"
import { cn, formatMoney } from "../lib/utils"

const THEMES = [
  { id: "light", label: "Light", hint: "Always use the light theme", icon: Sun },
  { id: "dark", label: "Dark", hint: "Easier on the eyes at night", icon: Moon },
  { id: "system", label: "System", hint: "Follows your device setting", icon: Monitor },
]

const REMINDERS = [
  { key: "emailReminders", label: "Email me when something new needs my attention" },
  { key: "smsReminders", label: "Text me 2 days before something is due" },
  { key: "weeklySummary", label: "Send me a weekly summary on Mondays" },
]

// Theme previews use fixed colours on purpose: they show what each theme looks like,
// whichever theme is active right now. The navy bar matches the portal header.
const MINI = {
  light: { bg: "bg-slate-100", bar: "bg-[#112A45]", card: "bg-white border-slate-200", line: "bg-slate-200", strong: "bg-slate-300", accent: "bg-blue-700" },
  dark: { bg: "bg-slate-950", bar: "bg-slate-900", card: "bg-slate-900 border-slate-800", line: "bg-slate-800", strong: "bg-slate-700", accent: "bg-blue-500" },
}

function MiniApp({ tone }) {
  const t = MINI[tone]
  return (
    <div className={cn("flex h-full w-full flex-col", t.bg)}>
      <div className={cn("flex items-center gap-1.5 px-2 py-1.5", t.bar)}>
        <span className={cn("h-2.5 w-2.5 rounded-sm", t.accent)} />
        <span className="h-1 w-6 rounded-full bg-white/50" />
        <span className="h-1 w-4 rounded-full bg-white/25" />
        <span className="h-1 w-5 rounded-full bg-white/25" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className={cn("h-1.5 w-1/2 rounded-full", t.strong)} />
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-5 rounded border", t.card)} />
          ))}
        </div>
        <div className={cn("flex flex-1 flex-col gap-1 rounded border p-1.5", t.card)}>
          <span className={cn("h-1 w-full rounded-full", t.line)} />
          <span className={cn("h-1 w-5/6 rounded-full", t.line)} />
          <span className={cn("h-1 w-2/3 rounded-full", t.line)} />
          <span className={cn("mt-auto h-2 w-6 rounded-sm", t.accent)} />
        </div>
      </div>
    </div>
  )
}

function ThemePreview({ id }) {
  if (id !== "system") return <MiniApp tone={id} />
  return (
    <div className="relative h-full w-full">
      <MiniApp tone="light" />
      <div className="absolute inset-0 [clip-path:polygon(55%_0,100%_0,100%_100%,45%_100%)]">
        <MiniApp tone="dark" />
      </div>
    </div>
  )
}

function SelectedDot({ on }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 flex-none items-center justify-center rounded-full transition-colors",
        on ? "bg-primary text-primary-foreground" : "border border-line-strong bg-card"
      )}
    >
      {on && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
    </span>
  )
}

const optionCard = (on) =>
  cn(
    "group rounded-xl border bg-card text-left shadow-xs transition-[border-color,box-shadow,background-color]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    on ? "border-primary ring-1 ring-primary/30" : "hover:border-line-strong hover:shadow-raised"
  )

const panel = "flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-card sm:p-6"

export default function Settings() {
  const { user } = useAuth()
  const { notificationSettings = {}, invoices = [] } = useData()
  const { fontId, font, setFont, tabular, setTabular, theme, resolvedTheme, setTheme, reset } = useAppearance()
  const [reminders, setReminders] = useState(notificationSettings)

  // Load every font so each card previews in its own typeface
  useEffect(() => {
    FONTS.forEach(loadFont)
  }, [])

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
  const appearanceChanged = fontId !== DEFAULT_FONT || !tabular

  const toggleReminder = (key, label) => (on) => {
    setReminders((r) => ({ ...r, [key]: on }))
    toast.success(on ? "Reminder turned on" : "Reminder turned off", { description: label })
  }

  return (
    <>
      <PageHeader title="Settings" description="Your profile, reminders, and how the portal looks on this device." />

      {/* Profile summary */}
      <section className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-xl border bg-card p-5 shadow-card sm:p-6">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary/10 via-violet-500/10 to-transparent" aria-hidden="true" />
        <span className="relative rounded-full ring-4 ring-card">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">{user?.initials}</AvatarFallback>
          </Avatar>
        </span>
        <div className="relative min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-lg font-semibold">{fullName || "Your profile"}</span>
            <Badge variant="success" dot>
              Signed in
            </Badge>
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {user?.email} · {user?.account?.name}
          </div>
        </div>
      </section>

      {/* Profile details */}
      <form
        className={panel}
        onSubmit={(e) => {
          e.preventDefault()
          toast.success("Profile saved")
        }}
      >
        <SectionHeading title="Profile" description="How your accountant reaches you." />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="s-first">First name</Label>
            <Input id="s-first" autoComplete="given-name" defaultValue={user?.firstName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-last">Last name</Label>
            <Input id="s-last" autoComplete="family-name" defaultValue={user?.lastName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" type="email" readOnly value={user?.email || ""} aria-describedby="s-email-hint" />
            <p id="s-email-hint" className="text-xs text-muted-foreground">
              Ask your accountant to change your sign-in email.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-phone">Mobile number</Label>
            <Input id="s-phone" type="tel" autoComplete="tel" defaultValue={user?.phone} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-company">Company</Label>
            <Input id="s-company" readOnly value={user?.account?.name || ""} />
          </div>
        </div>
        <div>
          <Button type="submit">Save profile</Button>
        </div>
      </form>

      {/* Reminders */}
      <section className={panel}>
        <SectionHeading title="Reminders" description="Choose how we nudge you about pending work. Changes save straight away." />
        <ul className="divide-y rounded-lg border">
          {REMINDERS.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <Label htmlFor={r.key} className="font-normal leading-snug">
                {r.label}
              </Label>
              <Switch id={r.key} checked={Boolean(reminders[r.key])} onCheckedChange={toggleReminder(r.key, r.label)} />
            </li>
          ))}
        </ul>
      </section>

      {/* Theme */}
      <section className={panel}>
        <SectionHeading title="Theme" description="Choose how the portal looks. Saved on this device and applied before the page paints." />
        <div role="radiogroup" aria-label="Colour theme" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const on = theme === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(t.id)}
                className={cn(optionCard(on), "flex flex-col overflow-hidden p-0")}
              >
                <div className="aspect-[16/9] w-full overflow-hidden border-b">
                  <ThemePreview id={t.id} />
                </div>
                <div className="flex w-full items-center gap-3 p-3.5">
                  <Icon className={cn("h-4 w-4 flex-none", on ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.id === "system" && on ? `Currently ${resolvedTheme}` : t.hint}
                    </div>
                  </div>
                  <SelectedDot on={on} />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Font */}
      <section className={panel}>
        <SectionHeading
          title="Font"
          description="Changes the typeface across the whole portal straight away. Saved on this device."
          action={
            appearanceChanged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reset()
                  toast.success("Appearance reset to default")
                }}
              >
                <RotateCcw /> Reset to default
              </Button>
            )
          }
        />
        <div role="radiogroup" aria-label="Portal font" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FONTS.map((f) => {
            const on = f.id === fontId
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFont(f.id)}
                className={cn(optionCard(on), "flex flex-col gap-3 p-4")}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium">
                      {f.name}
                      {f.id === DEFAULT_FONT && <Badge variant="neutral">Default</Badge>}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{f.feel}</div>
                  </div>
                  <SelectedDot on={on} />
                </div>
                {/* Sample in the font itself */}
                <div
                  style={{ fontFamily: f.sans }}
                  className={cn("w-full rounded-lg border p-3 transition-colors", on ? "bg-primary/[0.04]" : "bg-subtle")}
                >
                  <div className="text-2xl font-semibold leading-tight tracking-tight">Aa Bb 0123</div>
                  <div className="mt-1 text-base">Okafor Holdings · Harbor</div>
                  <div className="mt-0.5 text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                    $692.80 · 1,111.11
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground" style={{ fontFamily: f.monoStack }}>
                    INV-1002
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Best for: {f.bestFor} · Mono: {f.mono}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Numbers + live preview in the active font */}
      <section className={panel}>
        <SectionHeading
          title="Line up numbers in tables"
          description="Gives every digit the same width so amounts align in columns."
          action={<Switch checked={tabular} onCheckedChange={setTabular} aria-label="Line up numbers in tables" />}
        />
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b bg-subtle px-5 py-2.5 text-xs text-muted-foreground">
            <span>
              Preview in <span className="font-medium text-foreground">{font.name}</span>
            </span>
            <Badge variant={tabular ? "info" : "neutral"}>{tabular ? "Tabular numbers" : "Proportional numbers"}</Badge>
          </div>
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{inv.number}</TableCell>
                  <TableCell className="font-medium">{inv.description}</TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(inv.amount - inv.credit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  )
}
