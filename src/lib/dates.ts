// Lightweight, dependency-free date helpers.
// All persistence keys use a local YYYY-MM-DD string so days never drift
// across timezones the way ISO/UTC strings can.

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function key(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return key(a) === key(b)
}

export function isToday(d: Date): boolean {
  return isSameDay(d, today())
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

export function addMonths(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(1)
  next.setMonth(next.getMonth() + n)
  return next
}

/** Sunday-first start of the week containing d. */
export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay())
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/** The 7 dates of the week containing d, Sunday-first. */
export function weekDates(d: Date): Date[] {
  const start = startOfWeek(d)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** A 6-row calendar grid (42 cells) covering the month containing d. */
export function monthGrid(d: Date): Date[] {
  const start = startOfWeek(startOfMonth(d))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** ISO 8601 week number. */
export function weekNumber(d: Date): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - dayNum + 3)
  const firstThursday = new Date(date.getFullYear(), 0, 4)
  const diff = date.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatLong(d: Date): string {
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${ordinal(
    d.getDate(),
  )}`
}

export function formatRange(a: Date, b: Date): string {
  if (a.getMonth() === b.getMonth()) {
    return `${MONTHS[a.getMonth()]} ${a.getDate()}–${b.getDate()}, ${a.getFullYear()}`
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${MONTHS[a.getMonth()]} ${a.getDate()} – ${MONTHS[b.getMonth()]} ${b.getDate()}, ${a.getFullYear()}`
  }
  return `${MONTHS[a.getMonth()]} ${a.getDate()}, ${a.getFullYear()} – ${MONTHS[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`
}
