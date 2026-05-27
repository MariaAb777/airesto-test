<script setup lang="ts">
import { formatDateChipPrimary, formatDateChipSecondary } from '@/utils/dateLabels'

defineProps<{
  availableDays: string[]
  selectedDay: string
  currentDay: string
  zones: string[]
  enabledZones: Set<string>
}>()

const emit = defineEmits<{
  setDay: [day: string]
  toggleZone: [zone: string]
}>()
</script>

<template>
  <section class="booking-filters">
    <div class="booking-filters__group">
      <span class="booking-filters__label">Дата</span>
      <div class="booking-filters__dates">
        <button
          v-for="day in availableDays"
          :key="day"
          type="button"
          class="date-card"
          :class="{ 'date-card--active': day === selectedDay }"
          @click="emit('setDay', day)"
        >
          <span class="date-card__primary">{{ formatDateChipPrimary(day) }}</span>
          <span class="date-card__secondary">
            {{ formatDateChipSecondary(day, currentDay) }}
          </span>
        </button>
      </div>
    </div>

    <div class="booking-filters__group">
      <span class="booking-filters__label">Отображаемые зоны</span>
      <div class="booking-filters__zones">
        <button
          v-for="zone in zones"
          :key="zone"
          type="button"
          class="zone-chip"
          :class="{ 'zone-chip--active': enabledZones.has(zone) }"
          @click="emit('toggleZone', zone)"
        >
          {{ zone }}
        </button>
      </div>
    </div>
  </section>
</template>
