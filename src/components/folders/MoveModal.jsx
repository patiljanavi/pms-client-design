import { useState } from "react"
import { FolderOpen } from "lucide-react"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import FolderPicker, { pathLabel } from "./FolderPicker"
import { childrenOf, findNode, parentIdOf, subtreeIds } from "../../lib/folderTree"

/**
 * Move a file or folder. A folder can't go into itself or its subfolders;
 * isDisabled limits the picker further (client portal: only "Client Uploaded Documents").
 */
export default function MoveModal({ items, nodeId, onMove, onClose, isDisabled = () => false }) {
  const node = findNode(items, nodeId)
  const from = parentIdOf(items, nodeId) ?? null
  const [target, setTarget] = useState(from)
  const blocked = subtreeIds(node)
  const same = target === from
  const clash = !same && childrenOf(items, target).some((s) => s.name.toLowerCase() === node?.name.toLowerCase())

  return (
    <Modal
      title={`Move “${node?.name}”`}
      description="Choose the folder to move it to."
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={same || clash || target == null} onClick={() => onMove(target)}>
            Move here
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <FolderPicker
          items={items}
          value={target}
          onChange={setTarget}
          isDisabled={(f) => blocked.has(f.id) || isDisabled(f)}
          showRoot={false}
          label="Move to"
          expandTo={from}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
          <FolderOpen className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          {same ? (
            "It’s already in this folder — pick another."
          ) : clash ? (
            <span className="font-medium text-destructive">That folder already has something called “{node?.name}”.</span>
          ) : (
            <>
              Moves to: <span className="truncate font-medium text-foreground">{pathLabel(items, target)}</span>
            </>
          )}
        </p>
      </div>
    </Modal>
  )
}
