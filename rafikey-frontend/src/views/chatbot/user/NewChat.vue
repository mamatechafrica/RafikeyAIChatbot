<script setup lang="ts">
import { computed } from 'vue'
import imageDark from '@/assets/images/welcome-frames-dark.png'
import imageLight from '@/assets/images/welcome-frames-light.png'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import imageIconLight from '@/assets/images/rafikey-icon-light.png'
import imageIconDark from '@/assets/images/rafikey-icon-dark.png'


const chatbotStore = useRafikeyChatbotStore()
const authStore = useAuthStore()

const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ? imageDark : imageLight
})

// toggle image icons in dark and light mode
const toggleImageIcon = computed(() => {
  return  chatbotStore.isDarkMode ? imageIconDark : imageIconLight
})

const startChatSmallScreen = () =>{

}

</script>

<template>
  <div class="space-y-28 dark:bg-lightgray md:block hidden">
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
        <img :src="toggleImage" alt="welcome-screen-image" class="" />
      </div>
      <div>
        <img src="@/assets/images/rafikey-bot.png" alt="rafikey-image" />
      </div>
    </div>
  </div>

  <div class="dark:bg-lightgray block md:hidden">
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
    <div class="flex  flex-col pt-8 space-y-12 w-full">
      <div class="flex gap-6 ">
        <div class="w-full dark:bg-darkgray bg-link-water-50 rounded-xl p-5 space-y-4" @click="startChatSmallScreen">
          <div class="bg-purple-500 rounded-full h-10 w-10 flex justify-center items-center">
            <span class="material-icons-outlined dark:text-white">sms</span>
          </div>
          <div class="flex dark:text-white gap-4">
            <p class="text-sm">Chat with Rafikey</p>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </div>
        </div>
        <div class="w-full dark:bg-darkgray bg-link-water-50 rounded-xl p-5 space-y-4">
          <div class="bg-yellow-500 rounded-full h-10 w-10 flex justify-center items-center">
            <span class="material-icons-outlined dark:text-white">mic_none</span>
          </div>
          <div class="flex dark:text-white gap-4">
            <p class="text-sm">Chat with Rafikey</p>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>

      <div class="">
        <div class="space-y-6 ">
          <div class="flex justify-between  p-4">
            <p class="dark:text-white text-xl">History</p>
            <span class="text-purple-400">See all</span>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl p-5  gap-4 " >
            <span class="material-icons-outlined dark:text-white">mic_none</span>
            <p class="dark:text-white">How can I know I have STI?</p>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl p-5  gap-4 ">
            <span class="material-icons-outlined dark:text-white">sms</span>
            <span class="dark:text-white">Best gynecologist?</span>
          </div>
          <div  class="flex dark:bg-darkgray bg-link-water-50   rounded-xl p-5  gap-4 ">
            <span class="material-icons-outlined dark:text-white">sms</span>
            <span class="dark:text-white">How to wear a condom</span>
          </div>
        </div>
      </div>



    </div>
  </div>
</template>

<style scoped>

</style>
