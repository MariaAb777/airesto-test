<script setup lang="ts">
defineProps<{
  restaurantName: string
}>()
</script>

<template>
  <div class="top-nav-brand">
    <span class="top-nav-brand__logo">AIRESTO</span>
    <span class="top-nav-brand__divider" aria-hidden="true">|</span>
    <span class="top-nav-brand__restaurant">{{ restaurantName }}</span>
  </div>
</template>
