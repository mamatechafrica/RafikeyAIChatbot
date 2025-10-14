<script setup lang="ts">
import { onMounted, ref, watch, defineEmits, shallowRef, inject, computed } from 'vue'
import { type ChatHistoryTitle, useAuthStore, useRafikeyChatbotStore } from '@/stores'
import moment from 'moment'
import ChatHistory from '@/components/chat/ChatHistory.vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useRouter } from 'vue-router'
import DialogModal from '@/components/DialogModal.vue'
import { useDark, useToggle } from '@vueuse/core'
import TabComponent from '@/components/settingsTab/TabComponent.vue'
import GeneralTab from '@/components/settingsTab/GeneralTab.vue'
import PersonalizationComponent from '@/components/settingsTab/PersonalizationComponent.vue'
import SecurityComponent from '@/components/settingsTab/SecurityComponent.vue'
import { type Tabs } from '@/components/settingsTab/TabComponent.vue'
import { imageToggleSmallDevice } from '@/composables/imageToggle.ts'

const chatbotStore = useRafikeyChatbotStore()
const router = useRouter()
const isDark = useDark()
const authStore = useAuthStore()
const isChatHistoryError = ref(false)
const isShowSettings = ref(false)

const bgColor = inject('bgColor')
const darkBgColor = inject('darkBgColor')
const isArchive = computed(() => chatbotStore.isChatArchive)

watch(()=>chatbotStore.isChatArchive, (newVal)=>{
console.log('isArchive changed:', newVal)
})

const components = [
  {
    id: 1,
    name: 'General',
    component: GeneralTab,
  },
  {
    id: 2,
    name: 'Personalisation',
    component: PersonalizationComponent,
  },
  {
    id: 3,
    name: 'Security',
    component: SecurityComponent,
  },
]

