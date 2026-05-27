<script setup lang="ts">
import { Search } from '@lucide/vue'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)

function onSearchInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onGlobalKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInputRef.value?.focus()
    searchInputRef.value?.select()
    return
  }

  if (
    event.key === 'Escape' &&
    document.activeElement === searchInputRef.value
  ) {
    emit('update:modelValue', '')
    searchInputRef.value?.blur()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeyDown)
})
</script>

<template>
  <label class="booking-search" role="search">
    <Search class="booking-search__icon" :size="18" aria-hidden="true" />
    <input
      ref="searchInputRef"
      type="search"
      class="booking-search__input"
      :value="props.modelValue"
      :placeholder="placeholder ?? '⌘+K поиск по имени'"
      autocomplete="off"
      spellcheck="false"
      aria-label="Поиск по имени"
      @input="onSearchInput"
    />
  </label>
</template>
