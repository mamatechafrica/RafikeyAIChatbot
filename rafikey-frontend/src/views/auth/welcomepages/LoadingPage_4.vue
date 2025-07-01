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
  <div class="h-screen w-full space-y-5">
    <div class="flex w-full justify-center">
      <img src="@/assets/images/rafikey-icon.png" alt="rafikey-logo-image" />
    </div>
    <div class="flex flex-col items-center mx-auto w-10/12 space-y-12 ">
      <div class="ps-10">
        <p class="lg:text-3xl text-2xl font-semibold">Private & Safe:</p>
      </div>
      <div>
        <img src="@/assets/images/rafikey-lock.png" alt="rafikey-lock image" />
      </div>
      <div class="w-4/12">
        <p class="lg:text-xl text-lg text-gray-700  text-center flex justify-center ">Everything you share is protected and stays between you and Rafikey</p>
      </div>

    </div>

  </div>
</template>

<style scoped>

</style>
