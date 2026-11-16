import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/** Sends signed-out visitors to /login, then back to where they were going. */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
