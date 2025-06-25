<script setup lang="ts">

import router from '@/router'

</script>

<template>
  <div class="h-screen w-full  ">
    <div class="w-10/12 mx-auto">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white">
        <div class="col-span-1 flex flex-col justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
            <span class="material-icons-outlined">chevron_left</span>
            <span class="lg:text-lg text-sm font-light">Back to Sign Up</span>
          </div>
        </div>
        <div class="flex invisible lg:visible justify-center col-span-1">
          <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon"/>
        </div>
      </div>
      <div class="bg-gray-100 xl:w-1/2 w-full mx-auto p-10 rounded-2xl space-y-16 xl:space-y-24">
        <div class="flex justify-center" >
          <h2 class="lg:text-4xl text-lg font-semibold">Privacy Policy</h2>
        </div>
        <div class="flex flex-col items-center text-xl space-y-6">
          <div>
            <p class="lg:text-xl text-lg text-black">We follow strict data protection rules (GDPR-compliant)</p>
          </div>
          <div class="flex flex-col items-center">
            <p class="text-center lg:text-xl text-lg">To male sure your details stay safe and confidential.</p>
            <p class="text-center lg:text-xl text-lg">At Rafikey, your privacy is a top priority. Any information you share is only used to improve your experience and provide the support you need. Wee never share your personal data with anyone without your permission.</p>
          </div>
        </div>
        <div class="w-3/4 mx-auto" >
          <p class="text-center lg:text-xl text-lg text-black">You can learn more about how we collect, use and protect your data by reading our</p>
        </div>
        <div class="flex flex-col items-center">
          <router-link to="/auth/privacy-policy-2" class="text-casablanca-500 border-b text-xl border-casablanca-500">Continue</router-link>
<!--          <div class="border-b  border-2 border-gray-500 w-1/4 mx-auto"></div>-->
        </div>


      </div>
    </div>

  </div>

</template>

<style scoped>

</style>
