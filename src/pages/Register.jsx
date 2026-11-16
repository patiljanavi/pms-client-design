import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../context/AuthContext"
import { invitation } from "../data/clientProfile"
import { HOME_PATH } from "../config"
import { cn } from "../lib/utils"

const steps = [
  { title: "Create your login", text: "Name, email and a password" },
  { title: "Confirm your email", text: "We send a 6-digit code" },
  { title: "See your to-do list", text: "Everything your firm needs from you" },
]

const scoreLabel = ["Too short", "Weak", "Fair", "Strong", "Very strong"]

function passwordScore(pw) {
  let score = 0
  if (pw.length >= 10) score++
  if (/\d/.test(pw)) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: invitation.firstName, lastName: invitation.lastName, password: "" })
  const [agreed, setAgreed] = useState(false)
  const score = passwordScore(form.password)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register({ ...form, email: invitation.email })
    navigate(HOME_PATH, { replace: true })
  }

  return (
    <AuthShell
      panel={
        <>
          <p className="text-sm font-bold text-blue-300">You’re invited</p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
            {invitation.invitedBy} invited {invitation.accountName} to the portal.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-muted">
            Create your login to see what’s pending and keep everything in one secure place.
          </p>
          <ol className="mt-10 space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[36px_1fr] items-start gap-3.5">
                <span
                  aria-current={i === 0 ? "step" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    i === 0 ? "bg-white text-navy" : "border-[1.5px] border-slate-400 text-slate-200"
                  )}
                >
                  {i + 1}
                </span>
                <span>
                  <strong className="block">{step.title}</strong>
                  <span className="text-navy-muted">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </>
      }
    >
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-muted-foreground">Step 1 of 3</p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" autoComplete="given-name" value={form.firstName} onChange={update("firstName")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" autoComplete="family-name" value={form.lastName} onChange={update("lastName")} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" readOnly value={invitation.email} aria-describedby="email-hint" />
          <p id="email-hint" className="text-sm text-muted-foreground">
            From your invitation — can’t be changed here.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            aria-describedby="password-hint"
            minLength={10}
            required
          />
          <div aria-hidden="true" className="grid grid-cols-4 gap-1.5 pt-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 rounded-full", i < score ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
          <p id="password-hint" className="text-sm text-muted-foreground">
            {form.password ? `${scoreLabel[score]} · ` : ""}At least 10 characters with a number
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
          <Label htmlFor="terms" className="font-normal text-foreground">
            I agree to the{" "}
            <a href="#terms" className="text-primary underline underline-offset-2">
              portal terms
            </a>{" "}
            and{" "}
            <a href="#privacy" className="text-primary underline underline-offset-2">
              privacy notice
            </a>
          </Label>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!agreed}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
