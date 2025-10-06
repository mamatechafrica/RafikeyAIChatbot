<script setup lang="ts">
import router from '@/router'
import { useRafikeyChatbotStore } from '@/stores'
import { toggleImage } from '@/modules/imageToggle.ts'

const chatbotStore = useRafikeyChatbotStore()
</script>

<template>
  <div class=" w-full dark:bg-lightgray min-h-screen">
    <div class="xl:w-2/5 md:w-4/5 w-10/12 pb-10 mx-auto ">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white  dark:bg-lightgray">
        <div class="col-span-1 flex flex-col items-start md:justify-end md:pt-0 pt-12">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-gray-1000 justify-start text-nowrap hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
          >
            <span class="material-icons-outlined dark:text-white md:text-lg text-sm"
              >chevron_left</span
            >
            <span
              v-if="chatbotStore.isShowTermsButton"
              class="text-extra-extra-small font-light dark:text-white"
              >Back to Sign Up</span
            >
            <span v-else class="!text-extra-extra-small font-light dark:text-white"
              >Back to Chats</span
            >
          </div>
        </div>
        <div class="flex md:visible invisible w-full md:justify-center justify-end col-span-2 md:col-span-1">
          <img :src="toggleImage()" alt="rafikey-icon" class="md:w-60 w-40" />
        </div>
      </div>
      <div
        class="bg-gray-100 dark:bg-darkgray w-full mx-auto px-10 py-10 rounded-[34px] sm:space-y-4 md:space-y-12 lg:space-y-6"
      >
        <div class="flex justify-center pb-10">
          <h2
            class="md:text-extra-extra-large-1 sm:text-large text-extra-small font-semibold dark:text-white"
          >
            Terms of Use
          </h2>
        </div>
        <div class="flex flex-col items-center text-xl md:space-y-10 space-y-4">
          <div class="flex flex-col">
            <p class="md:text-large sm:text-small text-extra-small dark:text-white leading-6 mb-2">
              Here’s a quick guide to how we keep this space safe and supportive:
            </p>
              <ul class="list-disc md:pl-6 pl-4 space-y-1">
                <li class="md:text-large text-extra-small"><strong>Respect:</strong> Be kind. No bullying, hate speech, or harmful content.</li>
                <li class="md:text-large text-extra-small"><strong>Safe Space:</strong> Rafikey shares information, games, and referrals—but it’s not a substitute for medical, legal, or emergency help.</li>
                <li class="md:text-large text-extra-small"><strong>Your Choice:</strong> You’re always in control of what you click, share, or explore.</li>
              </ul>
            <p class="md:text-large sm:text-small text-extra-small text-black dark:text-white leading-6 mt-2">
              Please take a moment to read the full Terms of Use carefully to understand your rights, 
              responsibilities, and how we protect your experience.
            </p>
          </div>
        </div>
        <div class="flex flex-col items-center py-4 md:py-10">
          <router-link
            to="/auth/register/terms-of-service"
            class="text-casablanca-500 border-b md:text-small sm:text-small text-extra-small border-casablanca-500"
            >Continue</router-link
          >
          <!--          <div class="border-b  border-2 border-gray-500 w-1/4 mx-auto"></div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>