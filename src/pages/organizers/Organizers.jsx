import { PageHeader } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { useData } from "../../context/DataContext"
import { formatDate } from "../../lib/dates"

const statusVariant = { "Not started": "secondary", "In progress": "info", Submitted: "success" }

export default function Organizers() {
  const { organizers = [] } = useData()
  return (
    <>
      <PageHeader title="Organizers" description="Questionnaires your accountant uses to prepare your return." />
      <div className="grid gap-5 md:grid-cols-2">
        {organizers.map((o) => {
          const pct = Math.round((o.answered / o.total) * 100)
          const submitted = o.status === "Submitted"
          return (
            <Card key={o._id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{o.name}</h2>
                <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
              </div>
              <Progress value={pct} className="mt-5" aria-label={`${o.name} progress`} />
              <p className="mt-2 text-sm text-muted-foreground">
                {o.answered} of {o.total} questions answered · Due{" "}
                {formatDate(o.dueDate, { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <Button className="mt-5" variant={submitted ? "outline" : "default"}>
                {submitted ? "View answers" : o.answered ? "Continue" : "Start"}
              </Button>
            </Card>
          )
        })}
      </div>
    </>
  )
}
