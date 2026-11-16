import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import { useData } from "../context/DataContext"
import { getMenuBadges } from "../lib/pending"

/** Shell for every signed-in page: top nav + page content. */
export default function AppLayout() {
  const data = useData()
  const { menus = [], error } = data
  const { pathname } = useLocation()

  // These pages fill the whole screen under the header (no side margins)
  const fullScreen = ["/chatstasks"].includes(pathname)

  // Small pending counts next to menu items
  const badges = getMenuBadges(data)

  return (
    <div className="min-h-screen">
      <Header menus={menus} badges={badges} />
      <main className={fullScreen ? "flex flex-col" : "mx-auto flex max-w-[1240px] flex-col gap-7 px-4 py-9 sm:px-8"}>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}. Check your connection and refresh the page.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  )
}
