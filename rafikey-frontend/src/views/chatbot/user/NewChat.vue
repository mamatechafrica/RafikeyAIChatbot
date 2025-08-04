<script setup lang="ts">
import { computed } from 'vue'
import imageDark from '@/assets/images/welcome-frames-dark.png'
import imageLight from '@/assets/images/welcome-frames-light.png'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import imageIconLight from '@/assets/images/rafikey-icon-light.png'
import imageIconDark from '@/assets/images/rafikey-icon-dark.png'
import { v4 as uuidV4 } from 'uuid'
import { useRouter } from 'vue-router'



const chatbotStore = useRafikeyChatbotStore()
const authStore = useAuthStore()
const router = useRouter()

const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ? imageDark : imageLight
})

// toggle image icons in dark and light mode
const toggleImageIcon = computed(() => {
  return  chatbotStore.isDarkMode ? imageIconDark : imageIconLight
})

const startChatHandler = () =>{
  console.log("Start chat")
  chatbotStore.setSessionId(uuidV4())
  router.push({
    name: 'chatWithId',
    params: {
      sessionId: chatbotStore.sessionId
    }
  })
}

const startVoiceChat = () => {

}

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
  // router.push({
  //   name: 'chatWithId',
  // })
  // chatbotStore.setAccessButtonRequest(message)
  chatbotStore.conversation = []
  emits('userInput', message)
}

</script>

<template>
  <div class="space-y-28 dark:bg-lightgray h-screen md:block hidden">
    <div class="space-y-8 pt-12">
      <div class="space-y-4">
        <h2
          class="!text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-azure-radiance-600 to-coral-red-500"
        >
          Hi {{ authStore.getUserInfo()?.username || 'there' }}
        </h2>
        <p class="!text-3xl text-stone-400">Let's talk sexual and reproductive health</p>
      </div>
    </div>

    <div class="flex">
      <div>
        <img :src="toggleImage" alt="welcome-screen-image" />
      </div>
      <div>
        <img src="@/assets/images/rafikey-bot.png" alt="rafikey-image" />
      </div>
    </div>
  </div>

  <div class="relative dark:bg-lightgray h-screen block md:hidden">
    <div class="flex items-center justify-between">
      <div class="w-32" @click="chatbotStore.setCollapseSidebarSmall(false)">
        <img :src="toggleImageIcon" alt="rafikey-icon" />
      </div>
      <div
        class="border dark:border-stone-300 rounded-full flex h-8 w-8 justify-center items-center"
      >
        <span class="material-icons-outlined dark:text-stone-300 !text-lg">settings</span>
      </div>
    </div>
    <div class="flex  flex-col sm:pt-8 pt-4 sm:space-y-12 space-y-4 w-full">
      <div class="flex gap-6 ">
        <div
          @click.stop="startChatHandler"
          class="cursor-pointer w-full dark:bg-darkgray bg-link-water-50 rounded-xl sm:p-5 p-3 sm:space-y-4 space-y-2">
          <div class="bg-purple-500 rounded-full h-10 w-10 flex justify-center items-center">
            <span class="material-icons-outlined dark:text-white">sms</span>
          </div>
          <div class="flex dark:text-white sm:gap-4">
            <p class="text-sm">Chat with Rafikey</p>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </div>
        </div>
        <div
          @click.stop="startVoiceChat"
          class="cursor-pointer w-full dark:bg-darkgray bg-link-water-50 rounded-xl  sm:p-5 p-3 sm:space-y-4 space-y-2">
          <div class="bg-yellow-500 rounded-full h-10 w-10 flex justify-center items-center">
            <span class="material-icons-outlined dark:text-white">mic_none</span>
          </div>
          <div
            class="flex dark:text-white gap-4">
            <p class="text-sm">Chat with Rafikey</p>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>

      <div class="">
        <div class="sm:space-y-6 space-y-4 ">
          <div class="flex justify-between  sm:p-4">
            <p class="dark:text-white text-lg">History</p>
            <span class="text-purple-400">See all</span>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl sm:p-5 p-3 gap-4 " >
            <span class="material-icons-outlined dark:text-white">mic_none</span>
            <p class="dark:text-white">How can I know I have STI?</p>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl sm:p-5 p-3   gap-4 ">
            <span class="material-icons-outlined dark:text-white">sms</span>
            <span class="dark:text-white">Best gynecologist?</span>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl sm:p-5 p-3  gap-4 ">
            <span class="material-icons-outlined dark:text-white">sms</span>
            <span class="dark:text-white">How to wear a condom</span>
          </div>
        </div>
      </div>
      <div class="absolute bottom-24  space-y-10 w-full">
        <div class="text-center">
          <p class="text-lg">Quick Links</p>
        </div>
        <div class=" px-10 flex items-center justify-between">

          <div
            class="col-span-1 z-10 sidebar-button-yellow shadow-[0_0_32px_5px]  shadow-yellow-500/85  h-10 w-10 rounded-full flex items-center justify-center"
          >
            <img
              src="@/assets/images/talk-about-it.png"
              alt="talk-to-someone-image"
              class=""
            />
          </div>
          <div
            class=" sidebar-button-pink shadow-[0_0_32px_3px]  shadow-pink-500/85  h-10 w-10 rounded-full flex items-center justify-center"
          >
            <img src="@/assets/images/clinic.png" alt="clinic-image" />
          </div>
          <div
            class="sidebar-button-blue shadow-[0_0_32px_5px]  shadow-blue-500/85  h-10 w-10 rounded-full flex items-center justify-center"
          >
            <img src="@/assets/images/learn.png" alt="lear-image" />
          </div>
        </div>
      </div>






    </div>
  </div>
</template>

<style scoped>
.sidebar-button-blue {
  background-color: #2B42D1;
}

.sidebar-button-pink {
  background-color: #D56D9C;
}

.sidebar-button-yellow {
  background-color: #FAE44B
}

</style>
