<script setup lang="ts">
import { useAuthStore, useNotificationStore } from '@/stores'
import DialogModal from '@/components/DialogModal.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const showLogoutDialogModal = ref(false)
const showLogoutAllDevicesDialogModal = ref(false)
const isLoadingLogoutAllDevices = ref(false)
const router = useRouter()
const logOut = () => {
  showLogoutDialogModal.value = true
}

const logoutHandler = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

const logoutAllDevices = () => {
  isLoadingLogoutAllDevices.value = true
  authStore
    .logOutAllDevices()
    .then((res) => {
      if (res.result === 'ok') {
        authStore.logout()
        notificationStore.addNotification('Logged out of all devices successfully', 'success')
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 2000)
      } else {
        notificationStore.addNotification(res.message, 'error')
      }
    })
    .catch((err) => {
      console.log('Error logging out of all devices', err)
      notificationStore.addNotification(
        'An error occurred while logging out of all devices, please try again',
        'error',
      )
    })
    .finally(() => {
      isLoadingLogoutAllDevices.value = false
      showLogoutAllDevicesDialogModal.value = false
    })
}

const logoutAllDevicesHandler = () => {
  showLogoutAllDevicesDialogModal.value = true
}
</script>

<template>
  <div class="px-[16px] py-6 flex flex-col gap-[33px]">
    <div class="flex justify-between">
      <div>
        <span class="dark:text-white">Log out of this device</span>
      </div>
      <div
        @click="logOut"
        class="cursor-pointer border dark:border-white border-darkgray rounded-full py-[6px] px-[12px]"
      >
        <span class="dark:text-white">Log Out</span>
      </div>
    </div>
<!--    <div class="flex justify-between">-->
<!--      <div>-->
<!--        <span class="dark:text-white">Log out of all devices</span>-->
<!--      </div>-->
<!--      <div-->
<!--        @click.stop="logoutAllDevicesHandler"-->
<!--        class="border border-red-700 rounded-full py-[6px] px-[12px]"-->
<!--      >-->
<!--        <span class="text-red-700"> Log Out of All </span>-->
<!--      </div>-->
<!--    </div>-->
    <div class="border-b-[1px] border-veryLightFour dark:border-veryLightFive"></div>

    <!--  log out  -->

    <Teleport to="body">
      <DialogModal
        :is-open="showLogoutDialogModal"
        @close-modal="showLogoutDialogModal = !showLogoutDialogModal"
      >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-round dark:text-white !text-4xl">&#128546;</span>
          </div>
        </template>
        <template #body>
          <div class="flex flex-col items-center py-2">
            <p class="dark:text-white text-lg lg:text-xl">Are you sure?</p>
            <span class="dark:text-white text-lg lg:text-lg">You want to log out?</span>
          </div>
        </template>
        <template #footer>
          <div class="w-full flex justify-center gap-4">
            <button
              @click="showLogoutDialogModal = !showLogoutDialogModal"
              class="btn btn-sm w-1/2 bg-transparent border-casablanca-300 shadow-none rounded-lg dark:text-white"
            >
              <span>Cancel</span>
            </button>
            <button
              @click.stop="logoutHandler"
              class="btn btn-sm w-1/2 border-none outline-none bg-casablanca-300 shadow-none px-4 rounded-lg"
            >
              <span class="">Ok</span>
              <!--              <span v-else class="loading loading-spinner loading-sm"></span>-->
            </button>
          </div>
        </template>
      </DialogModal>

      <!--      logout all devices-->
      <DialogModal
        :is-open="showLogoutAllDevicesDialogModal"
        @close-modal="showLogoutAllDevicesDialogModal = !showLogoutAllDevicesDialogModal"
      >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-round dark:text-white !text-4xl">&#128546;</span>
          </div>
        </template>
        <template #body>
          <div class="flex flex-col items-center py-2">
            <p class="dark:text-white text-lg lg:text-xl">Are you sure?</p>
            <span class="dark:text-white text-lg lg:text-lg">Logging out of all devices</span>
          </div>
        </template>
        <template #footer>
          <div class="w-full flex justify-center gap-4">
            <button
              @click="showLogoutAllDevicesDialogModal = !showLogoutAllDevicesDialogModal"
              class="btn btn-sm bg-transparent w-1/2 border-casablanca-300 shadow-none rounded-lg dark:text-white"
            >
              <span>Cancel</span>
            </button>
            <button
              @click.stop="logoutAllDevices"
              class="btn btn-sm w-1/2 border-none outline-none bg-casablanca-300 shadow-none px-4 rounded-lg"
            >
              <span v-if="!isLoadingLogoutAllDevices" class="">Ok</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>
</template>

<style scoped></style>
