<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { type ChatHistoryTitle, useAuthStore, useRafikeyChatbotStore } from '@/stores'
import moment from 'moment'
import ChatHistory from '@/components/chat/ChatHistory.vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useRouter } from 'vue-router'
import DialogModal from '@/components/DialogModal.vue'
import { useDark, useToggle } from '@vueuse/core'

const chatbotStore = useRafikeyChatbotStore()
const router = useRouter()
const isDark = useDark()
const authStore = useAuthStore()
const isChatHIstoryError = ref(false)
onMounted(() => {
  chatbotStore
    .getChatHistoryTitles()
    .then((response) => {
      // console.log('response', response)
      if (response) {
        chatbotStore.chatHistoryTitles = response.data
      } else {
        isChatHIstoryError.value = true
      }
    })
    .catch((error) => {
      // console.error('Error fetching chat history titles:', error)
      isChatHIstoryError.value = true
    })
})

// reduce the chat titles according to the dates
const groupChat = () => {
  const now = moment()
  const initialValue = {}
  return chatbotStore.chatHistoryTitles.reduce(
    (acc, title: ChatHistoryTitle) => {
      let date = moment(title.last_message_at).toISOString()
      // console.log('date---', date)
      if (now.isSame(date, 'day')) {
        date = 'Today'
      } else if (now.subtract(1, 'days').isSame(date, 'day')) {
        date = 'Yesterday'
      } else if (now.subtract(1, 'weeks').isBefore(date)) {
        date = 'Previous 7 Days'
      } else if (now.subtract(1, 'months').isBefore(date)) {
        date = 'Previous 30 Days'
      } else if (now.subtract(1, 'years').isBefore(date)) {
        date = moment(title.last_message_at).format('MMMM')
      } else {
        date = moment(title.last_message_at).format('YYYY')
      }

      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(title)
      return acc
    },
    initialValue as Record<string, ChatHistoryTitle[]>,
  )
}

const emits = defineEmits<{
  (event: 'fetchHistoryHandler', activeSessionId: string): void
  (event: 'profileHandler'): void
}>()

// fetch clicked chat History title
const fetchHistoryHandler = (activeSessionId: string) => {
  emits('fetchHistoryHandler', activeSessionId)
}

// profile handler
const profileHandler = () => {
  emits('profileHandler')
}
// collapse sidenav
const collapseSideNavHandler = () => {
  chatbotStore.setCollapseSidebarLarge(true)
}

// expand sidenav
const expandSideNavHandler = () => {
  chatbotStore.setCollapseSidebarLarge(false)
}

// generate a new chat
const newChatHandler = () => {
  chatbotStore.conversation = []
  router.push({
    name: 'newChat',
  })
}

const modeToggleHandler = useToggle(isDark)
const isShowProfile = ref(true)
const termsConditionHandler = () => {
  console.log('clicked the tems and condition')
  router.push({ name: 'privacy-policy-1' })
  chatbotStore.isShowTermsButton = false
}

const showLogoutDialogModal = ref(false)
const confirmLogoutHandler = () => {
  showLogoutDialogModal.value = true
}

const logoutHandler = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

const cancelLogout = () => {
  showLogoutDialogModal.value = false
  isShowProfile.value = false
}

const showProfile = () => {
  console.log('Clicking the profile')
  isShowProfile.value = !isShowProfile.value
}

watch(chatbotStore.collapseSidebarSmall, (value)=>{
  if(!value) {
    isShowProfile.value = false
  }
})
</script>

