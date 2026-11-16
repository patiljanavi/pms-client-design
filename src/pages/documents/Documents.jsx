import { FileText, Upload } from "lucide-react"
import { PageHeader, Section } from "../../components/page"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useData } from "../../context/DataContext"
import { formatDate } from "../../lib/dates"

const statusVariant = { Received: "info", Requested: "warning", Reviewed: "success" }

export default function Documents() {
  const { documents = [] } = useData()
  const requested = documents.filter((d) => d.status === "Requested")
  const files = documents.filter((d) => d.status !== "Requested")

  return (
    <>
      <PageHeader
        title="Documents"
        description="Files you’ve shared with Harbor, and the ones we still need."
        action={
          <Button size="lg">
            <Upload /> Upload documents
          </Button>
        }
      />

      <Section title={`Requested from you (${requested.length})`}>
        <ul>
          {requested.map((d) => (
            <li key={d._id} className="flex flex-wrap items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
              <span className="flex-1 basis-56">
                <span className="font-semibold">{d.name}</span>
                <span className="block text-sm text-muted-foreground">{d.folder}</span>
              </span>
              <Button variant="outline">
                <Upload /> Upload
              </Button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Your files" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                <th scope="col" className="px-3 py-3 font-semibold">Folder</th>
                <th scope="col" className="px-3 py-3 font-semibold">Added by</th>
                <th scope="col" className="px-3 py-3 font-semibold">Date</th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((d) => (
                <tr key={d._id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-2.5 font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      {d.name}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">{d.folder}</td>
                  <td className="px-3 py-3.5">{d.uploadedBy}</td>
                  <td className="px-3 py-3.5">{formatDate(d.uploadedAt)}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={statusVariant[d.status]}>{d.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
