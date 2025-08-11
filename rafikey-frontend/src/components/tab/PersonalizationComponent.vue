<script setup lang="ts">
import { useToggle, useDark } from '@vueuse/core'
import { useRafikeyChatbotStore } from '@/stores'


const isDark = useDark()
const modeToggleHandler = useToggle(isDark)
const chatbotStore = useRafikeyChatbotStore()
</script>


<template>

    <div class="px-[16px] py-6 flex gap-[20px] justify-between">
      <div>
        <span class="dark:text-white">Theme</span>
      </div>
      <div class="flex flex-col gap-7">
        <button
          @click="modeToggleHandler()"
          :disabled ="!chatbotStore.isDark"
          class="btn  btn-sm  border-none shadow-none disabled:opacity-75  bg-casablanca-300 py-[6px] px-[12px] rounded-full">
          <span class="text-extra-small">Light Mode</span>
        </button>
        <button
          :disabled ="chatbotStore.isDark"
          @click="modeToggleHandler()"
          class="btn  btn-sm  shadow-none bg-transparent border rounded-full border-darkgray dark:border-white py-[6px] px-[12px]">
          <span class="text-extra-small dark:text-white">Dark Mode</span>
        </button>
      </div>
    </div>
    <div class="border-b-[1px] border-veryLightFour dark:border-veryLightFive"></div>

</template>

<style scoped></style>
