import type {
  BookingResponse,
  LayoutEvent,
  Table,
  TimelineEvent,
} from '@/types/booking'
import {
  MIN_EVENT_HEIGHT_PX,
  OVERLAP_PEEK_PX,
  SLOT_MINUTES,
  TABLE_COL_INNER_PX,
  TIME_ROW_HEIGHT_PX,
} from './constants'
import { getDayKeyInTimezone, getMinutesInTimezone, parseTimeToMinutes } from './time'

export function collectEventsForDay(
  tables: Table[],
  day: string,
  timeZone: string,
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const table of tables) {
    for (const order of table.orders) {
      if (getDayKeyInTimezone(order.start_time, timeZone) !== day) continue
      events.push({
        id: `order-${order.id}`,
        kind: 'order',
        status: order.status,
        startMs: new Date(order.start_time).getTime(),
        endMs: new Date(order.end_time).getTime(),
        tableId: table.id,
        label: order.status,
        rawStart: order.start_time,
        rawEnd: order.end_time,
      })
    }

    for (const res of table.reservations) {
      if (getDayKeyInTimezone(res.seating_time, timeZone) !== day) continue
      events.push({
        id: `res-${res.id}`,
        kind: 'reservation',
        status: res.status,
        startMs: new Date(res.seating_time).getTime(),
        endMs: new Date(res.end_time).getTime(),
        tableId: table.id,
        label: res.name_for_reservation,
        sublabel: `${res.num_people} чел`,
        phone: res.phone_number,
        numPeople: res.num_people,
        rawStart: res.seating_time,
        rawEnd: res.end_time,
      })
    }
  }

  return events.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs)
}

function overlaps(a: TimelineEvent, b: TimelineEvent): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs
}

function overlapsAny(ev: TimelineEvent, others: TimelineEvent[]): boolean {
  return others.some((o) => overlaps(o, ev))
}

function maxConcurrentCount(events: TimelineEvent[]): number {
  if (events.length === 0) return 0

  const times = new Set<number>()
  for (const e of events) {
    times.add(e.startMs)
    times.add(e.endMs)
  }

  let max = 0
  for (const t of times) {
    const n = events.filter((e) => e.startMs <= t && t < e.endMs).length
    max = Math.max(max, n)
  }
  return max
}

function placeInLane(lanes: TimelineEvent[][], ev: TimelineEvent): number {
  for (let i = 0; i < lanes.length; i++) {
    if (!lanes[i].some((existing) => overlaps(existing, ev))) {
      lanes[i].push(ev)
      return i
    }
  }
  lanes.push([ev])
  return lanes.length - 1
}

export function layoutColumnEvents(
  events: TimelineEvent[],
  gridStartMinutes: number,
  timeZone: string,
): LayoutEvent[] {
  if (events.length === 0) return []

  const sorted = [...events].sort(
    (a, b) => a.startMs - b.startMs || a.endMs - b.endMs,
  )

  const laidOut: LayoutEvent[] = []
  let cluster: TimelineEvent[] = []
  let lanes: TimelineEvent[][] = []

  const flushCluster = () => {
    if (cluster.length === 0) return

    const overlapTotal = maxConcurrentCount(cluster)

    for (let lane = 0; lane < lanes.length; lane++) {
      for (const ev of lanes[lane]) {
        const startMin = getMinutesInTimezone(ev.rawStart, timeZone)
        const endMin = getMinutesInTimezone(ev.rawEnd, timeZone)
        const topMinutes = startMin - gridStartMinutes
        const durationMinutes = Math.max(endMin - startMin, SLOT_MINUTES / 2)
        const topPx = (topMinutes / SLOT_MINUTES) * TIME_ROW_HEIGHT_PX
        const heightPx = Math.max(
          (durationMinutes / SLOT_MINUTES) * TIME_ROW_HEIGHT_PX - 2,
          MIN_EVENT_HEIGHT_PX,
        )

        const peek = overlapTotal > 1 ? lane * OVERLAP_PEEK_PX : 0
        const insetLeft = 2 + peek
        const insetWidth = TABLE_COL_INNER_PX - peek

        laidOut.push({
          ...ev,
          overlapLayer: lane,
          overlapTotal,
          top: topPx,
          height: heightPx,
          insetLeft,
          insetWidth,
        })
      }
    }

    cluster = []
    lanes = []
  }

  for (const ev of sorted) {
    if (cluster.length > 0 && !overlapsAny(ev, cluster)) {
      flushCluster()
    }

    placeInLane(lanes, ev)
    cluster.push(ev)
  }

  flushCluster()
  return laidOut
}

export function getUniqueZones(tables: Table[]): string[] {
  return [...new Set(tables.map((t) => t.zone))]
}

export function filterTablesByZones(tables: Table[], zones: Set<string>): Table[] {
  return tables.filter((t) => zones.has(t.zone))
}

export function buildGridMeta(data: BookingResponse, day: string) {
  const { restaurant } = data
  const openMinutes = parseTimeToMinutes(restaurant.opening_time)
  const closeMinutes = parseTimeToMinutes(restaurant.closing_time)
  const slotCount = Math.ceil((closeMinutes - openMinutes) / SLOT_MINUTES)
  const gridHeight = slotCount * TIME_ROW_HEIGHT_PX

  return {
    openMinutes,
    closeMinutes,
    slotCount,
    gridHeight,
    timeZone: restaurant.timezone,
    day,
  }
}
