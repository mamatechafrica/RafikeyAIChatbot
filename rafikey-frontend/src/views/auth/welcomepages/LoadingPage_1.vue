<script setup lang="ts">
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { computed  } from 'vue'

const isDark = localStorage.getItem('darkMode')
console.log("we have mode", isDark)
const toggleImage = computed(()=>{
  console.log(isDark)
  console.log( isDark? imageDark : imageLight)
  return isDark?  imageDark: imageLight
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
