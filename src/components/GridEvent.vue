<script setup lang="ts">
import { Phone } from '@lucide/vue'
import { computed, ref } from 'vue'
import type { LayoutEvent } from '@/types/booking'
import {
  formatGuestsLine,
  formatPhoneShort,
  getEventStyle,
  getEventTypeLabel,
  getOrderStatusLabel,
  getStatusBadge,
} from '@/utils/eventStyles'
import { getEventVisibility } from '@/utils/eventVisibility'
import { formatMinutesAsTime, getMinutesInTimezone } from '@/utils/time'

const props = defineProps<{
  event: LayoutEvent
  timeZone: string
  contentHidden: boolean
}>()

const hovered = ref(false)

const style = computed(() => getEventStyle(props.event.kind, props.event.status))
const isOverlapped = computed(() => props.event.overlapTotal > 1)
const visibility = computed(() =>
  getEventVisibility(props.event.height, props.event.kind),
)

const typeLabel = computed(() => getEventTypeLabel(props.event.kind, props.event.status))
const orderStatus = computed(() =>
  props.event.kind === 'order' ? getOrderStatusLabel(props.event.status) : null,
)
const badge = computed(() => getStatusBadge(props.event.kind, props.event.status))
const phoneShort = computed(() => formatPhoneShort(props.event.phone))

const guestLine = computed(() => {
  if (props.event.kind !== 'reservation') return ''
  return formatGuestsLine(props.event.label, props.event.numPeople)
})

const statusLine = computed(() => {
  if (props.event.kind === 'order') return orderStatus.value
  return badge.value?.text ?? null
})

const timeRange = computed(() => {
  const start = getMinutesInTimezone(props.event.rawStart, props.timeZone)
  const end = getMinutesInTimezone(props.event.rawEnd, props.timeZone)
  return `${formatMinutesAsTime(start)}-${formatMinutesAsTime(end)}`
})

const zIndex = computed(() => {
  if (hovered.value) return 40
  return 2 + props.event.overlapLayer
})

const eventStyle = computed(() => ({
  top: `${props.event.top}px`,
  height: `${props.event.height}px`,
  left: `${props.event.insetLeft}px`,
  width: `${props.event.insetWidth}px`,
  zIndex: zIndex.value,
  background: hovered.value ? style.value.hoverBg : style.value.bg,
  color: style.value.text,
  borderLeftColor: style.value.accent,
}))
</script>

<template>
  <div
    class="grid-event"
    :class="[
      `grid-event--${event.kind}`,
      {
        'grid-event--hover': hovered,
        'grid-event--overlap': isOverlapped,
        'grid-event--overlap-behind': isOverlapped && event.overlapLayer > 0 && !hovered,
        'grid-event--compact': contentHidden,
      },
    ]"
    :style="eventStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template v-if="!contentHidden">
      <template v-if="event.kind === 'order'">
        <div v-if="visibility.showHead && typeLabel" class="grid-event__head">
          <span class="grid-event__type">{{ typeLabel }}</span>
        </div>

        <div
          v-if="(visibility.showStatus && statusLine) || visibility.showTime"
          class="grid-event__middle"
        >
          <span
            v-if="visibility.showStatus && statusLine"
            class="grid-event__status-pill"
            :class="{ 'grid-event__line--truncate': visibility.truncateStatus }"
          >
            {{ statusLine }}
          </span>
          <span v-if="visibility.showTime" class="grid-event__time">{{ timeRange }}</span>
        </div>
      </template>

      <template v-else>
        <div v-if="visibility.showHead && guestLine" class="grid-event__head">
          <span class="grid-event__guest grid-event__guest--primary">{{ guestLine }}</span>
        </div>

        <div
          v-if="
            (visibility.showStatus && statusLine) ||
            (visibility.showPhone && phoneShort) ||
            visibility.showTime
          "
          class="grid-event__middle"
        >
          <span
            v-if="visibility.showStatus && statusLine"
            class="grid-event__status-line"
            :class="{ 'grid-event__line--truncate': visibility.truncateStatus }"
          >
            {{ statusLine }}
          </span>
          <span
            v-if="visibility.showPhone && phoneShort"
            class="grid-event__phone"
            :class="{ 'grid-event__line--truncate': visibility.truncatePhone }"
          >
            <Phone class="grid-event__phone-icon" :size="12" aria-hidden="true" />
            {{ phoneShort }}
          </span>
          <span v-if="visibility.showTime" class="grid-event__time">{{ timeRange }}</span>
        </div>
      </template>
    </template>
  </div>
</template>
