<script setup lang="ts">
import { LogOut } from '@lucide/vue'
import BookingSearch from './BookingSearch.vue'
import ThemeToggle from './ThemeToggle.vue'
import TopNavBrand from './TopNavBrand.vue'

defineProps<{
  restaurantName: string
  isDark: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  toggleTheme: []
  'update:searchQuery': [value: string]
}>()
</script>

<template>
  <header class="top-nav">
    <TopNavBrand :restaurant-name="restaurantName" />

    <div class="top-nav__tools">
      <BookingSearch
        :model-value="searchQuery"
        @update:model-value="emit('update:searchQuery', $event)"
      />

      <ThemeToggle :is-dark="isDark" @toggle="emit('toggleTheme')" />

      <button type="button" class="top-nav__logout">
        <LogOut :size="18" aria-hidden="true" />
        <span>Выйти</span>
      </button>
    </div>
  </header>
</template>
