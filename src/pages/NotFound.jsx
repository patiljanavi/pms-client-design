import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-extrabold">This page doesn’t exist</h1>
      <p className="mt-2 text-muted-foreground">Check the address, or go back to your to-do list.</p>
      <Button asChild className="mt-6">
        <Link to="/home">Go to Home</Link>
      </Button>
    </div>
  )
}
