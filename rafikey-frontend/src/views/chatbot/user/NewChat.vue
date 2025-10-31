<script setup lang="ts">
import { computed, onMounted, ref, defineEmits } from 'vue'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import access2Light from '@/assets/images/access2Light.png'
import access2Dark from '@/assets/images/access2Dark.png'
import { v4 as uuidV4 } from 'uuid'
import { useRouter } from 'vue-router'
import { useColorGenerator } from '@/composables/colorGenerator.ts'
import SRHRGameButton from '@/components/game/SRHRGameButton.vue'
import { toggleImage } from '@/composables/imageToggle.ts'
import FindAService from '@/components/chat/FindAService.vue'

export interface AccessQuestion {
  id: number
  question: string
  icon: string
}

interface AccessButton {
  id: number
  image: string
}

const accessButtonsArray = [
  {
    id: 1,
    images: {
      light: access2Light,
      dark: access2Dark,
    },
    content: 'Learn more about SRHR information',
  },
]

const accessButtonDisplay = ref<AccessButton[]>([])

const chatbotStore = useRafikeyChatbotStore()
const authStore = useAuthStore()
const router = useRouter()

const toggleAccessButton = computed(() => {
  return chatbotStore.isDarkMode
    ? accessButtonsArray[0].images.dark
    : accessButtonsArray[0].images.light
})

// toggle image icons in dark and light mode
// const toggleImageIcon = computed(() => {
//   return chatbotStore.isDarkMode ? imageIconDark : imageIconLight
// })

const startChatHandler = () => {
  chatbotStore.setSessionId(uuidV4())
  router.push({
    name: 'chatWithId',
    params: {
      sessionId: chatbotStore.sessionId,
    },
  })
  chatbotStore.isNewChat = false
}

const message = ref('')
const welcomeMessages = ['Welcome To Rafikey 🎉', 'GET READY TO MAKE INFORMED CHOICES'] as string[]
const showWelcomeDialogModal = ref(true)

const accessQuestions = [
  {
    id: 1,
    question: 'How can I know I have STI?',
    icon: 'sms',
  },
  {
    id: 2,
    question: 'Best gynecologist?',
    icon: 'sms',
  },
  {
    id: 3,
    question: 'How to wear a condom',
    icon: 'sms',
  },
] as AccessQuestion[]

// don't show the welcome messages if user already logged in
onMounted(() => {
  chatbotStore.isShowPlayButton = true
  // const routes = ['/auth/login', '/auth/register']
  // if(routes.indexOf(chatbotStore.previousRoute) === -1 ) {
  //   showWelcomeDialogModal.value = false
  // }
  // else{
  //   message.value = welcomeMessages[0]
  //   setTimeout(() => {
  //     message.value = welcomeMessages[1]
  //     setTimeout(() => {
  //       showWelcomeDialogModal.value = false
  //     }, 3000)
  //   }, 3000)
  // }

  showWelcomeDialogModal.value = true
  message.value = welcomeMessages[0]
})

const emits = defineEmits<{
  (event: 'userInput', formatted: string): void
}>()

const accessButtonQuestionHandler = (message: string) => {
  chatbotStore.conversation = []
  emits('userInput', message)
}
const userString = authStore.user
let username = ''
try {
  if (userString) {
    username = JSON.parse(userString).username || 'ME'
  }
} catch (e) {
  username = 'ME'
}
const { darkBgColor, bgColor, setColor } = useColorGenerator(username)

setColor()

const closeGameButton = () => {
  chatbotStore.isShowPlayButton = false
}

const goToPlayPage = () => {
  router.push({
    name: 'welcome-page-quiz',
  })
}

const goToServiceFInder = () =>{
  window.location.href= 'https://askrafikey.com/service-finder'
}
</script>

<template>
  <div class="min-h-screen dark:bg-lightgray">
    <div class="xl:space-y-28 space-y-16 min-h-screen md:block hidden">
      <div class="space-y-8 lg:pt-12">
        <div class="space-y-4">
          <h2
            class="text-extra-extra-large-2 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-azure-radiance-600 to-coral-red-500"
          >
            Hi {{ authStore.getUserInfo()?.username || 'there' }}
          </h2>
          <p class="text-extra-extra-large-1 text-stone-400">
            Let's talk sexual and reproductive health
          </p>
        </div>
      </div>

      <div class="w-full flex justify-between" v-if="accessButtonDisplay">
        <div class="flex flex-wrap gap-4 " :class="[!chatbotStore.collapseSidebarLarge? 'gap-2 md:gap-1': 'md:gap-10']">
