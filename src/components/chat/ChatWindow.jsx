import { Fragment, forwardRef, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Ban,
  CheckCheck,
  CircleCheck,
  FileText,
  ListChecks,
  MoreVertical,
  Paperclip,
  Pencil,
  Reply,
  SendHorizontal,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { formatChatDay, formatTime } from "../../lib/dates"
import { cn } from "../../lib/utils"

/** Quick reactions, like WhatsApp. */
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

/**
 * Middle pane: WhatsApp-style conversation.
 * Client messages on the right (green), firm messages on the left (white),
 * task activity in the middle. Hover (or tap on touch screens) a message to
 * react, reply, or — for your own messages — edit and delete.
 */
export default function ChatWindow({
  chat,
  myName,
  onSend,
  onSendFile,
  onEdit,
  onDelete,
  onReact,
  onBack,
  onShowTasks,
  autoFocus = false,
}) {
  const [draft, setDraft] = useState("")
  const [replyTo, setReplyTo] = useState(null) // message being answered
  const [editing, setEditing] = useState(null) // own message being edited
  const [highlightId, setHighlightId] = useState(null)
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

  // Switching chats clears any half-finished reply or edit
  useEffect(() => {
    setReplyTo(null)
    setEditing(null)
    setDraft("")
  }, [chat._id])

  const startReply = (message) => {
    setEditing(null)
    setReplyTo(message)
    inputRef.current?.focus()
  }

  const startEdit = (message) => {
    setReplyTo(null)
    setEditing(message)
    setDraft(message.text)
    inputRef.current?.focus()
  }

  const cancelCompose = () => {
    if (editing) setDraft("")
    setReplyTo(null)
    setEditing(null)
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    if (editing) {
      if (text !== editing.text) onEdit(editing._id, text)
      setEditing(null)
    } else {
      onSend(text, replyTo)
      setReplyTo(null)
    }
    setDraft("")
  }

  // Clicking a quoted message scrolls to the original and flashes it
  const jumpTo = (messageId) => {
    document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    setHighlightId(messageId)
    setTimeout(() => setHighlightId(null), 1600)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Conversation header */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <Button variant="ghost" size="icon"  onClick={onBack} aria-label="Back to chats">
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
                  <li className="my-3 flex justify-center">
                    <span className="rounded-lg bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      {formatChatDay(m.sentAt)}
                    </span>
                  </li>
                )}
                <Message
                  message={m}
                  grouped={grouped}
                  myName={myName}
                  highlighted={highlightId === m._id}
                  onReply={startReply}
                  onEdit={startEdit}
                  onDelete={onDelete}
                  onReact={onReact}
                  onJump={jumpTo}
                />
              </Fragment>
            )
          })}
          <li ref={bottomRef} aria-hidden="true" />
        </ol>
      </div>

      {/* Composer */}
      <div className="border-t bg-muted">
        {(replyTo || editing) && (
          <div className="flex items-center gap-3 border-b px-4 py-2">
            {editing ? (
              <Pencil className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <Reply className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1 border-l-4 border-primary pl-3">
              <p className="text-xs font-semibold text-primary">
                {editing ? "Editing message" : `Replying to ${replyTo.sender === "client" ? "yourself" : replyTo.senderName}`}
              </p>
              <p className="truncate text-sm text-muted-foreground">{quoteText(editing || replyTo)}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={cancelCompose} aria-label={editing ? "Cancel editing" : "Cancel reply"}>
              <X />
            </Button>
          </div>
        )}
        <form
          className="flex items-end gap-2 px-3 py-3"
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
          <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach a file" disabled={Boolean(editing)}>
            <Paperclip />
          </Button>
          <label htmlFor="chat-message" className="sr-only">
            {editing ? "Edit message" : "Message"}
          </label>
          <textarea
            id="chat-message"
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds a new line, Esc cancels a reply/edit
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              } else if (e.key === "Escape" && (replyTo || editing)) {
                e.preventDefault()
                cancelCompose()
              }
            }}
            placeholder={editing ? "Edit your message" : "Type a message"}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full"
            disabled={!draft.trim()}
            aria-label={editing ? "Save changes" : "Send message"}
          >
            {editing ? <CheckCheck /> : <SendHorizontal />}
          </Button>
        </form>
      </div>
    </div>
  )
}

/** Short text for a quoted/replied-to message. */
function quoteText(m) {
  if (!m) return ""
  if (m.deleted) return "This message was deleted"
  return m.type === "file" ? `📎 ${m.text}` : m.text
}

