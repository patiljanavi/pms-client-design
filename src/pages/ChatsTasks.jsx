// import { useEffect, useState } from "react"
// import { useSearchParams } from "react-router-dom"
// import { MessageSquareText } from "lucide-react"
// import ChatList from "../components/chat/ChatList"
// import ChatWindow from "../components/chat/ChatWindow"
// import TasksPanel from "../components/chat/TasksPanel"
// import { toast } from "../components/ui/sonner"
// import { useAuth } from "../context/AuthContext"
// import { useData } from "../context/DataContext"
// import { nowIso } from "../lib/dates"
// import { cn } from "../lib/utils"

// let nextId = 1
// const newId = (prefix) => `${prefix}-new-${Date.now()}-${nextId++}`

// // Chat toasts appear at the top so they don't cover the message box and Send button
// const TOAST = { position: "top-center" }

// function formatFileSize(bytes) {
//   return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
// }

// /**
//  * Chats & Tasks: chat list (left), conversation (middle), tasks for that chat (right).
//  * On smaller screens one pane shows at a time.
//  */
// export default function ChatsTasks() {
//   const { user } = useAuth()
//   const { chats = [], setChats } = useData()
//   const [searchParams, setSearchParams] = useSearchParams()
//   const linkedChat = searchParams.get("chat") // set by "Reply" on Home: /chatstasks?chat=ch-1
//   const [selectedId, setSelectedId] = useState(linkedChat)
//   const [mobilePane, setMobilePane] = useState(linkedChat ? "chat" : "list") // "list" | "chat" | "tasks"
//   const [focusComposer, setFocusComposer] = useState(Boolean(linkedChat))

//   // Following a link to a chat (also when already on this page) opens it, ready to reply
//   useEffect(() => {
//     if (linkedChat) {
//       setSelectedId(linkedChat)
//       setMobilePane("chat")
//       setFocusComposer(true)
//     }
//   }, [linkedChat])

//   // The open chat counts as read
//   const selectedUnread = chats.find((c) => c._id === selectedId)?.unread
//   useEffect(() => {
//     if (selectedId && selectedUnread) {
//       setChats((all) => all.map((c) => (c._id === selectedId ? { ...c, unread: 0 } : c)))
//     }
//   }, [selectedId, selectedUnread, setChats])

//   const selected = chats.find((c) => c._id === selectedId)
//   const unreadTotal = chats.reduce((sum, c) => sum + (c.unread || 0), 0)
//   const myName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You"

//   const updateChat = (chatId, change) => setChats((all) => all.map((c) => (c._id === chatId ? change(c) : c)))
//   const addMessage = (chatId, message) =>
//     updateChat(chatId, (c) => ({ ...c, messages: [...c.messages, { _id: newId("m"), sentAt: nowIso(), ...message }] }))

//   const openChat = (id) => {
//     setSelectedId(id)
//     setMobilePane("chat")
//     setFocusComposer(false)
//     setSearchParams({ chat: id }, { replace: true }) // refresh keeps the same chat open
//   }

//   const updateMessage = (chatId, messageId, change) =>
//     updateChat(chatId, (c) => ({ ...c, messages: c.messages.map((m) => (m._id === messageId ? change(m) : m)) }))

//   /** replyTo = the message being answered ({ _id, senderName, text, type }) or null */
//   const sendText = (text, replyTo) => {
//     addMessage(selected._id, {
//       sender: "client",
//       senderName: myName,
//       type: "text",
//       text,
//       read: false,
//       ...(replyTo && { replyTo: { _id: replyTo._id, senderName: replyTo.senderName, text: replyTo.text, type: replyTo.type } }),
//     })
//     toast.success("Message sent", { ...TOAST, description: `To ${selected.participants[0]?.name}` })
//   }

//   const sendFile = (file) => {
//     addMessage(selected._id, {
//       sender: "client",
//       senderName: myName,
//       type: "file",
//       text: file.name,
//       fileSize: formatFileSize(file.size),
//       read: false,
//     })
//     toast.success("File sent", { ...TOAST, description: file.name })
//   }

