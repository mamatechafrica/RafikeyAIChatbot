<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useNotificationStore } from '@/stores'
import ToastContainer from '@/components/toasts/ToastContainer.vue'
import ToastAlert from '@/components/toasts/ToastAlert.vue'
import { usePWA } from '@/composables/usePWA.ts'
import DialogModal from '@/components/DialogModal.vue'

const notificationStore = useNotificationStore()
const { needRefresh, offlineReady, updateSW } = usePWA()
const isShowDialog = ref(false)

navigator.serviceWorker.getRegistrations().then( console.log)

watch(offlineReady, (ready) => {
  if (ready) {
    console.log('Offline is ready')
    notificationStore.addNotification('App ready to work offline', 'info')
  }
})

watch(needRefresh, (value) => {
  if (value) {
    isShowDialog.value = true
  }
})

const dontUpdateAppHandler = () => {
  console.log("Don't update handler called")
  needRefresh.value = false
  updateSW(false)
  isShowDialog.value = false
  notificationStore.addNotification('You are using older version of Rafikey, which could be bra', 'info')
}

const isLoadingUpdates = ref(false)

const updateAppHandler = () => {
  updateSW(true)
  isLoadingUpdates.value = true
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })

  setTimeout(() => {
    isShowDialog.value = false
    notificationStore.addNotification('App updated successfully', 'success')

  }, 2000)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'light')
})
</script>

<template>
  <RouterView #default="{ Component, route }">
    <template v-if="Component">
      <component :is="Component" :key="route.fullPath" />
    </template>
  </RouterView>

  <teleport to="body">
    <ToastContainer v-if="notificationStore.hasNotifications">
      <template v-for="notification in notificationStore.getNotifications" :key="notification.id">
        <ToastAlert
          v-if="notification.id && notification.isShown"
          :id="notification.id"
          :is-shown="notification.isShown"
          :message="notification.message"
          :type="notification.type"
        />
      </template>
    </ToastContainer>
    <DialogModal :is-open="isShowDialog" @close="isShowDialog = false">
      <template #title>
        <div class="flex flex-col items-center justify-center">
          <p class="dark:text-white font-bold md:text-extra-large text-large">Rafikey Updates</p>
          <img alt="rafikey-update-image" src="@/assets/images/rafikey-updates.svg" class="w-10" />
        </div>
      </template>
      <template #body>
        <div class="flex flex-col text-center items-center">
          <p class="dark:text-white">
            It seems you're using an older app version. Update for the newest features and
            experience.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full">
          <div class="w-3/4 mx-auto flex gap-4">
            <button
              class="rounded-lg w-1/2 btn shadow-none border-none bg-button-light offset-none outline-none"
              @click="dontUpdateAppHandler"
            >
              Cancel
            </button>
            <button
              class="rounded-lg w-1/2 btn bg-transparent shadow-none border-[1px] border-button-light"
              @click="updateAppHandler"
            >
              <span v-if="!isLoadingUpdates" class="text-button-light"> Refresh</span>
              <span v-else class="loading loading-spinner loading-sm text-button-light"></span>
            </button>
          </div>
        </div>
      </template>
    </DialogModal>
  </teleport>
</template>

<style scoped></style>
