import { computed, onMounted, ref, shallowRef } from 'vue'
import { fetchBookingData } from '@/api/booking'
import type { BookingResponse, LayoutEvent, Table } from '@/types/booking'
import {
  buildGridMeta,
  collectEventsForDay,
  filterTablesByZones,
  getUniqueZones,
  layoutColumnEvents,
} from '@/utils/events'
import { filterEventsBySearch } from '@/utils/search'
import { buildTimeSlots } from '@/utils/time'
import { SLOT_MINUTES, TIME_ROW_HEIGHT_PX } from '@/utils/constants'

export function useBookingStore() {
  const data = shallowRef<BookingResponse | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const selectedDay = ref<string>('')
  const enabledZones = ref<Set<string>>(new Set())
  const contentHidden = ref(false)
  const searchQuery = ref('')

  async function load() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchBookingData()
      data.value = response
      selectedDay.value = response.current_day
      enabledZones.value = new Set(getUniqueZones(response.tables))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const restaurant = computed(() => data.value?.restaurant ?? null)
  const availableDays = computed(() => data.value?.available_days ?? [])
  const currentDay = computed(() => data.value?.current_day ?? '')

  const visibleTables = computed<Table[]>(() => {
    if (!data.value) return []
    return filterTablesByZones(data.value.tables, enabledZones.value)
  })

  const gridMeta = computed(() => {
    if (!data.value || !selectedDay.value) return null
    return buildGridMeta(data.value, selectedDay.value)
  })

  const timeSlots = computed(() => {
    if (!gridMeta.value) return []
    return buildTimeSlots(gridMeta.value.openMinutes, gridMeta.value.closeMinutes)
  })

  const eventsByTable = computed(() => {
    const map = new Map<string, LayoutEvent[]>()
    if (!data.value || !gridMeta.value) return map

    const all = collectEventsForDay(
      visibleTables.value,
      selectedDay.value,
      gridMeta.value.timeZone,
    )

    const byTable = new Map<string, typeof all>()
    for (const ev of all) {
      const list = byTable.get(ev.tableId) ?? []
      list.push(ev)
      byTable.set(ev.tableId, list)
    }

    for (const [tableId, events] of byTable) {
      const filtered = filterEventsBySearch(events, searchQuery.value)
      map.set(
        tableId,
        layoutColumnEvents(
          filtered,
          gridMeta.value.openMinutes,
          gridMeta.value.timeZone,
        ),
      )
    }

    return map
  })

  const currentTimeTopPx = computed(() => {
    if (!gridMeta.value || !restaurant.value) return null
    const now = new Date()
    const dayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: gridMeta.value.timeZone,
    }).format(now)

    if (dayKey !== selectedDay.value) return null

    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: gridMeta.value.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now)

    const minutes =
      Number(parts.find((p) => p.type === 'hour')?.value) * 60 +
      Number(parts.find((p) => p.type === 'minute')?.value)

    if (minutes < gridMeta.value.openMinutes || minutes > gridMeta.value.closeMinutes) {
      return null
    }

    return ((minutes - gridMeta.value.openMinutes) / SLOT_MINUTES) * TIME_ROW_HEIGHT_PX
  })

  function toggleZone(zone: string) {
    const next = new Set(enabledZones.value)
    if (next.has(zone)) {
      if (next.size > 1) next.delete(zone)
    } else {
      next.add(zone)
    }
    enabledZones.value = next
  }

  function setDay(day: string) {
    selectedDay.value = day
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  const allZones = computed(() =>
    data.value ? getUniqueZones(data.value.tables) : [],
  )

  return {
    data,
    loading,
    error,
    selectedDay,
    enabledZones,
    contentHidden,
    searchQuery,
    restaurant,
    availableDays,
    currentDay,
    visibleTables,
    gridMeta,
    timeSlots,
    eventsByTable,
    currentTimeTopPx,
    allZones,
    toggleZone,
    setDay,
    setSearchQuery,
    reload: load,
  }
}
