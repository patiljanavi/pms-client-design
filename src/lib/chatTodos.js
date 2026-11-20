/** Link that opens Chats & Tasks with one chat selected. */
export const chatLink = (chatId) => `/chatstasks?chat=${encodeURIComponent(chatId)}`

/**
 * One to-do row per chat that is waiting on the client:
 * unread messages and/or open tasks in that chat.
 * dueDate = the earliest open task, so rows sort with the rest of the list.
 */
export function chatsToTodos(chats = []) {
  return chats
    .map((chat) => {
      const openTasks = chat.tasks.filter((t) => !t.done)
      if (!chat.unread && openTasks.length === 0) return null

      const person = chat.participants[0]
      const firstName = person?.name.split(" ")[0] || "your accountant"
      const nextDue = openTasks.map((t) => t.dueDate).filter(Boolean).sort()[0] || null
      const last = chat.messages[chat.messages.length - 1]

      const parts = []
      if (chat.unread) parts.push(`${chat.unread} unread message${chat.unread === 1 ? "" : "s"}`)
      if (openTasks.length) parts.push(`${openTasks.length} open task${openTasks.length === 1 ? "" : "s"}`)

      return {
        _id: `chat-${chat._id}`,
        type: "message",
        chatId: chat._id,
        title: chat.unread ? `Reply to ${firstName}: “${chat.subject}”` : `Finish tasks in “${chat.subject}”`,
        detail: parts.join(" · "),
        preview: chat.unread && last && last.sender !== "client" && !last.deleted ? (last.type === "file" ? `📎 ${last.text}` : last.text) : null,
        dueDate: nextDue,
        unread: chat.unread || 0,
        actionLabel: chat.unread ? "Reply" : "Open chat",
        actionPath: chatLink(chat._id),
      }
    })
    .filter(Boolean)
}
