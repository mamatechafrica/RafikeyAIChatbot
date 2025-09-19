<script setup lang="ts">

import { toggleImage } from '@/modules/imageToggle.ts'
</script>
<template>
  <div class="h-screen w-full dark:bg-lightgray ">
    <div class="flex justify-center items-center h-full  ">
      <img :src="toggleImage()" alt="rafikey-icon" class="w-40 lg:w-60"/>
    </div>
  </div>
</template>

<style scoped>

</style>
