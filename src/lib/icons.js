import { Banknote, CalendarCheck, Circle, FileSignature, FileText, House, Send, Settings } from "lucide-react"

/**
 * The menus collection stores Material UI icon names.
 * shadcn/ui uses lucide-react, so each name maps to its closest lucide icon.
 * When a new icon name shows up in the menus collection, add it here.
 */
const iconMap = {
  HomeFilledIcon: House,
  DescriptionIcon: FileText,
  TelegramIcon: Send,
  EventNoteIcon: CalendarCheck,
  ArticleIcon: FileSignature,
  PaymentsIcon: Banknote,
  SettingsIcon: Settings,
}

export function getMenuIcon(name) {
  return iconMap[name] || Circle
}
