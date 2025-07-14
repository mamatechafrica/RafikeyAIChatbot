<script setup lang="ts">
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-dark.png'
import { computed  } from 'vue'

const isDark = localStorage.getItem('darkMode')
console.log("we have mode", isDark)
const toggleImage = computed(()=>{
  return isDark? imageDark : imageLight
})
</script>

<template>
  <div class="h-screen w-full space-y-5 dark:bg-lightgray">
    <div class="flex w-full justify-center ">
      <img :src="toggleImage"  alt="rafikey-logo-image"  class="invisible lg:visible" />
    </div>
    <div class="flex flex-col py-10 items-center mx-auto lg:w-8/12 xl:w-6/12  w-10/12 space-y-12 bg-lightBackground dark:bg-darkgray rounded-2xl">
      <div class="">
        <p class="lg:text-5xl text-xl  text-center font-semibold dark:text-white">Welcome to Rafikey!</p>
      </div>
      <div>
        <img src="@/assets/images/rafikey-bot.png" alt="rafikey-image"  class="w-20 lg:w-40"/>
      </div>
      <div class="xl:w-6/12 w-9/12">
        <p class="lg:text-xl text-sm text-gray-700 text-center flex justify-center dark:text-white">
          Rafikey is your safe, private space to talk, learn and ask about anything related to your
          body, relationship, mental health and more.
        </p>
      </div>
      <div class="flex space-x-2">
        <div class="w-8 h-3 rounded-md animate-pulse dark:bg-casablanca-400"></div>
        <div class="w-3 h-3 rounded-full animate-pulse dark:bg-casablanca-200"></div>
        <div class="w-3 h-3 rounded-full animate-pulse dark:bg-casablanca-300"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
