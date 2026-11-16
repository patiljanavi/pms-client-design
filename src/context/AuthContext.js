import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { clientUser } from "../data/clientProfile"

const AuthContext = createContext(null)
const STORAGE_KEY = "client-portal-auth"

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  /**
   * Dummy sign-in: any email + password works and signs in as the sample client.
   * Replace the body with your real login API call.
   */
  const login = useCallback(async ({ email, remember }) => {
    const signedIn = { ...clientUser, email: email || clientUser.email }
    setUser(signedIn)
    // "Keep me signed in" survives closing the browser; otherwise only this tab session
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(STORAGE_KEY, JSON.stringify(signedIn))
    return signedIn
  }, [])

  /** Dummy registration: creates the session straight away. */
  const register = useCallback(async ({ firstName, lastName, email }) => {
    const created = {
      ...clientUser,
      firstName,
      lastName,
      email,
      initials: `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase(),
    }
    setUser(created)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created))
    return created
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
