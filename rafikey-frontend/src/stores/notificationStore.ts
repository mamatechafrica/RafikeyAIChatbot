import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidV4 } from 'uuid'

export interface NotificationItem {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  id?: string
  duration?: number
  isShown?: boolean
}

export const useNotificationStore = defineStore('notificationsStore', () => {
  const toastAlertIsOpen = ref<boolean>(false)
  const notificationQueue = ref<NotificationItem[]>([])
  const activeNotifications = ref<NotificationItem[]>([])

  const getNotifications = computed(() => activeNotifications.value)
  const getNotificationsStackLength = computed(() => notificationQueue.value.length)
  const getToastAlertIsOpen = computed(() => toastAlertIsOpen.value)
  const hasNotifications = computed(() => activeNotifications.value.length > 0)

  function setToastAlertIsOpen(value: boolean) {
    toastAlertIsOpen.value = value
  }

  function addNotification(message: string, type: NotificationItem['type']) {
    const id = uuidV4()
    notificationQueue.value.push({
      message,
      type,
      id,
      duration: 5000,
      isShown: false,
    })
    // console.log('Here in notifications')

    processNotificationQueue()
  }

  function removeNotification(id: string) {
    const index = activeNotifications.value.findIndex((notification) => notification.id === id)

    if (index > -1) {
      // set the notification to be hidden
      activeNotifications.value[index].isShown = false

      // remove the notification from the active notifications
      setTimeout(() => {
        activeNotifications.value.splice(index, 1)
      }, 400)
      // activeNotifications.value.splice(index, 1);
    }
  }

  function processNotificationQueue() {
    if (notificationQueue.value.length > 0 && activeNotifications.value.length < 3) {
      // get the first notification
      const notification = notificationQueue.value.shift() as NotificationItem
      // set the notification to be shown
      notification.isShown = true
      // remove the first notification from the queue
      activeNotifications.value.push(notification)

      // set the toast alert to open
      setTimeout(() => {
        // set the toast alert to open
        // setToastAlertIsOpen(true);
        // remove the notification after the duration
        removeNotification(notification.id as string)
        // set the toast alert to close
        // setToastAlertIsOpen(false);
        // process the next notification
        processNotificationQueue()
      }, notification.duration)
    }
  }

  return {
    toastAlertIsOpen,
    notificationQueue,
    activeNotifications,
    getNotifications,
    getNotificationsStackLength,
    hasNotifications,
    setToastAlertIsOpen,
    getToastAlertIsOpen,
    addNotification,
    removeNotification,
  }
})