function Message({ message: m, grouped, myName, highlighted, onReply, onEdit, onDelete, onReact, onJump }) {
  if (m.sender === "system") {
    return (
      <li className="my-2 flex justify-center">
        <span className="flex max-w-[90%] items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-sm text-emerald-900 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-200">
          <CircleCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <span>
            {m.text} <span className="text-xs text-emerald-800/80 dark:text-emerald-300/80">· {formatTime(m.sentAt)}</span>
          </span>
        </span>
      </li>
    )
  }

  const mine = m.sender === "client"
  const reactions = Object.entries(m.reactions || {}).filter(([, people]) => people.length)

  return (
    <li id={`msg-${m._id}`} className={cn("group flex flex-col", mine ? "items-end" : "items-start", !grouped && "mt-1.5")}>
      <div className={cn("flex max-w-[85%] items-center gap-1.5", mine && "flex-row-reverse")}>
        {/* Bubble */}
        <div
          className={cn(
            "relative min-w-0 rounded-lg px-3 pb-1.5 pt-2 text-[15px] leading-snug shadow-sm transition-shadow",
            mine ? "bg-chat-out" : "bg-chat-in",
            !grouped && (mine ? "rounded-tr-none" : "rounded-tl-none"),
            highlighted && "ring-2 ring-primary"
          )}
        >
          {!mine && !grouped && <p className="mb-0.5 text-xs font-semibold text-primary">{m.senderName}</p>}
          <span className="sr-only">{mine ? "You" : m.senderName}: </span>

          {m.deleted ? (
            <p className="flex items-center gap-1.5 italic text-muted-foreground">
              <Ban className="h-4 w-4" aria-hidden="true" />
              This message was deleted
            </p>
          ) : (
            <>
              {/* Quoted message this one replies to */}
              {m.replyTo && (
                <button
                  type="button"
                  onClick={() => onJump(m.replyTo._id)}
                  className="mb-1.5 block w-full rounded-md border-l-4 border-primary bg-foreground/5 px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-xs font-semibold text-primary">
                    {m.replyTo.senderName === m.senderName ? "You" : m.replyTo.senderName}
                  </span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">{quoteText(m.replyTo)}</span>
                  <span className="sr-only"> — go to original message</span>
                </button>
              )}

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
            </>
          )}

          <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-chat-meta">
            {m.edited && !m.deleted && <span>edited ·</span>}
            {formatTime(m.sentAt)}
            {mine && !m.deleted && (
              <CheckCheck className={cn("h-3.5 w-3.5", m.read ? "text-sky-500" : "text-muted-foreground")} aria-label={m.read ? "Read" : "Delivered"} />
            )}
          </span>
        </div>

        {/* Actions — show on hover/focus, always on touch screens */}
        {!m.deleted && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-0.5 rounded-full border bg-card p-0.5 shadow-sm transition-opacity",
              "opacity-0 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ActionButton label="React">
                  <SmilePlus />
                </ActionButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={mine ? "end" : "start"} side="top" className="flex min-w-0 gap-0.5 rounded-full p-1">
                {REACTIONS.map((emoji) => {
                  const mineToo = (m.reactions?.[emoji] || []).includes(myName)
                  return (
                    <DropdownMenuItem
                      key={emoji}
                      onSelect={() => onReact(m._id, emoji)}
                      className={cn("h-9 w-9 justify-center rounded-full p-0 text-xl", mineToo && "bg-primary/15")}
                      aria-label={`${mineToo ? "Remove" : "React with"} ${emoji}`}
                    >
                      {emoji}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <ActionButton label="Reply" onClick={() => onReply(m)}>
              <Reply />
            </ActionButton>

            {mine && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ActionButton label="More options">
                    <MoreVertical />
                  </ActionButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {m.type === "text" && (
                    <DropdownMenuItem onSelect={() => onEdit(m)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => onDelete(m._id)} className="text-destructive focus:text-destructive">
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Reaction chips under the bubble — click to add/remove yours */}
      {!m.deleted && reactions.length > 0 && (
        <div className={cn("relative z-10 -mt-1.5 flex flex-wrap gap-1", mine ? "pr-2" : "pl-2")}>
          {reactions.map(([emoji, people]) => {
            const mineToo = people.includes(myName)
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(m._id, emoji)}
                aria-pressed={mineToo}
                title={people.map((n) => (n === myName ? "You" : n)).join(", ")}
                aria-label={`${emoji} ${people.length}: ${people.map((n) => (n === myName ? "you" : n)).join(", ")}`}
                className={cn(
                  "flex items-center gap-1 rounded-full border bg-card px-1.5 py-0.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  mineToo ? "border-primary/50 bg-primary/10" : "hover:bg-muted"
                )}
              >
                <span aria-hidden="true">{emoji}</span>
                {people.length > 1 && <span className="text-xs font-semibold text-muted-foreground">{people.length}</span>}
              </button>
            )
          })}
        </div>
      )}
    </li>
  )
}

/** Small round icon button used in the message action bar. Forwards ref for dropdown triggers. */
const ActionButton = forwardRef(({ label, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4"
    {...props}
  >
    {children}
  </button>
))
ActionButton.displayName = "ActionButton"
