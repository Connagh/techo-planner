import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface DayEntry {
  tasks: Task[]
  /** Hour (0–23) -> note for the daily timeline. */
  schedule: Record<number, string>
  note: string
}

export interface PlannerData {
  days: Record<string, DayEntry>
  /** "YYYY-MM" -> monthly intention. */
  monthNotes: Record<string, string>
  /** Week-start key (YYYY-MM-DD) -> weekly focus. */
  weekNotes: Record<string, string>
}

const STORAGE_KEY = 'techo.planner.v1'

const EMPTY_DAY: DayEntry = { tasks: [], schedule: {}, note: '' }

function load(): PlannerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const clean = sanitize(JSON.parse(raw))
      if (clean) return clean
    }
  } catch {
    // ignore corrupt storage
  }
  return { days: {}, monthNotes: {}, weekNotes: {} }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface PlannerApi {
  getDay: (k: string) => DayEntry
  hasContent: (k: string) => boolean
  taskCounts: (k: string) => { total: number; done: number }
  addTask: (k: string, text: string) => void
  toggleTask: (k: string, id: string) => void
  editTask: (k: string, id: string, text: string) => void
  removeTask: (k: string, id: string) => void
  setNote: (k: string, note: string) => void
  setSchedule: (k: string, hour: number, text: string) => void
  monthNote: (mk: string) => string
  setMonthNote: (mk: string, note: string) => void
  weekNote: (wk: string) => string
  setWeekNote: (wk: string, note: string) => void
  /** Full planner snapshot, for backups. */
  exportData: () => PlannerData
  /** Replace the entire planner from a backup. Returns false if invalid. */
  importData: (raw: unknown) => boolean
}

/** Narrow an unknown value (e.g. parsed JSON) into a safe PlannerData. */
function sanitize(raw: unknown): PlannerData | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const out: PlannerData = { days: {}, monthNotes: {}, weekNotes: {} }

  const days = obj.days
  if (days && typeof days === 'object') {
    for (const [k, v] of Object.entries(days as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue
      const d = v as Record<string, unknown>
      const tasks = Array.isArray(d.tasks)
        ? (d.tasks as unknown[])
            .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
            .map((t) => ({
              id: typeof t.id === 'string' ? t.id : uid(),
              text: typeof t.text === 'string' ? t.text : '',
              done: t.done === true,
            }))
        : []
      const schedule: Record<number, string> = {}
      if (d.schedule && typeof d.schedule === 'object') {
        for (const [h, val] of Object.entries(d.schedule as Record<string, unknown>)) {
          if (typeof val === 'string') schedule[Number(h)] = val
        }
      }
      out.days[k] = {
        tasks,
        schedule,
        note: typeof d.note === 'string' ? d.note : '',
      }
    }
  }

  const copyStrings = (src: unknown, dest: Record<string, string>) => {
    if (src && typeof src === 'object') {
      for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
        if (typeof v === 'string') dest[k] = v
      }
    }
  }
  copyStrings(obj.monthNotes, out.monthNotes)
  copyStrings(obj.weekNotes, out.weekNotes)

  return out
}

const PlannerContext = createContext<PlannerApi | null>(null)

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlannerData>(load)

  // Debounced persistence keeps typing smooth.
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // storage full or unavailable; keep working in memory
      }
    }, 250)
    return () => window.clearTimeout(timer.current)
  }, [data])

  const mutateDay = useCallback(
    (k: string, fn: (d: DayEntry) => DayEntry) => {
      setData((prev) => {
        const current = prev.days[k] ?? EMPTY_DAY
        return { ...prev, days: { ...prev.days, [k]: fn(current) } }
      })
    },
    [],
  )

  const api = useMemo<PlannerApi>(
    () => ({
      getDay: (k) => data.days[k] ?? EMPTY_DAY,
      hasContent: (k) => {
        const d = data.days[k]
        if (!d) return false
        return (
          d.tasks.length > 0 ||
          d.note.trim().length > 0 ||
          Object.values(d.schedule).some((v) => v.trim().length > 0)
        )
      },
      taskCounts: (k) => {
        const d = data.days[k]
        if (!d) return { total: 0, done: 0 }
        return {
          total: d.tasks.length,
          done: d.tasks.filter((t) => t.done).length,
        }
      },
      addTask: (k, text) =>
        mutateDay(k, (d) => ({
          ...d,
          tasks: [...d.tasks, { id: uid(), text, done: false }],
        })),
      toggleTask: (k, id) =>
        mutateDay(k, (d) => ({
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          ),
        })),
      editTask: (k, id, text) =>
        mutateDay(k, (d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
        })),
      removeTask: (k, id) =>
        mutateDay(k, (d) => ({
          ...d,
          tasks: d.tasks.filter((t) => t.id !== id),
        })),
      setNote: (k, note) => mutateDay(k, (d) => ({ ...d, note })),
      setSchedule: (k, hour, text) =>
        mutateDay(k, (d) => ({
          ...d,
          schedule: { ...d.schedule, [hour]: text },
        })),
      monthNote: (mk) => data.monthNotes[mk] ?? '',
      setMonthNote: (mk, note) =>
        setData((prev) => ({
          ...prev,
          monthNotes: { ...prev.monthNotes, [mk]: note },
        })),
      weekNote: (wk) => data.weekNotes[wk] ?? '',
      setWeekNote: (wk, note) =>
        setData((prev) => ({
          ...prev,
          weekNotes: { ...prev.weekNotes, [wk]: note },
        })),
      exportData: () => data,
      importData: (raw) => {
        const clean = sanitize(raw)
        if (!clean) return false
        setData(clean)
        return true
      },
    }),
    [data, mutateDay],
  )

  return (
    <PlannerContext.Provider value={api}>{children}</PlannerContext.Provider>
  )
}

export function usePlanner(): PlannerApi {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}
