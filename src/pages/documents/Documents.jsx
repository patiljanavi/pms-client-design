import { useMemo, useState } from "react"
import { FileCheck2, FileSignature,  } from "lucide-react"
import { ApprovalModal, SignDocumentModal } from "../../components/folders/DocActionModals"
import FolderExplorer from "../../components/folders/FolderExplorer"
import UploadModal from "../../components/folders/UploadModal"
import { PageHeader, Section } from "../../components/page"
import { Button } from "../../components/ui/button"
import { toast } from "../../components/ui/sonner"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"
import { nowIso } from "../../lib/dates"
import { findNode, findPath, insertInto, isEditable, newFile, pendingDocActions, updateNode, visibleTree } from "../../lib/folderTree"
import { formatDate, isDueThisWeek, relativeDue } from "../../lib/dates"

/** Downloads a file: uploads use their local link; sample files get a small placeholder. */
function downloadFile(file) {
  const href = file.url || URL.createObjectURL(new Blob([`Sample file: ${file.name}\n(Connect the documents API to download real files.)`], { type: "text/plain" }))
  const a = document.createElement("a")
  a.href = href
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (!file.url) setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export default function Documents() {
  const { user } = useAuth()
  const { folders = [], setFolders,  setDocuments } = useData()
  const me = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You"
  const view = useMemo(() => visibleTree(folders), [folders])
  const [requestFor, setRequestFor] = useState(null)
  const [reviewingId, setReviewingId] = useState(null) // file waiting for approve / sign
  const waiting = pendingDocActions(folders)
  const found = reviewingId ? findNode(view, reviewingId) : null
  const reviewing = found?.action?.status === "pending" ? found : null // done items can't be acted on again
  const reviewingPath = reviewingId ? findPath(view, reviewingId) || [] : [] // folders only, top → the file’s folder

  // Approve / disapprove / sign only change the file's action — the folder itself stays read only
  const setAction = (fileId, change) =>
    setFolders((all) => updateNode(all, fileId, (f) => ({ ...f, action: { ...f.action, ...change } })))

  const approve = () => {
    setAction(reviewing.id, { status: "approved", decidedAt: nowIso() })
    toast.success("Approved", { description: `${reviewing.action.requestedBy} has been told “${reviewing.name}” is approved.` })
    setReviewingId(null)
  }
  const disapprove = (reason) => {
    setAction(reviewing.id, { status: "disapproved", decidedAt: nowIso(), reason })
    toast("Disapproval sent", { description: `${reviewing.action.requestedBy} will see your reason and send an updated version.` })
    setReviewingId(null)
  }
  const sign = (name) => {
    setAction(reviewing.id, { status: "signed", signedBy: name, signedAt: nowIso() })
    toast.success("Document signed", { description: reviewing.name })
    setReviewingId(null)
  }

  // Upload for a request: saves into the request's folder and marks it received
  const uploadForRequest = (files, target) => {
    if (!isEditable(view, target)) return
    const nodes = files.map((f) => newFile(f.name, f.size, f.type, { addedBy: me, url: f.file ? URL.createObjectURL(f.file) : undefined }))
    setFolders((all) => insertInto(all, target, nodes))
    setDocuments((all) => all.map((d) => (d._id === requestFor._id ? { ...d, status: "Received", receivedAt: nowIso() } : d)))
    toast.success(`Sent “${requestFor.name}”`, { description: `${files.length} file${files.length > 1 ? "s" : ""} saved in ${findNode(view, target)?.name}` })
    setRequestFor(null)
  }

  return (
    <>
      <PageHeader title="Documents" description="Your uploaded documents, and the files your firm has shared with you." />

      {waiting.length > 0 && (
        <Section title={`Waiting for your approval or signature (${waiting.length})`}>
          <ul>
            {waiting.map(({ file, path }) => {
              const isSign = file.action.type === "signature"
              return (
                <li key={file.id} className="flex flex-wrap items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
                  <span
                    aria-hidden="true"
                    className={
                      isSign
                        ? "flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                        : "flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    }
                  >
                    {isSign ? <FileSignature className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="font-semibold">{file.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {isSign ? "Signature" : "Approval"} requested by {file.action.requestedBy} · {path.map((f) => f.name).join(" › ")}
                      {file.action.dueDate && (
                        <>
                          {" · "}Due {formatDate(file.action.dueDate)}
                          {isDueThisWeek(file.action.dueDate) && (
                            <strong className="font-semibold text-amber-700 dark:text-amber-400"> · {relativeDue(file.action.dueDate)}</strong>
                          )}
                        </>
                      )}
                    </span>
                  </span>
                  <Button onClick={() => setReviewingId(file.id)}>
                    {isSign ? <FileSignature /> : <FileCheck2 />}
                    {isSign ? "Review & sign" : "Review & approve"}
                  </Button>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

    

      <div className="overflow-hidden rounded-xl border bg-card">
        <FolderExplorer items={folders} onChange={setFolders} onDownload={downloadFile} onReview={(f) => setReviewingId(f.id)} me={me} />
      </div>

      {reviewing?.action?.type === "approval" && (
        <ApprovalModal
          key={reviewing.id}
          file={reviewing}
          path={reviewingPath}
          onApprove={approve}
          onDisapprove={disapprove}
          onDownload={downloadFile}
          onClose={() => setReviewingId(null)}
        />
      )}
      {reviewing?.action?.type === "signature" && (
        <SignDocumentModal key={reviewing.id} file={reviewing} path={reviewingPath} me={me} onSign={sign} onDownload={downloadFile} onClose={() => setReviewingId(null)} />
      )}

      {requestFor && (
        <UploadModal
          title={`Upload “${requestFor.name}”`}
          description={`Requested by ${requestFor.requestedBy}. You can add several files.`}
          items={view}
          initialTarget={findNode(view, requestFor.folderId) ? requestFor.folderId : null}
          isDisabled={(f) => !isEditable(view, f.id)}
          onClose={() => setRequestFor(null)}
          onUpload={uploadForRequest}
        />
      )}
    </>
  )
}
