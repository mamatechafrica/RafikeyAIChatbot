<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRafikeyChatbotStore } from '@/stores/rafikeyChatbotStore'
import DialogModal from '@/components/DialogModal.vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores'

const openClearChatDialog = ref(false)

const chatbotStore = useRafikeyChatbotStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const isNotificationEnabled = ref(chatbotStore.getOtherSettings.notificationsEnabled || false)
watch(
  () => isNotificationEnabled.value,
  () => {
    chatbotStore.setOtherSettings({
      key: 'notificationsEnabled',
      value: isNotificationEnabled.value,
    })
  },
)
const isLoading = ref(false)
const deleteAllChats = () => {
  isLoading.value = true
  chatbotStore
    .deleteAllChats()

    .then((res) => {
      if (res.result === 'ok') {
        notificationStore.addNotification(res.data, 'success')

        setTimeout(() => {
          router.replace({
            name: 'newChat',
          })
          chatbotStore.sessionId = ''
          chatbotStore.conversation = []
        }, 3000)
      } else {
        notificationStore.addNotification(res.data, 'error')
      }
    })
    .catch((err) => {
      notificationStore.addNotification(
        'An error occurred while deleting old chats, please try again',
        'error',
      )
    })
    .finally(() => {
      isLoading.value = false
      openClearChatDialog.value = false
    })
}

const isArchive = ref(chatbotStore.isChatArchive)

const toggleArchive = (value: string) => {
  isArchive.value = value === 'archive'
  chatbotStore.isChatArchive = isArchive.value
}

watch(isArchive, (value: boolean) => {
  if (value) {
    notificationStore.addNotification('All chats have been archived', 'success')
  } else {
    notificationStore.addNotification('Archived chats are now visible', 'success')
  }
})
</script>

<template>
  <div class="px-[16px]">
    <!--    <div class="py-4 flex items-center justify-between">-->
    <!--      <p class="dark:text-white">Notifications</p>-->
    <!--      <div class="tooltip tooltip-left" data-tip="Email notifications for chat deletions">-->
    <!--        <div class="flex gap-16">-->
    <!--          <span class="dark:text-white">Off</span>-->
    <!--          <span class="dark:text-white">On</span>-->
    <!--        </div>-->
    <!--        <label-->
    <!--          for="Toggle1"-->
    <!--          class="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"-->
    <!--        >-->
    <!--          <span class="relative">-->
    <!--            <input-->
    <!--              id="Toggle1"-->
    <!--              type="checkbox"-->
    <!--              class="hidden peer"-->
    <!--              v-model="isNotificationEnabled"-->
    <!--            />-->
    <!--            <div-->
    <!--              class="w-28 h-6 rounded-full shadow bg-veryLight dark:bg-veryLight peer-checked:bg-veryLight"-->
    <!--            ></div>-->
    <!--            <div-->
    <!--              class="absolute transition-all inset-y-0 left-0 w-8 h-6 m-0 rounded-full shadow peer-checked:right-0 peer-checked:bg-bg-veryLight peer-checked:left-auto bg-casablanca-300"-->
    <!--            ></div>-->
    <!--          </span>-->
    <!--        </label>-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <div class="border-b-[1px] dark:border-veryLightFive border-veryLightFour"></div>-->
<!--    <div class="pt-4">-->
<!--      <div-->
<!--        class="relative border border-azure-radiance-500 bg-azure-radiance-200 rounded-2xl p-3 w-full font-semibold"-->
<!--      >-->
<!--        <div-->
<!--          class="absolute inset-0 left-0 right-0 border-l-4 rounded-xl border-azure-radiance-500"-->
<!--        ></div>-->
<!--        <div class="flex items-center gap-2">-->
<!--          <span class="material-icons-outlined">info</span>-->
<!--          <p class="">Chats are saved automatically, but deleted after every 30days</p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
    <div class="py-6 pe-2 flex justify-between" v-if="chatbotStore.chatHistoryTitles.length > 0">
      <div>
        <p class="dark:text-white">Chat History</p>
      </div>
      <div class="flex gap-4 flex-col items-end">
        <div class="tooltip flex gap-2 tooltip-bottom" data-tip="Displays chats on the side nav">
          <input
            type="radio"
            id="noArchive"
            value="false"
            @change="toggleArchive('view')"
            :checked="!isArchive"
            class="custom-radio"
          />
          <label for="noArchive" class="dark:text-white">View Archived Chats</label>
        </div>
        <div class="tooltip flex gap-2 tooltip-bottom" data-tip="Hides chats from the side nav">
          <input
            type="radio"
            id="archive"
            value="true"
            :checked="isArchive"
            @change="toggleArchive('archive')"
            class="custom-radio"
          />
          <label for="archive" class="dark:text-white">Archive All Chats</label>
        </div>
        <div
          data-tip="Deletes all chats permanently"
          @click="openClearChatDialog = true"
          class="tooltip tooltip-bottom cursor-pointer w-fit border border-red-700 rounded-2xl px-3 py-1"
        >
          <span class="text-red-700">Clear All Chats</span>
        </div>
      </div>
    </div>

    <div class="border-b-[1px] dark:border-veryLightFive border-veryLightFour"></div>
    <Teleport to="body">
      <DialogModal
        :is-open="openClearChatDialog"
        @close-modal="openClearChatDialog = !openClearChatDialog"
      >
        <template #title>
          <div class="flex items-center gap-4">
            <div>
              <span class="material-icons-round !text-red-700 dark:text-white text-extra-large"
                >warning</span
              >
            </div>
            <div>
              <span class="dark:text-white">Delete all chats?</span>
            </div>
          </div>
        </template>
        <template #body>
          <div>
            <span class="dark:text-white"
              >All chats will be gone forever and you won't be able to access them again.</span
            >
          </div>
        </template>
        <template #footer>
          <div class="w-3/4 mx-auto cursor-pointer flex items-center justify-between">
            <button
              @click="openClearChatDialog = false"
              class="btn btn-sm btn-ghost hover:bg-transparent hover:shadow-none dark:border-red-700 rounded-2xl px-4"
            >
              <span class="text-red-700 text-extra-extra-small lg:text-extra-small">Cancel</span>
            </button>
            <button
              @click="deleteAllChats"
              class="btn btn-sm btn-ghost border-none hover:shadow-none bg-red-700 rounded-2xl px-4"
            >
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <span v-else class="dark:text-white text-extra-extra-small lg:text-extra-small"
                >Delete Chats</span
              >
            </button>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-radio {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid #454d63;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
}

.custom-radio:checked {
  background-color: #f2b04d;
  border: 1px solid #f2b04d;
  box-shadow: 0 0 0 3px white inset; /* creates the inner circle look */
}
</style>
