import { render, screen } from "@testing-library/react"
import App from "./App"
import { AppearanceProvider } from "./context/AppearanceContext"

test("shows the sign-in page first", () => {
  render(<AppearanceProvider><App /></AppearanceProvider>)
  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
})

test("signed-out visitors to /home are sent to sign in", () => {
  window.history.pushState({}, "", "/home")
  render(<AppearanceProvider><App /></AppearanceProvider>)
  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
})
