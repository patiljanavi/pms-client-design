import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import AuthShell from "../components/AuthShell"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../context/AuthContext"
import { HOME_PATH } from "../config"

const benefits = ["Bank-level encryption for every file", "E-sign engagement letters in minutes", "Pay invoices online, anytime"]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await login({ email, password, remember })
    navigate(location.state?.from?.pathname || HOME_PATH, { replace: true })
  }

  return (
    <AuthShell
      panel={
        <>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
            Everything your accountant needs from you, in one place.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-navy-muted">
            Sign documents, upload files, pay invoices and answer questions — and see exactly what’s still pending.
          </p>
          <ul className="mt-8 space-y-3.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3.5 text-base text-slate-200">
                <Check className="h-5 w-5 text-blue-300" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-muted-foreground">Welcome back. Use the email your firm invited.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#forgot" className="text-sm font-semibold text-primary underline underline-offset-2">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          <Label htmlFor="remember" className="font-normal text-foreground">
            Keep me signed in on this device
          </Label>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-muted-foreground">
        New to the portal?{" "}
        <Link to="/register" className="font-semibold text-primary underline underline-offset-2">
          Create your account
        </Link>
      </p>
    </AuthShell>
  )
}
