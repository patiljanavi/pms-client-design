import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { APPEARANCE_STORAGE_KEY, DEFAULT_FONT, FONTS } from "../config"

const AppearanceContext = createContext(null)
const DEFAULTS = { theme: "system", fontId: DEFAULT_FONT, tabular: true }

function readSaved() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) || "{}") }
  } catch {
    return DEFAULTS
  }
}

/** Adds the Google Fonts stylesheet for a font once. */
export function loadFont(font) {
  if (!font?.href || document.querySelector(`link[data-font="${font.id}"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = font.href
  link.dataset.font = font.id
  document.head.appendChild(link)
}

const prefersDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(readSaved)
  const [systemDark, setSystemDark] = useState(prefersDark)

  // Follow the device setting while "System" is chosen
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!mq) return
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const font = FONTS.find((f) => f.id === settings.fontId) || FONTS[0]
  const resolvedTheme = settings.theme === "system" ? (systemDark ? "dark" : "light") : settings.theme

  // Apply to <html> and save on this device
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
    root.classList.toggle("tabular", settings.tabular)
    loadFont(font)
    root.style.setProperty("--font-sans", font.sans)
    root.style.setProperty("--font-mono", font.monoStack)
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* storage can be unavailable (private mode) — settings still apply for this visit */
    }
  }, [settings, resolvedTheme, font])

  const setTheme = useCallback((theme) => setSettings((s) => ({ ...s, theme })), [])
  const setFont = useCallback((fontId) => setSettings((s) => ({ ...s, fontId })), [])
  const setTabular = useCallback((tabular) => setSettings((s) => ({ ...s, tabular })), [])
  const reset = useCallback(() => setSettings((s) => ({ ...s, fontId: DEFAULT_FONT, tabular: true })), [])

  const value = useMemo(
    () => ({
      theme: settings.theme,
      resolvedTheme,
      setTheme,
      fontId: settings.fontId,
      font,
      setFont,
      tabular: settings.tabular,
      setTabular,
      reset,
    }),
    [settings, resolvedTheme, font, setTheme, setFont, setTabular, reset]
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

/** Returns null outside <AppearanceProvider>, so callers can fall back safely. */
export function useAppearance() {
  return useContext(AppearanceContext)
}
