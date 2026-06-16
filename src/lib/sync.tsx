import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePlanner, type PlannerData } from './store'
import { isSyncConfigured } from './syncConfig'
import * as drive from './drive'

export type SyncStatus =
  | 'off' // sync not configured for this build
  | 'disconnected' // configured, not connected
  | 'connecting' // signing in / first handshake
  | 'idle' // connected, up to date
  | 'syncing' // a pull/push is in flight
  | 'error' // last operation failed

interface SyncApi {
  status: SyncStatus
  lastSyncedAt: number | null
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  syncNow: () => Promise<void>
  /** Delete the cloud copy and stop syncing. Throws if the delete fails. */
  deleteCloud: () => Promise<void>
}

const CONNECTED_KEY = 'techo.sync.google'
const BACKUP_PREFIX = 'techo.planner.backup.'
const PUSH_DEBOUNCE_MS = 1500

const SyncContext = createContext<SyncApi | null>(null)

function hasAnyContent(d: PlannerData): boolean {
  if (Object.values(d.monthNotes).some((v) => v.trim())) return true
  if (Object.values(d.weekNotes).some((v) => v.trim())) return true
  for (const day of Object.values(d.days)) {
    if (day.tasks.length || day.note.trim()) return true
    if (Object.values(day.schedule).some((v) => v.trim())) return true
  }
  return false
}

/** Keep a timestamped local copy before the cloud overwrites this device. */
function backupLocal(d: PlannerData) {
  try {
    localStorage.setItem(BACKUP_PREFIX + Date.now(), JSON.stringify(d))
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(BACKUP_PREFIX))
      .sort()
    while (keys.length > 3) localStorage.removeItem(keys.shift()!)
  } catch {
    // non-fatal
  }
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const planner = usePlanner()
  const configured = isSyncConfigured()

  const [status, setStatus] = useState<SyncStatus>(() => {
    if (!configured) return 'off'
    return localStorage.getItem(CONNECTED_KEY) === '1' ? 'connecting' : 'disconnected'
  })
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Latest planner snapshot, without retriggering effects on every keystroke.
  const dataRef = useRef(planner.data)
  useEffect(() => {
    dataRef.current = planner.data
  }, [planner.data])

  const remoteId = useRef<string | null>(null)
  // updatedAt of the snapshot already reflected in the cloud; guards the
  // auto-push so a freshly pulled copy is never echoed straight back.
  const syncedStamp = useRef<number>(-1)
  const pushTimer = useRef<number | undefined>(undefined)
  const busy = useRef(false)

  // Reconcile this device with the cloud (last-write-wins).
  const reconcile = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    setStatus('syncing')
    setError(null)
    try {
      let local = dataRef.current
      // Pre-sync data predates timestamps (updatedAt 0). Stamp it so it can
      // win against an empty cloud and propagate to other devices.
      if (local.updatedAt === 0 && hasAnyContent(local)) {
        const stamped = { ...local, updatedAt: Date.now() }
        planner.replaceAll(stamped)
        local = stamped
      }

      const remote = await drive.read()
      remoteId.current = remote.id
      const remoteData =
        remote.content && typeof remote.content === 'object'
          ? (remote.content as PlannerData)
          : null
      const remoteStamp =
        remoteData && typeof remoteData.updatedAt === 'number'
          ? remoteData.updatedAt
          : -1

      if (remoteData && remoteStamp > local.updatedAt) {
        // Cloud is newer: keep a safety copy, then adopt the cloud version.
        backupLocal(local)
        const applied = planner.replaceAll(remoteData)
        syncedStamp.current = applied?.updatedAt ?? remoteStamp
      } else if (local.updatedAt > remoteStamp) {
        // This device is newer (or cloud is empty): push up.
        remoteId.current = await drive.write(JSON.stringify(local), remote.id)
        syncedStamp.current = local.updatedAt
      } else {
        syncedStamp.current = local.updatedAt
      }

      setStatus('idle')
      setLastSyncedAt(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed')
      setStatus('error')
    } finally {
      busy.current = false
    }
  }, [planner])

  const connect = useCallback(async () => {
    if (!configured) return
    setStatus('connecting')
    setError(null)
    try {
      await drive.connect()
      localStorage.setItem(CONNECTED_KEY, '1')
      await reconcile()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't connect")
      setStatus('disconnected')
    }
  }, [configured, reconcile])

  const disconnect = useCallback(() => {
    drive.disconnect()
    localStorage.removeItem(CONNECTED_KEY)
    remoteId.current = null
    syncedStamp.current = -1
    setStatus('disconnected')
    setLastSyncedAt(null)
    setError(null)
  }, [])

  const syncNow = useCallback(async () => {
    if (status === 'off' || status === 'disconnected') return
    await reconcile()
  }, [status, reconcile])

  const deleteCloud = useCallback(async () => {
    window.clearTimeout(pushTimer.current)
    await drive.remove(remoteId.current) // throws on real failure
    disconnect()
  }, [disconnect])

  // On load: if previously connected, try a silent reconnect + sync.
  useEffect(() => {
    if (!configured) return
    if (localStorage.getItem(CONNECTED_KEY) !== '1') return
    // status already starts as 'connecting' (see initial useState) on reload.
    let cancelled = false
    drive
      .hasSilentAccess()
      .then((ok) => {
        if (cancelled) return
        if (ok) void reconcile()
        else setStatus('disconnected') // needs a quick re-click to reconnect
      })
      .catch(() => {
        if (!cancelled) setStatus('disconnected')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured])

  // Auto-push local edits (debounced) once connected.
  useEffect(() => {
    const d = planner.data
    const connected =
      status === 'idle' || status === 'syncing' || status === 'error'
    if (!connected) return
    if (d.updatedAt <= 0 || d.updatedAt <= syncedStamp.current) return

    window.clearTimeout(pushTimer.current)
    pushTimer.current = window.setTimeout(async () => {
      if (busy.current) return
      busy.current = true
      setStatus('syncing')
      try {
        const snapshot = dataRef.current
        remoteId.current = await drive.write(
          JSON.stringify(snapshot),
          remoteId.current,
        )
        syncedStamp.current = snapshot.updatedAt
        setStatus('idle')
        setLastSyncedAt(Date.now())
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sync failed')
        setStatus('error')
      } finally {
        busy.current = false
      }
    }, PUSH_DEBOUNCE_MS)

    return () => window.clearTimeout(pushTimer.current)
  }, [planner.data, status])

  const api: SyncApi = {
    status,
    lastSyncedAt,
    error,
    connect,
    disconnect,
    syncNow,
    deleteCloud,
  }

  return <SyncContext.Provider value={api}>{children}</SyncContext.Provider>
}

export function useSync(): SyncApi {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync must be used within SyncProvider')
  return ctx
}
