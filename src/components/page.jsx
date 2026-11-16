/** Page title row used at the top of every portal page. */
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-base text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** A titled white panel with a divider under the title. */
export function Section({ title, aside, children, className = "" }) {
  return (
    <section className={`rounded-xl border bg-card ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-6 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Title + description for a settings-style section, with an optional action on the right. */
export function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