<!--          <div-->
<!--            class="lg:col-span-1 col-span-4 cursor-pointer"-->
<!--            @click="accessButtonQuestionHandler(accessButtonsArray[0].content)"-->
<!--          >-->
<!--            <img :src="toggleAccessButton" alt="access-buttons" class="" />-->
<!--          </div>-->
          <div class="lg:col-span-1 col-span-4">
            <FindAService :bgColor=" darkBgColor" @close-game-button="closeGameButton" />
          </div>
          <div class="lg:col-span-1 col-span-4">
            <SRHRGameButton @close-game-button="closeGameButton" />
          </div>

          <div class="lg:col-span-1 flex justify-end col-span-12">
            <img
              src="../../../assets/images/rafiikey-mascot2.svg"
              alt="rafikey-mascot"
              class="lg:w-64 lg:h-48 xl:h-full w-28"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="relative min-h-screen md:hidden">
      <div class="flex items-center justify-between">
        <div class="w-20" @click="chatbotStore.setCollapseSidebarSmall(false)">
          <img :src="toggleImage()" alt="rafikey-icon" />
        </div>
        <div class="flex items-center justify-between gap-6">
          <!--          <div-->
          <!--            class="border dark:border-stone-300 rounded-full flex h-6 w-6 justify-center items-center"-->
          <!--          >-->
          <!--            <span class="material-icons-outlined dark:text-stone-300 !text-lg">settings</span>-->
          <!--          </div>-->
          <div>
            <div
              :class="[darkBgColor, bgColor]"
              class="rounded-full h-8 w-8 flex items-center justify-center font-bold"
            >
              <span class="dark:text-white text-sm">{{
                JSON.parse(authStore.user).username.substring(0, 2).toUpperCase()
              }}</span>
              <!--          <img alt="user-avatar" src="@/assets/images/Avatar.png" />-->
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <!--        <div-->
        <!--          @click.stop="startChatHandler"-->
        <!--          class="cursor-pointer w-full dark:bg-darkgray bg-link-water-50 rounded-xl sm:p-5 p-3 sm:space-y-4 space-y-2"-->
        <!--        >-->
        <!--          <div class="bg-purple-500 rounded-full h-10 w-10 flex justify-center items-center">-->
        <!--            <span class="material-icons-outlined dark:text-white">sms</span>-->
        <!--          </div>-->
        <!--          <div class="flex dark:text-white sm:gap-4  justify-between">-->
        <!--            <p class="text-small">Chat with Rafikey</p>-->
        <!--            <span class="material-icons-outlined text-sm">arrow_forward</span>-->
        <!--          </div>-->
        <!--        </div>-->
        <div
          @click.stop="goToPlayPage"
          class="cursor-pointer w-full dark:bg-darkgray bg-link-water-50 rounded-xl sm:p-5 p-3 sm:space-y-4 space-y-2"
        >
          <div class="bg-casablanca-300 rounded-full h-10 w-10 flex justify-center items-center">
            <!--            <span class="material-icons-outlined dark:text-white">mic_none</span>-->
            <img src="@/assets/images/game.png" alt="game-image" />
          </div>
          <div class="flex dark:text-white gap-4">
            <p class="text-small">Play games</p>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>

      <div class="space-y-2 pt-10">
        <div class="flex justify-between sm:p-4">
          <p class="dark:text-white text-extra-large">Quick Access</p>
          <!--          <span class="text-purple-400 text-small">See all</span>-->
        </div>
        <div v-for="qn in accessQuestions" :key="qn.id">
          <div
            @click="accessButtonQuestionHandler(qn.question)"
            class="cursor-pointer flex dark:bg-darkgray bg-link-water-50 rounded-xl sm:p-5 p-3 gap-4"
          >
            <span class="material-icons-outlined dark:text-white">{{ qn.icon }}</span>
            <p class="dark:text-white text-small">{{ qn.question }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
