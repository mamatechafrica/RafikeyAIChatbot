 <script setup lang="ts">
 import { computed } from 'vue'
 import imageLight from '@/assets/images/rafikey-icon-light.png'
 import imageDark from '@/assets/images/rafikey-icon-dark.png'
 import { useRafikeyChatbotStore } from '@/stores'


 // const chatbotStore = useRafikeyChatbotStore()
 //
 // const toggleImage = computed(()=>{
 //   return chatbotStore.isDarkMode? imageDark : imageLight
 // })

</script>

<template>
  <div class="h-screen flex  justify-center items-center flex-col py-10 w-full">

      <div class="flex w-full justify-center">
        <img src="@/assets/images/rafikey-icon-light.png" alt="rafikey-logo-image"  class="hidden md:block" />
      </div>
      <div class="flex flex-col items-center py-10 mx-auto lg:w-8/12 xl:w-6/12  w-10/12 bg-lightBackground dark:bg-darkgray rounded-2xl">
        <div class="">
          <p class="text-extra-extra-large-1   text-center font-semibold ">Private & Safe:</p>
        </div>
        <div>
          <img src="@/assets/images/rafikey-lock.png" alt="rafikey-lock image" class="w-50" />
        </div>
        <div class="xl:w-6/12 w-9/12">
          <p class="text-small text-gray-700  text-center flex justify-center ">Everything you share is protected and stays between you and Rafikey</p>
        </div>
        <div class="flex space-x-2">
          <div class="w-8 h-3 rounded-md animate-pulse bg-casablanca-400"></div>
          <div class="w-3 h-3 rounded-full animate-pulse bg-casablanca-200"></div>
          <div class="w-3 h-3 rounded-full animate-pulse bg-casablanca-300"></div>
        </div>
      </div>
  </div>
</template>

<style scoped>

</style>
