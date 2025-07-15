<script setup lang="ts">
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { computed  } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'


const chatbotStore = useRafikeyChatbotStore()
const toggleImage = computed(()=>{
  return chatbotStore.isDarkMode?  imageDark: imageLight
})
</script>

<template>
  <div class="h-screen w-full ">
    <div class="flex justify-center items-center h-full dark:bg-darkgray ">
      <img :src="toggleImage" alt="rafikey-icon" class="w-40 lg:w-60"/>
    </div>
  </div>
</template>

<style scoped>

</style>
