import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppearanceProvider } from "./context/AppearanceContext"
import { AuthProvider } from "./context/AuthContext"
import { DataProvider } from "./context/DataContext"

/** Render a page inside the app's providers, at a given route. */
export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AppearanceProvider>
      <AuthProvider>
        <DataProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </DataProvider>
      </AuthProvider>
    </AppearanceProvider>
  )
}
