<script setup lang="ts">

import { useRouter } from 'vue-router'


const router = useRouter()
const goBackHome = () =>{
  router.push({
    name: 'guest-page',
  })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-32 px-2 dark:bg-lightgray">
    <div class="space-y-4 flex flex-col items-center">
      <div
        class="border-[1px] rounded-[11px] w-fit px-4 py-2 border-darkgray flex flex-col items-center"
      >
        <p class="text-small font-semibold dark:text-white ">OOPS!</p>
        <P class="text-extra-extra-large-2 dark:text-white ">404 - ERROR</P>
      </div>
      <div class="border-[1px] rounded-[20px] px-4 py-2 dark:border-stone-300 border-darkgray">
        <p class="text-[64px] dark:text-white font-semibold">PAGE NOT FOUND</p>
      </div>

      <div class="mt-4">
        <button
          @click="goBackHome"
          class="btn rounded-[11px] shadow-none border-none  bg-casablanca-300 btn-sm md:btn-md lg:btn-lg xl:btn-xl normal-case"
        >
          <span class="lg:text-small text-extra-extra-small ">Go back home</span>
        </button>
      </div>
    </div>

    <div class="fixed bottom-3 space-y-4">
      <div class="flex justify-center">
        <img alt="rafikey-image" src="@/assets/images/rafikey-hi.png" />
      </div>

      <div>
        <p class="text-extra-extra-small dark:text-stone-300 text-lightgrayTwo tracking-[-0.7%]">
          Rafikey provides helpful response, but it may not always be 100% accurate.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
