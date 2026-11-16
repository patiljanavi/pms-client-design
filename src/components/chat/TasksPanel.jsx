import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { formatDate, isDueThisWeek, relativeDue } from "../../lib/dates"
import { cn } from "../../lib/utils"

/**
 * Right pane: tasks for the open chat.
 * Checking a task calls onToggle, which also posts it into the conversation.
 */
export default function TasksPanel({ chat, onToggle, onClose }) {
  const [showDone, setShowDone] = useState(false)
  const open = chat.tasks.filter((t) => !t.done)
  const done = chat.tasks.filter((t) => t.done)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3.5">
        <div>
          <h2 className="font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {open.length} open · {done.length} done
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onClose} aria-label="Close tasks">
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {open.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">All tasks in this chat are done.</p>
        ) : (
          <ul>
            {open.map((t) => (
              <TaskRow key={t._id} task={t} onToggle={onToggle} />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <div className="border-t">
            <button
              type="button"
              onClick={() => setShowDone((s) => !s)}
              aria-expanded={showDone}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              Completed ({done.length})
              <ChevronDown className={cn("h-4 w-4 transition-transform", showDone && "rotate-180")} aria-hidden="true" />
            </button>
            {showDone && (
              <ul>
                {done.map((t) => (
                  <TaskRow key={t._id} task={t} onToggle={onToggle} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle }) {
  const soon = !task.done && isDueThisWeek(task.dueDate)
  return (
    <li className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5 last:border-0">
      <Checkbox id={task._id} checked={task.done} onCheckedChange={(v) => onToggle(task, v === true)} className="mt-0.5" />
      <label htmlFor={task._id} className="flex-1 cursor-pointer">
        <span className={cn("block font-medium leading-snug", task.done && "text-muted-foreground line-through")}>{task.title}</span>
        <span className={cn("mt-0.5 block text-sm", soon ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
          Due {formatDate(task.dueDate)}
          {soon && `, ${relativeDue(task.dueDate)}`}
        </span>
      </label>
    </li>
  )
}
