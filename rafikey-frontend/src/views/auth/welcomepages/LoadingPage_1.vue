<script setup lang="ts">
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-black.png'
import { computed  } from 'vue'

const isDark = localStorage.getItem('darkMode')
console.log("we have mode", isDark)
const toggleImage = computed(()=>{
  return isDark? imageDark : imageLight
})
</script>

<template>
  <div class="h-screen w-full ">
    <div class="flex justify-center items-center h-full dark:bg-darkgray ">
      <img :src="toggleImage" alt="rafikey-icon"/>
    </div>
  </div>
</template>

<style scoped>

</style>
