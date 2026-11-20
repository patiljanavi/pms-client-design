import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { API_URL } from "../config"
import menusData from "../data/menus"
import { assignedAccountant } from "../data/clientProfile"
import { recentlyCompleted } from "../data/recentlyCompleted"
import { clientDocuments } from "../data/clientDocuments"
import { clientChats } from "../data/clientChats"
import { clientOrganizers } from "../data/clientOrganizers"
import { clientProposals } from "../data/clientProposals"
import { clientInvoices } from "../data/clientInvoices"
import { notificationSettings } from "../data/notificationSettings"
import { clientFolders } from "../data/clientFolders"
const DataContext = createContext(null)

/** Dummy data, keyed the same way as the API endpoints below. */
const dummy = {
  menus: menusData,
  accountant: assignedAccountant,
  recentlyCompleted,
  documents: clientDocuments,
  folders: clientFolders,  
  chats: clientChats,
  organizers: clientOrganizers,
  proposals: clientProposals,
  invoices: clientInvoices,
  notificationSettings,

}

/**
 * With REACT_APP_API_URL set, each key is fetched from `${API_URL}/${key}`
 * (e.g. GET /menus). Without it, the dummy data above is used.
 */
async function load(key) {
  if (!API_URL) return dummy[key]
  const res = await fetch(`${API_URL}/${key}`, { credentials: "include" })
  if (!res.ok) throw new Error(`Could not load ${key} (${res.status})`)
  return res.json()
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => (API_URL ? {} : dummy))
  const [loading, setLoading] = useState(Boolean(API_URL))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!API_URL) return
    let active = true
    Promise.all(Object.keys(dummy).map((key) => load(key).then((value) => [key, value])))
      .then((entries) => active && setData(Object.fromEntries(entries)))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  /** Update chats (new messages, read state, ticked tasks). Accepts a value or an updater function. */
  const setChats = useCallback(
    (next) => setData((d) => ({ ...d, chats: typeof next === "function" ? next(d.chats || []) : next })),
    []
  )

 /** Update organizers (answers saved as you go, submitting). Value or updater function. */
  const setOrganizers = useCallback(
    (next) => setData((d) => ({ ...d, organizers: typeof next === "function" ? next(d.organizers || []) : next })),
    []
  )
 /** Update proposals (signing). Value or updater function. */
  const setProposals = useCallback(
    (next) => setData((d) => ({ ...d, proposals: typeof next === "function" ? next(d.proposals || []) : next })),
    []
  )
const setFolders = useCallback(
  (next) => setData((d) => ({ ...d, folders: typeof next === "function" ? next(d.folders || []) : next })),
  []
)

const setDocuments = useCallback(
  (next) => setData((d) => ({ ...d, documents: typeof next === "function" ? next(d.documents || []) : next })),
  []
)


  const value = useMemo(() => ({ ...data, setChats,setOrganizers,setProposals, setFolders, setDocuments,loading, error }), [data, setChats,setOrganizers,setProposals, setFolders, setDocuments,loading, error])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used inside <DataProvider>")
  return ctx
}
