import BrandMark from "./BrandMark"

/** Split screen for Login and Register: navy story panel on the left, form on the right. */
export default function AuthShell({ panel, children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="flex flex-col gap-12 bg-navy px-6 py-10 text-navy-foreground sm:px-12 lg:w-1/2 lg:py-14">
        <BrandMark />
        <div className="max-w-md lg:my-auto">{panel}</div>
      </section>
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
