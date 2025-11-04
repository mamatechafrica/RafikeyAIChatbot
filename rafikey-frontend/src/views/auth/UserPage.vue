<script setup lang="ts">
import { usePWA } from '@/composables/usePWA.ts'
import { ref, watch } from 'vue'
import DialogModal from '@/components/DialogModal.vue'
import { useNotificationStore } from '@/stores'
const { needRefresh, offlineReady, updateSW } = usePWA()

const notificationStore = useNotificationStore()
const isShowDialog = ref(false)

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
}

const isLoadingUpdates = ref(false)

const updateAppHandler = () => {
  updateSW(true)
  isLoadingUpdates.value = true

  setTimeout(() => {
    isShowDialog.value = false
    window.location.reload()
  }, 2000)
}
</script>

<template>
  <div>
    <RouterView #default="{ Component, route }">
      <template v-if="Component">
        <component :is="Component" :key="route.fullPath" />
      </template>
    </RouterView>
  </div>
  <teleport to="body">
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
