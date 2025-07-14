<script setup lang="ts">
import router from '@/router'
import { computed } from 'vue'
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-dark.png'

const isDark = localStorage.getItem('darkMode')
console.log('we have mode', isDark)
const toggleImage = computed(() => {
  return isDark ? imageDark : imageLight
})


</script>

<template>
  <div class="min-h-screen w-full dark:bg-lightgray">
    <div class="md:w-10/12 w-11/12 mx-auto">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-gray-1000 justify-start text-nowrap hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
            <span class="material-icons-outlined dark:text-white  md:text-lg text-sm ">chevron_left</span>
            <span class=" md:text-lg text-sm font-light dark:text-white">Back to Sign Up</span>
          </div>
        </div>
        <div class="flex invisible lg:visible justify-center col-span-1">
          <img :src="toggleImage" alt="rafikey-icon"/>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray xl:w-1/2 w-full mx-auto p-10 rounded-2xl space-y-16 xl:space-y-24">
        <div class="flex justify-center" >
          <h2 class="lg:text-4xl text-lg font-semibold dark:text-white">Privacy Policy</h2>
        </div>
        <div class="flex flex-col items-center text-xl space-y-6">
          <div>
            <p class="md:text-xl text-sm text-black dark:text-white">We follow strict data protection rules (GDPR-compliant)</p>
          </div>
          <div class="flex flex-col items-center">
            <p class="md:text-xl text-sm dark:text-white">To male sure your details stay safe and confidential.</p>
            <p class="text-center md:text-xl text-sm dark:text-white">At Rafikey, your privacy is a top priority. Any information you share is only used to improve your experience and provide the support you need. Wee never share your personal data with anyone without your permission.</p>
          </div>
        </div>
        <div class="w-3/4 mx-auto" >
          <p class="text-center md:text-xl text-sm  text-black dark:text-white">You can learn more about how we collect, use and protect your data by reading our</p>
        </div>
        <div class="flex flex-col items-center">
          <router-link to="/auth/register/privacy-policy-2" class="text-casablanca-500 border-b md:text-xl text-sm border-casablanca-500">Continue</router-link>
<!--          <div class="border-b  border-2 border-gray-500 w-1/4 mx-auto"></div>-->
        </div>


      </div>
    </div>

  </div>

</template>

<style scoped>

</style>
