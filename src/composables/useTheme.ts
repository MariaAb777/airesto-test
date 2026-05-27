import { onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'airesto-theme'

export function useTheme() {
  const isDark = ref(true)

  function applyTheme(dark: boolean) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    isDark.value = saved !== 'light'
    applyTheme(isDark.value)
  })

  watch(isDark, applyTheme)

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
