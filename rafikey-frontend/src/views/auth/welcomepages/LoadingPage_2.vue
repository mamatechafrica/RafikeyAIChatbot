<script setup lang="ts">
import { toggleImage } from '@/composables/imageToggle.ts'
import AuthLoadingButtons from '@/components/chat/AuthLoadingButtons.vue'

</script>

<template>
  <div
    class="min-h-screen flex justify-center md:block flex-col w-full space-y-5 dark:bg-lightgray"
  >
    <div class=" md:flex hidden justify-center  items-center">
      <img :src='toggleImage()' alt="rafikey-logo" class="w-44"  />
    </div>
    <div class="relative w-11/12 mx-auto ">
      <div
        class="flex flex-col dark:bg-darkgray pt-24 pb-10 items-center mx-auto w-[calc(100%-3.75rem)] lg:w-[calc(100%-5rem)] col-span-2  space-y-10 bg-lightBackground rounded-2xl"
      >
        <div class="">
          <p class="lg:text-[35.33px] text-[30px] text-center font-semibold dark:text-white">
            Welcome to Rafikey!
          </p>
        </div>
        <div class="flex justify-center">
          <img src="@/assets/images/rafikey-bot.png" alt="rafikey-image" class="lg:w-full w-1/2" />
        </div>
        <div class="xl:w-6/12 w-9/12">
          <p class="text-small text-gray-700 dark:text-white text-center flex justify-center">
            Rafikey is your safe, private space to talk, learn and ask about anything related to your
            body, relationship, mental health and more.
          </p>
        </div>
        <AuthLoadingButtons />
      </div>
<!--      <div  @click="moveNext" class="cursor-pointer dark:bg-darkgray flex  absolute right-1  top-1/2  rounded-sm -translate-y-1/2">-->
<!--        <span class="material-icons-outlined dark:text-white">keyboard_arrow_right</span>-->
<!--      </div>-->
    </div>


  </div>
</template>

<style scoped></style>
