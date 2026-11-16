import { Fragment, useEffect, useRef, useState } from "react"
import { ArrowLeft, CheckCheck, CircleCheck, FileText, ListChecks, Paperclip, SendHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { formatChatDay, formatTime } from "../../lib/dates"
import { cn } from "../../lib/utils"
import { ToastBridge } from "components/ui"

/**
 * Middle pane: WhatsApp-style conversation.
 * Client messages on the right (green), firm messages on the left (white),
 * task activity in the middle.
 */
export default function ChatWindow({ chat, onSend, onSendFile, onBack, onShowTasks, autoFocus = false }) {
  const [draft, setDraft] = useState("")
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const inputRef = useRef(null)
  const person = chat.participants[0]
  const openTasks = chat.tasks.filter((t) => !t.done).length

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [chat._id, chat.messages.length])

  // Opened from "Reply" on Home: cursor goes straight into the message box
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus, chat._id])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Conversation header */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack} aria-label="Back to chats">
          <ArrowLeft />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">{person.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold">{chat.subject}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {person.name}, {person.role}
          </p>
        </div>
        <Button variant="outline" size="sm" className="xl:hidden" onClick={onShowTasks}>
          <ListChecks /> Tasks{openTasks ? ` (${openTasks})` : ""}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-chat-wall px-4 py-4 sm:px-8" role="log" aria-label={`Messages in ${chat.subject}`}>
        <ol className="mx-auto flex max-w-3xl flex-col gap-1.5">
          {chat.messages.map((m, i) => {
            const prev = chat.messages[i - 1]
            const newDay = !prev || prev.sentAt.slice(0, 10) !== m.sentAt.slice(0, 10)
            const grouped = prev && !newDay && prev.sender === m.sender && m.sender !== "system"
            return (
              <Fragment key={m._id}>
                {newDay && (
                  <li className="my-3 flex justify-center" aria-hidden="false">
                    <span className="rounded-lg bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      {formatChatDay(m.sentAt)}
                    </span>
                  </li>
                )}
                <Message message={m} grouped={grouped} />
              </Fragment>
            )
          })}
          <li ref={bottomRef} aria-hidden="true" />
        </ol>
      </div>

      {/* Composer */}
      <form
        className="flex items-end gap-2 border-t bg-muted px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSendFile(file)
            e.target.value = ""
          }}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach a file">
          <Paperclip />
        </Button>
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-message"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a new line
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Type a message"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" className="h-11 w-11 rounded-full" disabled={!draft.trim()} aria-label="Send message">
          <SendHorizontal />
        </Button>
      </form>
      <ToastBridge/>
    </div>
  )
}

function Message({ message: m, grouped }) {
  if (m.sender === "system") {
    return (
      <li className="my-2 flex justify-center">
        <span className="flex max-w-[90%] items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-sm text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200 shadow-sm">
          <CircleCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <span>
            {m.text} <span className="text-xs text-emerald-800/80 dark:text-emerald-300/80">· {formatTime(m.sentAt)}</span>
          </span>
        </span>
      </li>
    )
  }

  const mine = m.sender === "client"
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start", !grouped && "mt-1.5")}>
      <div
        className={cn(
          "relative max-w-[78%] rounded-lg px-3 pb-1.5 pt-2 text-[15px] leading-snug shadow-sm",
          mine ? "bg-chat-out" : "bg-chat-in",
          !grouped && (mine ? "rounded-tr-none" : "rounded-tl-none")
        )}
      >
        {!mine && !grouped && <p className="mb-0.5 text-xs font-semibold text-primary">{m.senderName}</p>}
        <span className="sr-only">{mine ? "You" : m.senderName}: </span>

        {m.type === "file" ? (
          <a href={`#file-${m._id}`} className="flex items-center gap-3 rounded-md bg-foreground/5 p-2.5 pr-4 text-foreground no-underline">
            <FileText className="h-8 w-8 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-medium">{m.text}</span>
              {m.fileSize && <span className="text-xs text-muted-foreground">{m.fileSize}</span>}
            </span>
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words">{m.text}</p>
        )}

        <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-chat-meta">
          {formatTime(m.sentAt)}
          {mine && (
            <CheckCheck
              className={cn("h-3.5 w-3.5", m.read ? "text-sky-500" : "text-muted-foreground")}
              aria-label={m.read ? "Read" : "Delivered"}
            />
          )}
        </span>
      </div>
    </li>
  )
}
