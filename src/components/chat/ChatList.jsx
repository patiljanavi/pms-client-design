import { useState } from "react"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { formatChatDay, formatTime } from "../../lib/dates"
import { cn } from "../../lib/utils"

/** Left pane: every conversation, newest first, with a search box. */
export default function ChatList({ chats, selectedId, onSelect }) {
  const [query, setQuery] = useState("")

  const lastMessage = (chat) => chat.messages[chat.messages.length - 1]
  const visible = chats
    .filter((c) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return c.subject.toLowerCase().includes(q) || c.participants.some((p) => p.name.toLowerCase().includes(q))
    })
    .sort((a, b) => (lastMessage(b)?.sentAt || "").localeCompare(lastMessage(a)?.sentAt || ""))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <label htmlFor="chat-search" className="sr-only">
          Search chats
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="chat-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="h-10 w-full rounded-lg bg-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto" aria-label="Chats">
        {visible.length === 0 && <li className="px-4 py-6 text-sm text-muted-foreground">No chats match “{query}”.</li>}
        {visible.map((chat) => {
          const last = lastMessage(chat)
          const person = chat.participants[0]
          const active = chat._id === selectedId
          const openTasks = chat.tasks.filter((t) => !t.done).length
          const preview =
            last?.type === "file" ? `📎 ${last.text}` : last?.sender === "client" ? `You: ${last.text}` : last?.text || ""

          return (
            <li key={chat._id}>
              <button
                type="button"
                onClick={() => onSelect(chat._id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3.5 text-left transition-colors focus-visible:bg-muted focus-visible:outline-none",
                  active ? "bg-blue-50 dark:bg-primary/15" : "hover:bg-muted"
                )}
              >
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{person.initials}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate", chat.unread ? "font-bold" : "font-semibold")}>{chat.subject}</span>
                    {last && (
                      <span className={cn("shrink-0 text-xs", chat.unread ? "font-semibold text-primary" : "text-muted-foreground")}>
                        {formatChatDay(last.sentAt) === "Today" ? formatTime(last.sentAt) : formatChatDay(last.sentAt)}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", chat.unread ? "font-medium text-foreground" : "text-muted-foreground")}>{preview}</span>
                    {chat.unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                        {chat.unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {person.name} · {openTasks ? `${openTasks} open task${openTasks === 1 ? "" : "s"}` : "No open tasks"}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
