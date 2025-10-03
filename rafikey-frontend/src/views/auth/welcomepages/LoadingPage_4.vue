 <script setup lang="ts">
 import { computed } from 'vue'
 import imageLight from '@/assets/images/rafikey-icon-light.png'
 import imageDark from '@/assets/images/rafikey-icon-dark.png'
 import { useRafikeyChatbotStore } from '@/stores'
 import { toggleImage } from '@/modules/imageToggle.ts'
 import AuthLoadingButtons from '@/components/chat/AuthLoadingButtons.vue'


 // const chatbotStore = useRafikeyChatbotStore()
 //
 // const toggleImage = computed(()=>{
 //   return chatbotStore.isDarkMode? imageDark : imageLight
 // })

</script>

<template>
  <div class="min-h-screen  dark:bg-lightgray flex  justify-center items-center flex-col py-10 w-full">

    <div class=" md:flex hidden  justify-start items-center">
      <img :src='toggleImage()' alt="rafikey-logo" class="w-44"  />
    </div>
      <div class=" w-10/12 mx-auto space-y-4  flex flex-col items-center py-10 bg-lightBackground dark:bg-darkgray rounded-2xl">
        <div class="">
          <p class="text-extra-extra-large-1   text-center font-semibold dark:text-white ">Private & Safe:</p>
        </div>
        <div>
          <img src="@/assets/images/rafikey-lock.png" alt="rafikey-lock image" class="w-50" />
        </div>
        <div class="xl:w-6/12 w-9/12">
          <p class="text-small text-gray-700  dark:text-white text-center flex justify-center ">Everything you share is protected and stays between you and Rafikey</p>
        </div>
        <AuthLoadingButtons />
      </div>
  </div>
</template>

<style scoped>

</style>
