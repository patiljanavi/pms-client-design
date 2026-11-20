import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, Moon, Sun, User } from "lucide-react"
import BrandMark from "./BrandMark"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAppearance } from "../context/AppearanceContext"
import { useAuth } from "../context/AuthContext"
import { getMenuIcon } from "../lib/icons"
import { cn } from "../lib/utils"

/**
 * Top navigation bar. `menus` come from the menus collection
 * ({ _id, label, path, icon }). `badges` maps a path to a pending count.
 */
export default function Header({ menus = [], badges = {} }) {
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useAppearance() || {}
  const isDark = resolvedTheme === "dark"
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-navy-foreground print:hidden">
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/home" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <BrandMark small hideNameOnMobile />
        </NavLink>

        {/* Desktop menu */}
        <nav aria-label="Main" className="no-scrollbar hidden min-w-0 flex-1 overflow-x-auto lg:block">
          <ul className="flex items-center gap-1">
            {menus.map((menu) => (
              <li key={menu._id?.$oid || menu.path}>
                <MenuLink menu={menu} badge={badges[menu.path]} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {setTheme && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
          )}
          <span className="hidden whitespace-nowrap text-sm text-navy-muted 2xl:inline">{user?.account?.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Account menu for ${user?.firstName} ${user?.lastName}`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-200 text-navy">{user?.initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="block text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <User /> Profile & settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tablet / phone menu: a sideways-scrolling row of tabs */}
      <nav aria-label="Main" className="border-t border-white/10 lg:hidden">
        <ul className="no-scrollbar flex w-full gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {menus.map((menu) => (
            <li key={menu._id?.$oid || menu.path} className="shrink-0">
              <MenuLink menu={menu} badge={badges[menu.path]} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

function MenuLink({ menu, badge }) {
  const Icon = getMenuIcon(menu.icon)
  return (
    <NavLink
      to={menu.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
          isActive ? "bg-navy-active text-white" : "text-navy-muted hover:bg-white/5 hover:text-white"
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {menu.label}
      {badge ? (
        <span className="ml-0.5 rounded-full bg-primary px-1.5 text-xs font-bold leading-5 text-white">
          {badge}
          <span className="sr-only"> pending</span>
        </span>
      ) : null}
    </NavLink>
  )
}
