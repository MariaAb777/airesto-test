import { SLOT_MINUTES } from './constants'

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getDayKeyInTimezone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

export function getMinutesInTimezone(iso: string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export function dayStartMs(day: string, timeZone: string): number {
  const probe = new Date(`${day}T12:00:00`)
  const offsetParts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(probe)
  const tzName = offsetParts.find((p) => p.type === 'timeZoneName')?.value ?? '+00:00'
  const normalized = tzName.replace('GMT', '').replace('UTC', '')
  const offset =
    normalized === '' ? '+00:00' : normalized.includes(':') ? normalized : `${normalized}:00`
  return new Date(`${day}T00:00:00${offset}`).getTime()
}

export function minutesToMsFromDayStart(day: string, minutes: number, timeZone: string): number {
  return dayStartMs(day, timeZone) + minutes * 60_000
}

export function msToMinutesFromDayStart(ms: number, day: string, timeZone: string): number {
  return Math.round((ms - dayStartMs(day, timeZone)) / 60_000)
}

export function buildTimeSlots(openMinutes: number, closeMinutes: number): number[] {
  const slots: number[] = []
  for (let m = openMinutes; m < closeMinutes; m += SLOT_MINUTES) {
    slots.push(m)
  }
  return slots
}

export function formatDisplayDate(day: string, locale = 'ru-RU'): string {
  const [y, mo, d] = day.split('-').map(Number)
  const date = new Date(y, mo - 1, d)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatClockTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}
