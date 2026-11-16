/** App-wide settings. */
export const APP_NAME = "Harbor Client Portal"

/** Backend base URL. Empty = use the dummy data in src/data. */
export const API_URL = process.env.REACT_APP_API_URL || ""

/**
 * Fixed "today" so the dummy due dates ("in 2 days") stay stable.
 * Set to null to use the real date once you connect live data.
 */
export const TODAY = "2026-11-16"

/** Where to go after signing in. */
export const HOME_PATH = "/home"

/** Where Settings saves theme, font and number style on this device. */
export const APPEARANCE_STORAGE_KEY = "client-portal-appearance"

export const DEFAULT_FONT = "inter"

/** Fonts offered in Settings → Font. Loaded from Google Fonts on demand. */
export const FONTS = [
  {
    id: "inter",
    name: "Inter",
    feel: "Clear and neutral",
    bestFor: "Everyday use",
    sans: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "JetBrains Mono",
    monoStack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
  },
  {
    id: "ibm-plex",
    name: "IBM Plex Sans",
    feel: "Precise and technical",
    bestFor: "Invoices and figures",
    sans: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "IBM Plex Mono",
    monoStack: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  {
    id: "source-sans",
    name: "Source Sans 3",
    feel: "Friendly and easy to read",
    bestFor: "Long forms and organizers",
    sans: '"Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "Source Code Pro",
    monoStack: '"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&family=Source+Code+Pro:wght@400;500&display=swap",
  },
  {
    id: "manrope",
    name: "Manrope",
    feel: "Modern and rounded",
    bestFor: "A softer look",
    sans: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "JetBrains Mono",
    monoStack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
  },
  {
    id: "public-sans",
    name: "Public Sans",
    feel: "Plain and trustworthy",
    bestFor: "Official documents",
    sans: '"Public Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "Roboto Mono",
    monoStack: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    feel: "Compact and calm",
    bestFor: "Small screens",
    sans: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: "DM Mono",
    monoStack: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap",
  },
]