const activeComponent = shallowRef(components[0])
onMounted(() => {
  // chatbotStore.setColor()
  chatbotStore
    .getChatHistoryTitles()
    .then((response) => {
      if (response) {
        chatbotStore.chatHistoryTitles = response.data
      } else {
        isChatHistoryError.value = true
      }
    })
    .catch((error) => {
      // console.error('Error fetching chat history titles:', error)
      isChatHistoryError.value = true
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
  (event: 'isProfile', value: boolean): void
  (event: 'shareChat'): void
}>()

// fetch clicked chat History title
const fetchHistoryHandler = (activeSessionId: string) => {
  emits('fetchHistoryHandler', activeSessionId)
  chatbotStore.setCollapseSidebarSmall(true)
  isShowSettings.value = false
  isShowProfile.value = false
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
  if (isShowSettings.value) {
    isShowSettings.value = false
    emits('isProfile', isShowSettings.value)
  } else {
    isShowProfile.value = !isShowProfile.value

    // isShowProfile.value = !isShowProfile.value
    emits('isProfile', isShowProfile.value)
  }
}

const settingsHandler = () => {
  isShowProfile.value = false
  isShowSettings.value = true
}

const tabHandler = (tab: Tabs) => {
  activeComponent.value = components.find((component) => component.id === tab.id) || components[0]
}

const closeSettings = () => {
  isShowSettings.value = false
  isShowProfile.value = true
}

watch(
  () => chatbotStore.collapseSidebarSmall,
  (value) => {
    if (!value) {
      isShowProfile.value = false
      isShowSettings.value = false
    }
  },
)

const shareChat = () => {
  emits('shareChat')
}

// open user profile page
const openProfileHandler = () => {
  chatbotStore.setCollapseSidebarSmall(true)
  isShowProfile.value = false
  chatbotStore.isNewChat = false
  emits('isProfile', isShowProfile.value)
  setTimeout(()=>{
    router.push({ name: 'profile' })
  }, 500)
  // router.push({ name: 'profile' })
}

</script>

<template>
  <!--  sidebar medium to large screens-->
  <div
    :class="[chatbotStore.collapseSidebarLarge ? 'w-24 duration-300 ' : 'w-80 duration-300 ']"
    class="fixed md:block hidden bg-link-water-50 dark:bg-darkgray top-6 left-6 h-[calc(100vh-3rem)] rounded-[30px] z-50"
  >
    <div
      class="flex justify-between items-center"
      :class="[!chatbotStore.collapseSidebarLarge ? 'pe-8' : '']"
    >
      <div
        class="w-24 flex justify-center"
        @click="expandSideNavHandler"
        :class="[!chatbotStore.collapseSidebarLarge ? '' : 'cursor-pointer']"
      >
        <img :src="imageToggleSmallDevice()" alt="rafikey-icon" class="w-14 pt-4" />
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
            <!--            <div>-->
            <!--              <span class="material-icons-outlined !text-3xl dark:text-stone-300">home</span>-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <span class="material-icons-outlined text-slate-300 !text-3xl dark:text-stone-300"-->
            <!--                >history</span-->
            <!--              >-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <span class="material-icons-outlined text-slate-300 !text-3xl dark:text-stone-300"-->
            <!--                >explore</span-->
            <!--              >-->
            <!--            </div>-->
          </div>
        </div>

        <!--    bottom side-->
        <div
          class="absolute bottom-4 w-full"
          :class="[!chatbotStore.collapseSidebarLarge ? 'flex left-4' : '']"
        >
          <div class="flex flex-col items-center gap-4">
            <!--            <div>-->
            <!--              <span class="material-icons-outlined !text-3xl dark:text-stone-300">more_horiz</span>-->
            <!--            </div>-->
            <!--            <div>-->
            <!--              <span class="material-icons-outlined !text-3xl dark:text-stone-300">settings</span>-->
            <!--            </div>-->
            <div @click.stop="profileHandler" class="cursor-pointer">
              <div
                :class="[darkBgColor, bgColor]"
                class="rounded-full h-10 w-10 flex items-center justify-center font-bold"
              >
                <span class="dark:text-white">{{
                  JSON.parse(authStore.user).username.substring(0, 2).toUpperCase()
                }}</span>
                <!--          <img alt="user-avatar" src="@/assets/images/Avatar.png" />-->
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative h-[calc(100vh-10rem)] w-full" v-if="!chatbotStore.collapseSidebarLarge">
        <div
          class="h-[calc(100vh-16rem)] overflow-y-auto"
          v-if="chatbotStore.chatHistoryTitles && !isArchive"
        >
          <div v-for="(titles, date) in groupChat()" :key="date">
            <div
              class="flex justify-between sticky ps-4 pb-1 top-0 backdrop-blur font-bold bg-transparent dark:bg-darkgray"
            >
              <h1 class="dark:text-white text-large">{{ date }}</h1>
              <div class="flex flex-row-reverse">
                <span class="material-icons-outlined dark:text-white">expand_less</span>
                <span class="dark:text-stone-300 text-small text-nowrap">
                  {{ titles.length }} total</span
                >
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
        </div>
      </div>
    </div>
    <div
      v-if="isChatHistoryError && !chatbotStore.collapseSidebarLarge"
      class="absolute p-4 rounded-xl top-1/2 transition delay-400 -translate-y-[50%] left-1/2 w-3/4 -translate-x-1/2 bg-white flex justify-center items-center dark:bg-lightgray"
    >
      <div class="flex flex-col items-center">
        <img src="@/assets/images/no-data.svg" class="w-16" />
        <span class="text-center dark:text-white">Error fetching chat history, refresh</span>
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
                    <div class="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4"></div>
                  </TransitionChild>
                  <div
                    class="flex h-full flex-col space-y-4 overflow-y-auto bg-white dark:bg-lightgray py-6 shadow-xl"
                  >
                    <div
                      class="px-4 sm:px-6"
                      :class="[isShowProfile || isShowSettings ? 'blur-[4px]  ' : '']"
                    >
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
                    <div
                      class="relative space-y-3 flex-1"
                      :class="[isShowProfile || isShowSettings ? 'blur-[4px] bg-black/5' : '']"
                    >
                      <div class="flex justify-between px-4">
                        <div class="flex gap-4 items-center">
                          <div
                            @click.stop="shareChat"
                            v-if="!chatbotStore.isNewChat"
                            class="flex gap-1 justify-between border dark:border-white border-stone-300 rounded-lg px-2 py-1"
                          >
                            <span
                              class="material-icons-outlined dark:text-stone-300 md:!text-lg !text-sm"
                              >share
                            </span>
                            <span class="dark:text-white md:text-lg text-sm">Share</span>
                          </div>
                          <div class="cursor-pointer" @click.stop="showFeedbackDialog">
                            <span class="dark:text-white md:text-lg text-sm">Feedback</span>
                          </div>
                        </div>
                        <div @click="showProfile" class="cursor-pointer">
                          <div
                            :class="[darkBgColor, bgColor]"
                            class="rounded-full h-10 w-10 flex items-center justify-center font-bold"
                          >
                            <span class="dark:text-white">{{
                              JSON.parse(authStore.user).username.substring(0, 2).toUpperCase()
                            }}</span>
                            <!--          <img alt="user-avatar" src="@/assets/images/Avatar.png" />-->
                          </div>
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

                      <div
                        class="h-[calc(100vh-21rem)] overflow-y-auto"
                        v-if="!chatbotStore.collapseSidebarSmall"
                      >
                        <div v-show="chatbotStore.chatHistoryTitles && !isArchive">
                          <div v-for="(titles, date) in groupChat()" :key="date">
                            <div
                              class="flex justify-between sticky pb-1 top-0 backdrop-blur bg-opacity-30 font-bold"
                            >
                              <h1 class="dark:text-white ps-4 text-large">{{ date }}</h1>
                              <div class="flex flex-row-reverse">
                                <span class="material-icons-outlined dark:text-white"
                                  >expand_less</span
                                >
                                <span class="dark:text-stone-300 text-small text-nowrap">
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
                        </div>
                        <div
                          v-if="isChatHistoryError"
                          class="absolute p-4 rounded-xl top-1/2 -translate-y-[50%] left-1/2 -translate-x-1/2 bg-white dark:bg-lightgray"
                        >
                          <div class="flex flex-col items-center">
                            <img src="@/assets/images/no-data.svg" class="w-16" />
                            <span class="dark:text-white text-nowrap"
                              >Error fetching chat history, refresh</span
                            >
                          </div>
                        </div>

                        <!--                        <div class="absolute bottom-0 w-full bg-transparent backdrop-blur">-->
                        <!--                          <div class="flex px-10 justify-between w-full">-->
                        <!--                            <div-->
                        <!--                              class="col-span-1 sidebar-button-yellow shadow-[0_0_32px_3px] shadow-yellow-500/85 h-10 w-10 rounded-full flex items-center justify-center"-->
                        <!--                            >-->
                        <!--                              <img-->
                        <!--                                src="@/assets/images/talk-about-it.png"-->
                        <!--                                alt="talk-to-someone-image"-->
                        <!--                                class=""-->
                        <!--                              />-->
                        <!--                            </div>-->
                        <!--                            <div-->
                        <!--                              class="sidebar-button-pink shadow-[0_0_32px_3px] shadow-pink-500/85 h-10 w-10 rounded-full flex items-center justify-center"-->
                        <!--                            >-->
                        <!--                              <img src="@/assets/images/clinic.png" alt="clinic-image" />-->
                        <!--                            </div>-->
                        <!--                            <div-->
                        <!--                              class="sidebar-button-blue shadow-[0_0_32px_3px] shadow-blue-500/85 h-10 w-10 rounded-full flex items-center justify-center"-->
                        <!--                            >-->
                        <!--                              <img src="@/assets/images/learn.png" alt="lear-image" />-->
                        <!--                            </div>-->
                        <!--                          </div>-->
                        <!--                        </div>-->
                      </div>
                    </div>
                    <!--        profile section-->
                    <div
                      ref="profileSectionElement"
                      v-show="isShowProfile"
                      class="md:hidden block shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-white divide-y divide-solid z-999 dark:divide-stone-700 dark:bg-darkgray cursor-pointer absolute space-y-4 bottom-0 w-full p-4 rounded-br-[20px] rounded-tl-[20px]"
                    >
                      <div class="space-y-1">
                        <div
                          @click="settingsHandler"
                          class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
                        >
                          <span class="material-icons-outlined dark:text-white !text-xl"
                            >settings</span
                          >
                          <span class="dark:text-white text-gray-700">Settings</span>
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
                        <div
                          @click.stop="openProfileHandler"
                          class="flex gap-4 rounded-lg px-2 py-1">
                          <span class="material-icons-round text-stone-400 dark:text-white"
                            >person_outline</span
                          >
                          <span class="text-stone-400">{{
                            authStore.getUserInfo()?.username
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <!--                    setting section-->
                    <div
                      v-if="isShowSettings"
                      class="pt-[27px] px-[10px] pb-[40px] absolute rounded-t-2xl bottom-0 w-full bg-white dark:bg-darkgray"
                    >
                      <div @click.stop="closeSettings" class="cursor-pointer flex gap-4 p-[10px]">
                        <span class="material-icons-outlined dark:text-white !text-xl"
                          >arrow_back_ios</span
                        >
                        <span class="text-small dark:text-white">Back</span>
                      </div>
                      <div
                        class="border-b-[1px] dark:border-stone-700 border-veryLightTwo w-11/12 mx-auto"
                      ></div>
                      <TabComponent @tab-change="tabHandler" />
                      <div>
                        <component :is="activeComponent.component" />
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