//   const editMessage = (messageId, text) => {
//     updateMessage(selected._id, messageId, (m) => ({ ...m, text, edited: true }))
//     toast.success("Message edited", TOAST)
//   }

//   // Delete shows "This message was deleted" in the chat, with Undo in the toast
//   const deleteMessage = (messageId) => {
//     const chatId = selected._id
//     updateMessage(chatId, messageId, (m) => ({ ...m, deleted: true }))
//     toast("Message deleted", {
//       ...TOAST,
//       action: { label: "Undo", onClick: () => updateMessage(chatId, messageId, (m) => ({ ...m, deleted: false })) },
//     })
//   }

//   /** Adds my reaction, or removes it if I already reacted with that emoji. */
//   const toggleReaction = (messageId, emoji) =>
//     updateMessage(selected._id, messageId, (m) => {
//       const reactions = { ...(m.reactions || {}) }
//       const people = reactions[emoji] || []
//       reactions[emoji] = people.includes(myName) ? people.filter((n) => n !== myName) : [...people, myName]
//       if (reactions[emoji].length === 0) delete reactions[emoji]
//       return { ...m, reactions }
//     })

//   // Checking a task updates the list AND posts the activity into the conversation
//   const toggleTask = (task, done) => {
//     updateChat(selected._id, (c) => ({
//       ...c,
//       tasks: c.tasks.map((t) => (t._id === task._id ? { ...t, done } : t)),
//     }))
//     addMessage(selected._id, {
//       sender: "system",
//       type: "task",
//       taskId: task._id,
//       text: done ? `${myName} completed the task “${task.title}”` : `${myName} reopened the task “${task.title}”`,
//     })
//     if (done) toast.success("Task completed", { ...TOAST, description: task.title })
//     else toast("Task reopened", { ...TOAST, description: task.title })
//   }

//   return (
//     <div>
//       <h1 className="sr-only">Chats & Tasks</h1>
//       <div className="grid h-[calc(100vh-7.5rem)] min-h-[520px] border-b bg-card lg:h-[calc(100vh-4rem)] lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_340px]">
//         {/* Left: chat list */}
//         <aside
//           aria-label="Chat list"
//           className={cn("min-h-0 border-r", mobilePane === "list" ? "block" : "hidden", "lg:block")}
//         >
//           <ChatList chats={chats} selectedId={selectedId} onSelect={openChat} />
//         </aside>

//         {/* Middle: conversation */}
//         <section className={cn("min-h-0", mobilePane === "chat" ? "block" : "hidden", "lg:block")}>
//           {selected ? (
//             <ChatWindow
//               chat={selected}
//               myName={myName}
//               onSend={sendText}
//               onSendFile={sendFile}
//               onEdit={editMessage}
//               onDelete={deleteMessage}
//               onReact={toggleReaction}
//               onBack={() => {
//                 setMobilePane("list")
//                 setSelectedId(null)
//                 setSearchParams({}, { replace: true })
//               }}
//               onShowTasks={() => setMobilePane("tasks")}
//               autoFocus={focusComposer}
//             />
//           ) : (
//             <div className="flex h-full flex-col items-center justify-center gap-3 bg-chat-wall p-8 text-center">
//               <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card/80 text-muted-foreground shadow-sm">
//                 <MessageSquareText className="h-8 w-8" aria-hidden="true" />
//               </span>
//               <p className="text-lg font-semibold text-foreground">Select a chat</p>
//               <p className="max-w-xs text-sm text-muted-foreground">
//                 {unreadTotal
//                   ? `You have ${unreadTotal} unread message${unreadTotal === 1 ? "" : "s"}. Pick a conversation on the left to read and reply.`
//                   : "Pick a conversation on the left to read and reply."}
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Right: tasks for the open chat */}
//         <aside
//           aria-label="Tasks"
//           className={cn(
//             "min-h-0 border-l bg-card",
//             mobilePane === "tasks" ? "block" : "hidden",
//             "xl:block",
//             // On lg screens tasks open as an overlay on the right
//             mobilePane === "tasks" && "lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:z-30 lg:w-[340px] lg:shadow-xl xl:static xl:shadow-none"
//           )}
//         >
//           {selected ? (
//             <TasksPanel chat={selected} onToggle={toggleTask} onClose={() => setMobilePane("chat")} />
//           ) : (
//             <div className="px-4 py-3.5">
//               <h2 className="font-bold">Tasks</h2>
//               <p className="mt-1 text-sm text-muted-foreground">Open a chat to see its tasks.</p>
//             </div>
//           )}
//         </aside>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { MessageSquareText } from "lucide-react"
import ChatList from "../components/chat/ChatList"
import ChatWindow from "../components/chat/ChatWindow"
import TasksPanel from "../components/chat/TasksPanel"
import { toast } from "../components/ui/sonner"
import { useAuth } from "../context/AuthContext"
import { useData } from "../context/DataContext"
import { nowIso } from "../lib/dates"
import { cn } from "../lib/utils"

