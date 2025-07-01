 <script setup lang="ts">

 import { computed } from 'vue'
 import imageDark from '@/assets/images/rafikey-icon-black.png'
 import imageLight from '@/assets/images/rafikey-icon.png'

 const isDark = localStorage.getItem('darkMode')
 console.log("we have mode", isDark)
 const toggleImage = computed(()=>{
   return isDark? imageDark : imageLight
 })

</script>

<template>
  <div class="h-screen w-full space-y-5 dark:bg-lightgray ">
    <div class="flex w-full justify-center">
      <img :src="toggleImage" alt="rafikey-logo-image"  class="invisible lg:visible" />
    </div>
    <div class="flex flex-col items-center py-10 mx-auto lg:w-8/12 xl:w-6/12  w-10/12 space-y-12 bg-lightBackground dark:bg-darkgray rounded-2xl">
      <div class="ps-10">
        <p class="text-3xl  font-semibold dark:text-white">Private & Safe:</p>
      </div>
      <div>
        <img src="@/assets/images/rafikey-lock.png" alt="rafikey-lock image" />
      </div>
      <div class="xl:w-6/12 w-9/12">
        <p class="lg:text-xl text-lg dark:text-white text-gray-700  text-center flex justify-center ">Everything you share is protected and stays between you and Rafikey</p>
      </div>
      <div class="flex space-x-2">
        <div class="w-8 h-3 rounded-md animate-pulse dark:bg-casablanca-400"></div>
        <div class="w-3 h-3 rounded-full animate-pulse dark:bg-casablanca-200"></div>
        <div class="w-3 h-3 rounded-full animate-pulse dark:bg-casablanca-300"></div>
      </div>

    </div>

  </div>
</template>

<style scoped>

</style>
