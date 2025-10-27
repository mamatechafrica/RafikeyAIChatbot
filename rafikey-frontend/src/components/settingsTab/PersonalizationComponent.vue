<script setup lang="ts">
/* global atob, PushSubscription, ServiceWorkerRegistration */

import { useToggle, useDark } from '@vueuse/core'
import { useNotificationStore, useRafikeyChatbotStore } from '@/stores'
import { onMounted, ref, watch } from 'vue'

const isDark = useDark()
const modeToggleHandler = useToggle(isDark)
const chatbotStore = useRafikeyChatbotStore()
const notificationStore = useNotificationStore()

const selected = ref()

export interface Subscription {
  endpoint: string
  expirationTime: number | null
  keys: {
    auth: string
    p256dh: string
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

//Checks for serviceWorker support and existence of a registered service worker
const subscribeUser = async () => {
  if ('serviceWorker' in navigator) {
    try {
      //   check if service worker is registered
      const registeredSW = await navigator.serviceWorker.getRegistration()
      if (!registeredSW) {
        const newRegistration = await navigator.serviceWorker.register('/custom-sw.js')
        await generateSubscriptionEndpoint(newRegistration)
      } else {
        await generateSubscriptionEndpoint(registeredSW)
      }
    } catch (err) {
      console.error('Error during service worker registration:', err)
      notificationStore.addNotification(
        'Failed to register service worker for notifications',
        'error',
      )
      selected.value = false
    }
  } else {
    notificationStore.addNotification('Service Worker is not supported in this browser', 'error')
    selected.value = false
  }
}

const saveSubscriptionToServer = async (subscription: Subscription) => {
  console.log('Going to the server', subscription)
  chatbotStore
    .savePushNotificationSubscription(subscription)
    .then((response) => {
      if (response?.result === 'ok') {
        notificationStore.addNotification(
          'You have successfully subscribed to notifications',
          'success',
        )
        selected.value = true
      } else {
        notificationStore.addNotification('Failed to subscribe to notifications', 'error')
        selected.value = false
      }
    })
    .catch((err) => {
      console.error('Error saving subscription to server:', err)
      notificationStore.addNotification('Failed to subscribe to notifications', 'error')
      selected.value = false
    })
}

// const sw = ref(null as ServiceWorkerRegistration | null)
// subscribing to push service
const generateSubscriptionEndpoint = async (newRegistration: ServiceWorkerRegistration) => {
  // sw.value = newRegistration
  try {
    const applicationServerKey = import.meta.env.VITE_APP_VAPID_PUBLIC
    // console.log(applicationServerKey)
    const options = await newRegistration.pushManager.subscribe({
      // some browser like chrome do not allow base64 string VAPIDPublic Key
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
      userVisibleOnly: true,
    })
    // const subscription = await newRegistration.pushManager.subscribe(options)
    const subscriptionJson = JSON.stringify(options)
    await saveSubscriptionToServer(JSON.parse(subscriptionJson))
    // console.log('Push Subscription Object:', options.toJSON())
    // await saveSubscriptionToServer(options.toJSON())
  } catch (error) {
    console.error('Error during subscription to push notifications:', error)
    notificationStore.addNotification('Failed to subscribe to notifications', 'error')
    selected.value = false
  }
}
// push notification logic
const askNotificationPermission = () => {
  if ('Notification' in window) {
    window.Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        subscribeUser()
      } else {
        selected.value = false
        notificationStore.addNotification(
          'Please go to the settings and enable notifications',
          'info',
        )
      }
    })
  }
}

// const clear subscription in the database

const clearSubscriptionFromServer = (subscriptionEndpoint: string) => {
  chatbotStore
    .clearSubscription(subscriptionEndpoint)
    .then((res) => {
      if (res?.result === 'ok') {
        notificationStore.addNotification(
          'You have successfully unsubscribed from notifications',
          'success',
        )
        selected.value = false
      } else {
        notificationStore.addNotification('Failed to unsubscribe from notifications', 'error')
      }
    })
    .catch((err) => {
      console.error('Error clearing subscription from server:', err)
      notificationStore.addNotification('Failed to unsubscribe from notifications', 'error')
    })
}

// If a user unsubscribes from push notifications
const unSubscribeNotification = async () => {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    notificationStore.addNotification('No service worker found to unsubscribe', 'error')
    return
  }
  try {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      // console.log('browser subscription', subscription.endpoint)
      clearSubscriptionFromServer(subscription.endpoint)
    } else {
      notificationStore.addNotification('No active subscription found', 'info')
      return
    }
  } catch (error) {
    console.error('Error during unsubscription from push notifications:', error)
    notificationStore.addNotification('Failed to unsubscribe from notifications', 'error')
    return
  }
}

// watch the toggle button to subscribe or unsubscribe a browser
watch(
  () => selected.value,
  (val) => {
    // chatbotStore.isAcceptNotification = val
    // if accepted flow to ask permission and register subscription
    if (val) {
      askNotificationPermission()
    }
    // If declined flow to unsubscribe user from notification
    else {
      unSubscribeNotification()
    }
  },
)

onMounted(async () => {
  const registration = await navigator.serviceWorker.getRegistration()
  console.log(registration)
  if (!registration) {
    return
  } else {
    const subscription = await registration.pushManager.getSubscription()
    chatbotStore.isAcceptNotification = subscription !== null
    selected.value = subscription !== null
    console.log(selected.value)
  }
})
</script>

<template>
  <div class="px-[16px] py-8 space-y-6 flex-col">
    <div class="">
      <div
        class="relative border border-azure-radiance-500 bg-azure-radiance-200 rounded-2xl p-3 w-full font-semibold"
      >
        <div
          class="absolute inset-0 left-0 right-0 border-l-4 rounded-xl border-azure-radiance-500"
        ></div>
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined">info</span>
          <p class="">Chats are saved automatically, but deleted after every 30days</p>
        </div>
      </div>
    </div>
    <div class="flex gap-[20px] justify-between">
      <div>
        <span class="dark:text-white">Notifications</span>
      </div>
      <div class="">
        <div class="relative">
          <div class="flex gap-2 ">
            <span class="dark:text-white">Off</span>
            <span class="dark:text-white">On</span>
          </div>
          <input
            v-model="selected"
            :value="selected"
            type="checkbox"
            class="toggle toggle-lg bg-casablanca-300"
            :checked="selected"
          />
        </div>
      </div>
    </div>
  </div>
  <div class="border-b-[1px] border-veryLightFour dark:border-veryLightFive"></div>
</template>

<style scoped></style>
