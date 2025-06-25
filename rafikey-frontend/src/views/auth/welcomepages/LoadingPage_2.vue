<script setup lang="ts">

import LoadingSpinner from '@/views/auth/welcomepages/LoadingSpinner.vue'
</script>

<template>
  <div class="h-screen w-full space-y-5">
    <div class="flex w-full justify-center">
      <img src="@/assets/images/rafikey-icon.png" alt="rafikey-logo-image" />
    </div>
    <div class="flex flex-col items-center mx-auto w-10/12 space-y-12 ">
      <div class="ps-10">
        <p class="lg:text-5xl text-2xl font-semibold">Welcome to Rafikey!</p>
      </div>
      <div>
        <img src="@/assets/images/rafikey-bot.png" alt="rafikey-image" />
      </div>
      <div class="w-4/12">
        <p class="lg:text-xl text-lg text-gray-700  text-center flex justify-center ">Rafikey is your safe, private space to talk, learn and ask about anything related to your
          body, relationship, mental health and more.</p>
      </div>

    </div>

  </div>

</template>

<style scoped>

</style>
