import { computed, ref } from 'vue'
import { SLOT_MINUTES, TIME_ROW_HEIGHT_PX } from '@/utils/constants'
import { formatMinutesAsTime, minutesToMsFromDayStart } from '@/utils/time'

export interface SelectionRange {
  startMinutes: number
  endMinutes: number
}

export function useGridSelection(
  openMinutes: () => number,
  closeMinutes: () => number,
  day: () => string,
  timeZone: () => string,
) {
  const selectedTableIds = ref<Set<string>>(new Set())
  const selection = ref<SelectionRange | null>(null)
  const isDragging = ref(false)
  const dragAnchorMinutes = ref<number | null>(null)

  const hasSelection = computed(
    () => selectedTableIds.value.size > 0 && selection.value !== null,
  )

  function snapMinutes(raw: number): number {
    const open = openMinutes()
    const close = closeMinutes()
    const snapped =
      Math.round((raw - open) / SLOT_MINUTES) * SLOT_MINUTES + open
    return Math.min(Math.max(snapped, open), close - SLOT_MINUTES)
  }

  function minutesFromPointer(clientY: number, gridTop: number): number {
    const y = clientY - gridTop
    const slotIndex = Math.floor(y / TIME_ROW_HEIGHT_PX)
    return openMinutes() + slotIndex * SLOT_MINUTES
  }

  function toggleTable(tableId: string) {
    const next = new Set(selectedTableIds.value)
    if (next.has(tableId)) next.delete(tableId)
    else next.add(tableId)
    selectedTableIds.value = next
  }

  function startSelection(clientY: number, gridTop: number) {
    const minutes = snapMinutes(minutesFromPointer(clientY, gridTop))
    dragAnchorMinutes.value = minutes
    isDragging.value = true
    selection.value = { startMinutes: minutes, endMinutes: minutes + SLOT_MINUTES }
  }

  function updateSelection(clientY: number, gridTop: number) {
    if (!isDragging.value || dragAnchorMinutes.value === null) return
    const current = snapMinutes(minutesFromPointer(clientY, gridTop))
    const anchor = dragAnchorMinutes.value
    const start = Math.min(anchor, current)
    const end = Math.max(anchor, current) + SLOT_MINUTES
    selection.value = { startMinutes: start, endMinutes: end }
  }

  function endSelection() {
    isDragging.value = false
    dragAnchorMinutes.value = null
  }

  function clearSelection() {
    selectedTableIds.value = new Set()
    selection.value = null
    isDragging.value = false
    dragAnchorMinutes.value = null
  }

  function createBooking() {
    if (!selection.value || selectedTableIds.value.size === 0) return

    const d = day()
    const tz = timeZone()
    const startMs = minutesToMsFromDayStart(d, selection.value.startMinutes, tz)
    const endMs = minutesToMsFromDayStart(d, selection.value.endMinutes, tz)

    console.log({
      tableIds: [...selectedTableIds.value],
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      startLabel: formatMinutesAsTime(selection.value.startMinutes),
      endLabel: formatMinutesAsTime(selection.value.endMinutes),
    })
  }

  function isSlotSelected(tableId: string, slotMinutes: number): boolean {
    if (!selectedTableIds.value.has(tableId) || !selection.value) return false
    return (
      slotMinutes >= selection.value.startMinutes &&
      slotMinutes < selection.value.endMinutes
    )
  }

  function isTableSelected(tableId: string): boolean {
    return selectedTableIds.value.has(tableId)
  }

  return {
    selectedTableIds,
    selection,
    isDragging,
    hasSelection,
    toggleTable,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    createBooking,
    isSlotSelected,
    isTableSelected,
  }
}
