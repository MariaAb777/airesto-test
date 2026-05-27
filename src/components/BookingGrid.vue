<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { LayoutEvent, Table } from '@/types/booking'
import GridEvent from './GridEvent.vue'
import {
  SLOT_MINUTES,
  TABLE_COL_WIDTH_PX,
  TABLE_HEADER_HEIGHT_PX,
  TIME_COL_WIDTH_PX,
  TIME_ROW_HEIGHT_PX,
} from '@/utils/constants'
import { formatMinutesAsTime } from '@/utils/time'

const props = defineProps<{
  tables: Table[]
  timeSlots: number[]
  eventsByTable: Map<string, LayoutEvent[]>
  gridHeight: number
  currentTimeTopPx: number | null
  timeZone: string
  contentHidden: boolean
  isSlotSelected: (tableId: string, slotMinutes: number) => boolean
  isTableSelected: (tableId: string) => boolean
}>()

const emit = defineEmits<{
  tableClick: [tableId: string]
  gridPointerDown: [payload: { clientY: number; gridTop: number }]
  gridPointerMove: [payload: { clientY: number; gridTop: number }]
  gridPointerUp: []
}>()

const gridBodyRef = shallowRef<HTMLElement | null>(null)

const gridWidth = computed(() => props.tables.length * TABLE_COL_WIDTH_PX)

function getGridTop(): number {
  const el = gridBodyRef.value
  if (!el) return 0
  return el.getBoundingClientRect().top
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const target = e.target as HTMLElement
  if (target.closest('.grid-event')) return
  emit('gridPointerDown', { clientY: e.clientY, gridTop: getGridTop() })
}

function onPointerMove(e: PointerEvent) {
  emit('gridPointerMove', { clientY: e.clientY, gridTop: getGridTop() })
}

function onPointerUp() {
  emit('gridPointerUp')
}
</script>

<template>
  <div
    class="booking-grid"
    :style="{
      '--time-col-width': `${TIME_COL_WIDTH_PX}px`,
      '--table-header-height': `${TABLE_HEADER_HEIGHT_PX}px`,
      '--time-row-height': `${TIME_ROW_HEIGHT_PX}px`,
      '--table-col-width': `${TABLE_COL_WIDTH_PX}px`,
      '--grid-height': `${gridHeight}px`,
      '--grid-width': `${gridWidth}px`,
    }"
  >
    <div class="booking-grid__corner" />

    <div class="booking-grid__table-headers">
      <button
        v-for="table in tables"
        :key="table.id"
        type="button"
        class="booking-grid__table-head"
        :class="{ 'booking-grid__table-head--selected': isTableSelected(table.id) }"
        @click="emit('tableClick', table.id)"
      >
        <div class="booking-grid__table-title">
          <span class="booking-grid__table-num">
            <span class="booking-grid__table-prefix">#</span>{{ table.number }}
          </span>
          <span class="booking-grid__table-meta">{{ table.capacity }} чел</span>
        </div>
        <span class="booking-grid__table-zone">{{ table.zone }}</span>
      </button>
    </div>

    <div class="booking-grid__time-col">
      <div
        v-for="slot in timeSlots"
        :key="slot"
        class="booking-grid__time-cell"
      >
        {{ formatMinutesAsTime(slot) }}
      </div>
    </div>

    <div
      ref="gridBodyRef"
      class="booking-grid__body"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        v-for="slot in timeSlots"
        :key="`h-${slot}`"
        class="booking-grid__row-line"
        :class="{ 'booking-grid__row-line--hour': slot % 60 === 0 }"
        :style="{ top: `${((slot - timeSlots[0]) / SLOT_MINUTES) * TIME_ROW_HEIGHT_PX}px` }"
      />

      <div
        v-if="currentTimeTopPx !== null"
        class="booking-grid__now-line"
        :style="{ top: `${currentTimeTopPx}px` }"
      />

      <div
        v-for="table in tables"
        :key="table.id"
        class="booking-grid__table-col"
      >
        <div
          v-for="slot in timeSlots"
          :key="`${table.id}-${slot}`"
          class="booking-grid__cell"
          :class="{
            'booking-grid__cell--selected': isSlotSelected(table.id, slot),
          }"
          :style="{ top: `${((slot - timeSlots[0]) / SLOT_MINUTES) * TIME_ROW_HEIGHT_PX}px` }"
        />

        <GridEvent
          v-for="ev in eventsByTable.get(table.id) ?? []"
          :key="ev.id"
          :event="ev"
          :time-zone="timeZone"
          :content-hidden="contentHidden"
        />
      </div>
    </div>
  </div>
</template>
