/** Top-nav menus, exactly as stored in the MongoDB `menus` collection. */
const menus = [
  { _id: { $oid: "6877601401bec95e479eac4b" }, label: "Home", path: "/home", icon: "HomeFilledIcon", __v: 0 },
  { _id: { $oid: "6877602e01bec95e479eac4d" }, label: "Documents", path: "/document", icon: "DescriptionIcon", __v: 0 },
  { _id: { $oid: "6877603701bec95e479eac4f" }, label: "Chats & Tasks", path: "/chatstasks", icon: "TelegramIcon", __v: 0 },
  { _id: { $oid: "6877604201bec95e479eac51" }, label: "Organizers", path: "/organizers", icon: "EventNoteIcon", __v: 0 },
  { _id: { $oid: "6877604b01bec95e479eac53" }, label: "Proposals & ELs", path: "/proposalsels", icon: "ArticleIcon", __v: 0 },
  { _id: { $oid: "6877605701bec95e479eac55" }, label: "Billing", path: "/billing", icon: "PaymentsIcon", __v: 0 },
  { _id: { $oid: "6877606301bec95e479eac57" }, label: "Settings", path: "/settings", icon: "SettingsIcon", __v: 0 },
]

export default menus