<template>
  <!--  sidebar medium to large screens-->
  <div
    :class="[chatbotStore.collapseSidebarLarge ? 'w-24 duration-300 ' : 'w-80 duration-300 ']"
    class="fixed md:block hidden bg-link-water-50 dark:bg-darkgray top-6 left-6 h-[calc(100vh-3rem)] rounded-2xl z-50"
  >
    <div
      class="flex justify-between items-center"
      :class="[!chatbotStore.collapseSidebarLarge ? 'pe-8' : '']"
    >
      <div class="w-28" @click="expandSideNavHandler">
        <img src="../../assets/images/rafikey-icon.png" alt="rafikey-icon" />
      </div>
      <div
        v-if="!chatbotStore.collapseSidebarLarge"
        @click="collapseSideNavHandler"
        class="btn btn-sm btn-circle flex justify-center items-center h-10 w-10 dark:bg-darkgray hover:bg-transparent shadow-none"
      >
        <span class="material-icons-outlined dark:text-white">arrow_back_ios</span>
      </div>
    </div>

    <div class="flex gap-6" :class="[!chatbotStore.collapseSidebarLarge ? ' ps-10' : '']">
      <!--    top side-->
      <div>
        <div class="space-y-16 pt-16" :class="[chatbotStore.collapseSidebarLarge ? 'ps-8' : '']">
          <div class="flex flex-col gap-4">
            <div
              @click="newChatHandler"
              class="bg-darkgray cursor-pointer dark:bg-stone-700 rounded-lg h-8 w-8 flex items-center justify-center"
            >
              <span class="material-icons-outlined text-white">add</span>
            </div>
            <div>
              <span class="material-icons-outlined !text-3xl dark:text-stone-300">home</span>
            </div>
            <div>
              <span class="material-icons-outlined text-slate-300 !text-3xl dark:text-stone-300"
                >history</span
              >
            </div>
            <div>
              <span class="material-icons-outlined text-slate-300 !text-3xl dark:text-stone-300"
                >explore</span
              >
            </div>
          </div>
        </div>

        <!--    bottom side-->
        <div
          class="absolute bottom-4 w-full"
          :class="[!chatbotStore.collapseSidebarLarge ? 'flex ' : '']"
        >
          <div class="flex flex-col items-center gap-4">
            <!--            <div>-->
            <!--              <span class="material-icons-outlined !text-3xl dark:text-stone-300">more_horiz</span>-->
            <!--            </div>-->
            <div>
              <span class="material-icons-outlined !text-3xl dark:text-stone-300">settings</span>
            </div>
            <div @click.stop="profileHandler">
              <img
                src="@/assets/images/Avatar.png"
                alt="rafikey-avatar"
                class="w-8 h-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="relative h-[calc(100vh-10rem)] w-full">
        <div
          class="h-[calc(100vh-21rem)] overflow-y-auto"
          v-if="chatbotStore.chatHistoryTitles && !chatbotStore.collapseSidebarLarge"
        >
          <div v-for="(titles, date) in groupChat()" :key="date">
            <div
              class="flex justify-between sticky ps-4 pb-1 top-0 backdrop-blur font-bold bg-transparentdark:bg-darkgray"
            >
              <h1 class="dark:text-white text-large">{{ date }}</h1>
              <div class="flex flex-row-reverse">
                <span class="material-icons-outlined dark:text-white">expand_less</span>
                <span class="dark:text-stone-300 text-small"> {{ titles.length }} total</span>
              </div>
            </div>

            <div v-for="title in titles" :key="title.thread_id" class="w-full">
              <ChatHistory
                :thread-id="title.thread_id"
                :last-message-at="title.last_message_at"
                :title="title.title"
                @fetch-history-handler="fetchHistoryHandler"
              />
            </div>
          </div>
          <div class="absolute bottom-4 grid grid-cols-12 w-full">
            <div
              class="col-span-4 sidebar-button-yellow shadow-[0_0_20px_3px] shadow-yellow-500/85 h-10 w-10 rounded-full flex items-center justify-center"
            >
              <img src="@/assets/images/talk-about-it.png" alt="talk-to-someone-image" class="" />
            </div>
            <div
              class="col-span-4 sidebar-button-pink shadow-[0_0_20px_3px] shadow-pink-500/85 h-10 w-10 rounded-full flex items-center justify-center"
            >
              <img src="@/assets/images/clinic.png" alt="clinic-image" />
            </div>
            <div
              class="col-span-4 sidebar-button-blue shadow-[0_0_20px_3px] shadow-blue-500/85 h-10 w-10 rounded-full flex items-center justify-center"
            >
              <img src="@/assets/images/learn.png" alt="lear-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--  Sidebar small screens-->
  <div class="">
    <TransitionRoot
      as="template"
      :show="!chatbotStore.collapseSidebarSmall"
      class="relative md:hidden block"
    >
      <Dialog class="relative z-10" @close="chatbotStore.setCollapseSidebarSmall(true)">
        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <TransitionChild
                as="template"
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enter-from="translate-x-full"
                enter-to="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leave-from="translate-x-0"
                leave-to="translate-x-full"
              >
                <DialogPanel class="pointer-events-auto relative w-screen max-w-md">
                  <TransitionChild
                    as="template"
                    enter="ease-in-out duration-500"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in-out duration-500"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                  >
                    <div class="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                      <!--                      <button-->
                      <!--                        type="button"-->
                      <!--                        class="relative rounded-md text-gray-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"-->
                      <!--                        @click="chatbotStore.setCollapseSidebarSmall(true)"-->
                      <!--                      >-->
                      <!--                        <span class="absolute -inset-2.5" />-->
                      <!--                        <span class="sr-only">Close panel</span>-->
                      <!--                        <XMarkIcon class="size-6" aria-hidden="true" />-->
                      <!--                      </button>-->
                    </div>
                  </TransitionChild>
                  <div
                    class="flex h-full flex-col space-y-4 overflow-y-auto bg-white dark:bg-lightgray py-6 shadow-xl"
                  >
                    <div class="px-4 sm:px-6">
                      <DialogTitle class="text-base font-semibold">
                        <div class="flex justify-between">
                          <div>
                            <p class="text-xl dark:text-white">RAFIKey</p>
                          </div>
                          <div
                            @click="chatbotStore.setCollapseSidebarSmall(true)"
                            class="btn btn-sm btn-circle flex justify-center items-center h-10 w-10 dark:bg-darkgray hover:bg-transparent shadow-none"
                          >
                            <span class="material-icons-outlined rotate-180 dark:text-white"
                              >arrow_back_ios</span
                            >
                          </div>
                        </div>
                        <!--                        <div class="border-b border-darkgray pt-4"></div>-->
                      </DialogTitle>
                    </div>
                    <div class="relative space-y-3 flex-1">
                      <div class="flex justify-between px-4">
                        <div class="flex gap-4 items-center">
                          <div
                            class="flex gap-1 justify-between border dark:border-white border-stone-300 rounded-lg px-2 py-1"
                          >
                            <span
                              class="material-icons-outlined dark:text-stone-300 md:!text-lg !text-sm"
                              >share</span
                            >
                            <span class="dark:text-white md:text-lg text-sm">Share</span>
                          </div>
                          <div class="">
                            <span class="dark:text-white md:text-lg text-sm">Feedback</span>
                          </div>
                        </div>
                        <div @click="showProfile">
                          <img
                            src="@/assets/images/Avatar.png"
                            alt="rafikey-avatar"
                            class="w-10 h-10 rounded-full"
                          />
                        </div>
                      </div>
                      <div class="border-b border-darkgray"></div>

                      <div
                        class="flex justify-between pb-4 px-4 cursor-pointer"
                        @click="newChatHandler"
                      >
                        <span class="dark:text-white text-small flex items-center">New Chat</span>
                        <div
                          class="bg-darkgray dark:bg-stone-700 p-1 rounded-md flex items-center justify-center"
                        >
                          <span class="material-icons-outlined text-white">add</span>
                        </div>
                      </div>
                      <!-- Your content -->
                      <div>
                        <div
                          class="h-[calc(100vh-21rem)] overflow-y-auto"
                          v-if="
                            chatbotStore.chatHistoryTitles && !chatbotStore.collapseSidebarSmall
                          "
                        >
                          <div v-for="(titles, date) in groupChat()" :key="date">
                            <div
                              class="flex justify-between sticky pb-1 top-0 backdrop-blur font-bold bg-white dark:bg-lightgray"
                            >
                              <h1 class="dark:text-white ps-4 text-large">{{ date }}</h1>
                              <div class="flex flex-row-reverse">
                                <span class="material-icons-outlined dark:text-white"
                                  >expand_less</span
                                >
                                <span class="dark:text-stone-300 text-small">
                                  {{ titles.length }} total</span
                                >
                              </div>
                            </div>

                            <div v-for="title in titles" :key="title.thread_id" class="py-1">
                              <ChatHistory
                                :thread-id="title.thread_id"
                                :last-message-at="title.last_message_at"
                                :title="title.title"
                                @fetch-history-handler="fetchHistoryHandler"
                              />
                            </div>
                          </div>
                          <div class="absolute bottom-0 w-full">
                            <div class="flex px-10 justify-between w-full">
                              <div
                                class="col-span-1 sidebar-button-yellow shadow-[0_0_32px_3px] shadow-yellow-500/85 h-10 w-10 rounded-full flex items-center justify-center"
                              >
                                <img
                                  src="@/assets/images/talk-about-it.png"
                                  alt="talk-to-someone-image"
                                  class=""
                                />
                              </div>
                              <div
                                class="sidebar-button-pink shadow-[0_0_32px_3px] shadow-pink-500/85 h-10 w-10 rounded-full flex items-center justify-center"
                              >
                                <img src="@/assets/images/clinic.png" alt="clinic-image" />
                              </div>
                              <div
                                class="sidebar-button-blue shadow-[0_0_32px_3px] shadow-blue-500/85 h-10 w-10 rounded-full flex items-center justify-center"
                              >
                                <img src="@/assets/images/learn.png" alt="lear-image" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--        profile section-->
                    <div
                      ref="profileSectionElement"
                      v-show="isShowProfile"
                      class="divide-y divide-solid  dark:divide-stone-700 dark:bg-darkgray cursor-pointer absolute space-y-4 bottom-0 w-full bg-white shadow-2xl p-4 rounded-t-2xl"
                    >
                      <div class="space-y-1">
                        <div
                          @click.stop="termsConditionHandler"
                          class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
                        >
                          <span class="material-icons-outlined dark:text-white !text-xl"
                            >article</span
                          >
                          <span class="dark:text-white text-gray-700">Terms and Conditions</span>
                        </div>
                        <div
                          class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
                        >
                          <span class="material-icons-outlined dark:text-white !text-xl"
                            >support</span
                          >
                          <span class="dark:text-white text-gray-700">Help</span>
                        </div>
                        <div
                          @click.stop="modeToggleHandler()"
                          class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
                        >
                          <span
                            v-if="!isDark"
                            class="material-icons-outlined dark:text-white !text-xl"
                            >dark_mode</span
                          >
                          <span v-else class="material-icons-outlined dark:text-white"
                            >light_mode</span
                          >
                          <span v-if="!isDark" class="dark:text-white text-gray-700"
                            >Dark Mode</span
                          >
                          <span v-else class="dark:text-white text-gray-700">Light Mode</span>
                        </div>
                      </div>
                      <!--          <div class="divide-y divide-solid  "></div>-->
                      <div class="space-y-1 pt-2">
                        <div
                          @click.stop="confirmLogoutHandler"
                          class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
                        >
                          <span class="material-icons-round dark:text-white !text-xl"
                            >exit_to_app</span
                          >
                          <span class="dark:text-white text-gray-700">Log out</span>
                        </div>
                        <div class="flex gap-4 rounded-lg px-2 py-1">
                          <span class="material-icons-round text-stone-400 dark:text-white"
                            >person_outline</span
                          >
                          <span class="text-stone-400">{{
                            authStore.getUserInfo()?.username
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

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
            <p class="dark:text-white text-lg lg:text-xl">Are you Sure?</p>
            <span class="dark:text-white text-lg lg:text-lg">You want to log out?</span>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center gap-4">
            <button
              @click.stop="logoutHandler"
              class="btn btn-sm border-none outline-none bg-casablanca-300 shadow-none px-4 rounded-lg"
            >
              <span class="">Ok</span>
              <!--              <span v-else class="loading loading-spinner loading-sm"></span>-->
            </button>
            <button
              @click.stop="cancelLogout"
              class="btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg dark:text-white"
            >
              <span>Cancel</span>
            </button>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>
</template>

<style scoped>
.sidebar-button-blue {
  background-color: #2b42d1;
}

.sidebar-button-pink {
  background-color: #d56d9c;
}

.sidebar-button-yellow {
  background-color: #fae44b;
}
</style>
