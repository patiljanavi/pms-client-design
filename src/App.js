import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/AppLayout"
import RequireAuth from "./components/RequireAuth"
import { AuthProvider } from "./context/AuthContext"
import { DataProvider, useData } from "./context/DataContext"
import Billing from "./pages/billing/Billing"
import ChatsTasks from "./pages/ChatsTasks"
import Documents from "./pages/documents/Documents"
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Organizers from "./pages/organizers/Organizers"
import Placeholder from "./pages/Placeholder"
import ProposalsEls from "./pages/proposals/ProposalsEls"
import Register from "./pages/Register"
import Settings from "./pages/Settings"

/**
 * Page for each menu `path` from the menus collection.
 * A menu in the database without a page here shows <Placeholder />.
 */
const pageByPath = {
  "/home": Home,
  "/document": Documents,
  "/chatstasks": ChatsTasks,
  "/organizers": Organizers,
  "/proposalsels": ProposalsEls,
  "/billing": Billing,
  "/settings": Settings,
}

function PortalRoutes() {
  const { menus = [] } = useData()

  // Every known page, plus a placeholder for any extra menu paths from the database
  const extraMenus = menus.filter((m) => !pageByPath[m.path])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {Object.entries(pageByPath).map(([path, Page]) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        {extraMenus.map((m) => (
          <Route key={m.path} path={m.path} element={<Placeholder title={m.label} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <PortalRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