let nextId = 1
const newId = (prefix) => `${prefix}-new-${Date.now()}-${nextId++}`

// Chat toasts appear at the top so they don't cover the message box and Send button
const TOAST = { position: "top-center" }

function formatFileSize(bytes) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Chats & Tasks: chat list (left), conversation (middle), tasks for that chat (right).
 * On smaller screens one pane shows at a time.
 */
export default function ChatsTasks() {
  const { user } = useAuth()
  const { chats = [], setChats } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const linkedChat = searchParams.get("chat") // set by "Reply" on Home: /chatstasks?chat=ch-1
  const [selectedId, setSelectedId] = useState(linkedChat)
  const [mobilePane, setMobilePane] = useState(linkedChat ? "chat" : "list") // "list" | "chat" | "tasks"
  const [focusComposer, setFocusComposer] = useState(Boolean(linkedChat))

  // Following a link to a chat (also when already on this page) opens it, ready to reply
  useEffect(() => {
    if (linkedChat) {
      setSelectedId(linkedChat)
      setMobilePane("chat")
      setFocusComposer(true)
    }
  }, [linkedChat])

  // The open chat counts as read
  const selectedUnread = chats.find((c) => c._id === selectedId)?.unread
  useEffect(() => {
    if (selectedId && selectedUnread) {
      setChats((all) => all.map((c) => (c._id === selectedId ? { ...c, unread: 0 } : c)))
    }
  }, [selectedId, selectedUnread, setChats])

  const selected = chats.find((c) => c._id === selectedId)
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unread || 0), 0)
  const myName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You"

  const updateChat = (chatId, change) => setChats((all) => all.map((c) => (c._id === chatId ? change(c) : c)))
  const addMessage = (chatId, message) =>
    updateChat(chatId, (c) => ({ ...c, messages: [...c.messages, { _id: newId("m"), sentAt: nowIso(), ...message }] }))

  const openChat = (id) => {
    setSelectedId(id)
    setMobilePane("chat")
    setFocusComposer(false)
    setSearchParams({ chat: id }, { replace: true }) // refresh keeps the same chat open
  }

  const updateMessage = (chatId, messageId, change) =>
    updateChat(chatId, (c) => ({ ...c, messages: c.messages.map((m) => (m._id === messageId ? change(m) : m)) }))

  /** replyTo = the message being answered ({ _id, senderName, text, type }) or null */
  const sendText = (text, replyTo) => {
    addMessage(selected._id, {
      sender: "client",
      senderName: myName,
      type: "text",
      text,
      read: false,
      ...(replyTo && { replyTo: { _id: replyTo._id, senderName: replyTo.senderName, text: replyTo.text, type: replyTo.type } }),
    })
    toast.success("Message sent", { ...TOAST, description: `To ${selected.participants[0]?.name}` })
  }

  const sendFile = (file) => {
    addMessage(selected._id, {
      sender: "client",
      senderName: myName,
      type: "file",
      text: file.name,
      fileSize: formatFileSize(file.size),
      read: false,
    })
    toast.success("File sent", { ...TOAST, description: file.name })
  }

  const editMessage = (messageId, text) => {
    updateMessage(selected._id, messageId, (m) => ({ ...m, text, edited: true }))
    toast.success("Message edited", TOAST)
  }

  // Delete shows "This message was deleted" in the chat, with Undo in the toast
  const deleteMessage = (messageId) => {
    const chatId = selected._id
    updateMessage(chatId, messageId, (m) => ({ ...m, deleted: true }))
    toast("Message deleted", {
      ...TOAST,
      action: { label: "Undo", onClick: () => updateMessage(chatId, messageId, (m) => ({ ...m, deleted: false })) },
    })
  }

  /** Adds my reaction, or removes it if I already reacted with that emoji. */
  const toggleReaction = (messageId, emoji) =>
    updateMessage(selected._id, messageId, (m) => {
      const reactions = { ...(m.reactions || {}) }
      const people = reactions[emoji] || []
      reactions[emoji] = people.includes(myName) ? people.filter((n) => n !== myName) : [...people, myName]
      if (reactions[emoji].length === 0) delete reactions[emoji]
      return { ...m, reactions }
    })

  // Checking a task updates the list AND posts the activity into the conversation
  const toggleTask = (task, done) => {
    updateChat(selected._id, (c) => ({
      ...c,
      tasks: c.tasks.map((t) => (t._id === task._id ? { ...t, done } : t)),
    }))
    addMessage(selected._id, {
      sender: "system",
      type: "task",
      taskId: task._id,
      text: done ? `${myName} completed the task “${task.title}”` : `${myName} reopened the task “${task.title}”`,
    })
    if (done) toast.success("Task completed", { ...TOAST, description: task.title })
    else toast("Task reopened", { ...TOAST, description: task.title })
  }

  return (
    <div>
      <h1 className="sr-only">Chats & Tasks</h1>
      <div
        className={cn(
          "grid h-[calc(100vh-7.5rem)] min-h-[520px] border-b bg-card lg:h-[calc(100vh-4rem)] lg:grid-cols-[320px_1fr]",
          // Tasks column only once a chat is open
          selected && "xl:grid-cols-[320px_1fr_340px]"
        )}
      >
        {/* Left: chat list */}
        <aside
          aria-label="Chat list"
          className={cn("min-h-0 border-r", mobilePane === "list" ? "block" : "hidden", "lg:block")}
        >
          <ChatList chats={chats} selectedId={selectedId} onSelect={openChat} />
        </aside>

        {/* Middle: conversation */}
        <section className={cn("min-h-0", mobilePane === "chat" ? "block" : "hidden", "lg:block")}>
          {selected ? (
            <ChatWindow
              chat={selected}
              myName={myName}
              onSend={sendText}
              onSendFile={sendFile}
              onEdit={editMessage}
              onDelete={deleteMessage}
              onReact={toggleReaction}
              onBack={() => {
                setMobilePane("list")
                setSelectedId(null)
                setSearchParams({}, { replace: true })
              }}
              onShowTasks={() => setMobilePane("tasks")}
              autoFocus={focusComposer}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-chat-wall p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card/80 text-muted-foreground shadow-sm">
                <MessageSquareText className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="text-lg font-semibold text-foreground">Select a chat</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {unreadTotal
                  ? `You have ${unreadTotal} unread message${unreadTotal === 1 ? "" : "s"}. Pick a conversation on the left to read and reply.`
                  : "Pick a conversation on the left to read and reply."}
              </p>
            </div>
          )}
        </section>

        {/* Right: tasks for the open chat — only shown once a chat is selected */}
        {selected && (
          <aside
            aria-label="Tasks"
            className={cn(
              "min-h-0 border-l bg-card",
              mobilePane === "tasks" ? "block" : "hidden",
              "xl:block",
              // On lg screens tasks open as an overlay on the right
              mobilePane === "tasks" && "lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:z-30 lg:w-[340px] lg:shadow-xl xl:static xl:shadow-none"
            )}
          >
            <TasksPanel chat={selected} onToggle={toggleTask} onClose={() => setMobilePane("chat")} />
          </aside>
        )}
      </div>
    </div>
  )
}