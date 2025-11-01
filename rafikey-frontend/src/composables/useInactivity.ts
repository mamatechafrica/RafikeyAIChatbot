import { ref, watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores'

export const useInactivity = () => {
  const activityContainer = ref<number[]>([])
  const count = ref(0)
  const isActive = ref(true)
  const authStore = useAuthStore()

  const activities = ['mousemove', 'click', 'touchstart', 'scroll', 'keydown'] as const
  let listening = false
  let intervalId: ReturnType<typeof setInterval> | null = null

  const handler = () => {
    activityContainer.value.push(1)
  }

  const startTracking = () => {
    if (!listening) {
      activities.forEach((ev) => window.addEventListener(ev, handler))
      listening = true
    }

    if (intervalId === null) {
      // run every 60 seconds
      intervalId = window.setInterval(() => {
        // ensure listeners are attached each tick (optional)
        if (!listening) {
          activities.forEach((ev) => window.addEventListener(ev, handler))
          listening = true
        }
        count.value += 1
      }, 60_000)
    }
  }

  const stopTracking = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    if (listening) {
      activities.forEach((ev) => window.removeEventListener(ev, handler))
      listening = false
    }
  }

  watch(count, (newValue) => {
    if (newValue === 3) {
      isActive.value = activityContainer.value.includes(1)
      activityContainer.value = []
      count.value = 0
      // stopTracking()
    }
  })

  // watch the token properly with a getter
  watch(
    () => authStore.token,
    (newValue) => {
      if (newValue) {
        stopTracking()
      }
    },
  )

  onBeforeUnmount(() => {
    stopTracking()
  })

  return {
    isActive,
    startTracking,
    stopTracking,
  }
}
