<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import BookingFilters from '@/components/BookingFilters.vue'
import BookingGrid from '@/components/BookingGrid.vue'
import TopNav from '@/components/TopNav.vue'
import { useBookingStore } from '@/composables/useBookingStore'
import { useGridSelection } from '@/composables/useGridSelection'
import { useTheme } from '@/composables/useTheme'

const store = useBookingStore()
const { isDark, toggle: toggleTheme } = useTheme()
const appContentRef = ref<HTMLElement | null>(null)
const scrolledX = ref(false)

function updateScrolledX() {
  const el = appContentRef.value
  scrolledX.value = el != null && el.scrollLeft > 0
}

watch(
  appContentRef,
  (el, _, onCleanup) => {
    if (!el) return
    updateScrolledX()
    el.addEventListener('scroll', updateScrolledX, { passive: true })
    onCleanup(() => el.removeEventListener('scroll', updateScrolledX))
  },
  { flush: 'post' },
)

onUnmounted(() => {
  appContentRef.value?.removeEventListener('scroll', updateScrolledX)
})

const selection = useGridSelection(
  () => store.gridMeta.value?.openMinutes ?? 0,
  () => store.gridMeta.value?.closeMinutes ?? 0,
  () => store.selectedDay.value,
  () => store.gridMeta.value?.timeZone ?? 'UTC',
)

watch(
  () => store.selectedDay.value,
  () => selection.clearSelection(),
)

function onTableClick(tableId: string) {
  selection.toggleTable(tableId)
}

function onGridPointerDown(payload: { clientY: number; gridTop: number }) {
  if (selection.selectedTableIds.value.size === 0) return
  selection.startSelection(payload.clientY, payload.gridTop)
}

function onGridPointerMove(payload: { clientY: number; gridTop: number }) {
  if (selection.isDragging.value) {
    selection.updateSelection(payload.clientY, payload.gridTop)
  }
}

const gridReady = computed(
  () => store.gridMeta.value && !store.loading.value && !store.error.value,
)
</script>

<template>
  <div class="app">
    <TopNav
      v-if="store.restaurant.value"
      :restaurant-name="store.restaurant.value.restaurant_name"
      :is-dark="isDark"
      :search-query="store.searchQuery.value"
      @update:search-query="store.setSearchQuery"
      @toggle-theme="toggleTheme"
    />

    <div
      ref="appContentRef"
      class="app__content scrollbar-themed"
      :class="{ 'app__content--scrolled-x': scrolledX }"
    >
      <h1 class="page-title">Бронирования</h1>

      <BookingFilters
        v-if="store.restaurant.value"
        :available-days="store.availableDays.value"
        :selected-day="store.selectedDay.value"
        :current-day="store.currentDay.value"
        :zones="store.allZones.value"
        :enabled-zones="store.enabledZones.value"
        @set-day="store.setDay"
        @toggle-zone="store.toggleZone"
      />

      <main class="app-main">
        <div v-if="store.loading.value" class="state-message">Загрузка…</div>
        <div v-else-if="store.error.value" class="state-message state-message--error">
          {{ store.error.value }}
          <button type="button" class="retry-btn" @click="store.reload">Повторить</button>
        </div>

        <BookingGrid
          v-else-if="gridReady && store.gridMeta.value"
          :tables="store.visibleTables.value"
          :time-slots="store.timeSlots.value"
          :events-by-table="store.eventsByTable.value"
          :grid-height="store.gridMeta.value.gridHeight"
          :current-time-top-px="store.currentTimeTopPx.value"
          :time-zone="store.gridMeta.value.timeZone"
          :content-hidden="store.contentHidden.value"
          :is-slot-selected="selection.isSlotSelected"
          :is-table-selected="selection.isTableSelected"
          @table-click="onTableClick"
          @grid-pointer-down="onGridPointerDown"
          @grid-pointer-move="onGridPointerMove"
          @grid-pointer-up="selection.endSelection"
        />
      </main>
    </div>
  </div>
</template>
