import type { TimelineEvent } from '@/types/booking'
import { getEventTypeLabel, getOrderStatusLabel } from './eventStyles'

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '')
}

export function eventMatchesSearch(event: TimelineEvent, query: string): boolean {
  const q = query.trim()
  if (!q) return true

  const qNorm = normalizeSearchText(q)
  const parts: string[] = [event.label]

  if (event.sublabel) parts.push(event.sublabel)
  if (event.phone) parts.push(event.phone)

  if (event.kind === 'order') {
    const statusLabel = getOrderStatusLabel(event.status)
    if (statusLabel) parts.push(statusLabel)
    const typeLabel = getEventTypeLabel(event.kind, event.status)
    if (typeLabel) parts.push(typeLabel)
  } else {
    parts.push(String(event.status))
    const typeLabel = getEventTypeLabel(event.kind, event.status)
    if (typeLabel) parts.push(typeLabel)
  }

  const haystack = parts.filter(Boolean).join(' ')
  const haystackNorm = normalizeSearchText(haystack)

  return (
    haystack.toLowerCase().includes(q.toLowerCase()) ||
    haystackNorm.includes(qNorm)
  )
}

export function filterEventsBySearch<T extends TimelineEvent>(
  events: T[],
  query: string,
): T[] {
  const q = query.trim()
  if (!q) return events
  return events.filter((ev) => eventMatchesSearch(ev, q))
}
