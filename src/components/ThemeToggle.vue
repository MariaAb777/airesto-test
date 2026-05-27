<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
    @click="emit('toggle')"
  >
    <Sun v-if="isDark" :size="20" aria-hidden="true" />
    <Moon v-else :size="20" aria-hidden="true" />
  </button>
</template>
