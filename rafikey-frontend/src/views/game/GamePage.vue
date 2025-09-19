<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

    <div class="dark:bg-lightgray h-screen pt-[38px]">
      <div class="w-10/12 mx-auto space-y-4">
        <div>
          <button
            @click="router.go(-1)"
            class="btn btn-sm bg-transparent shadow-none border-[1px] dark:border-['#CBD5E1'] rounded-[10px] px-[8px] py-[6px]"
          >
            <span class="dark:text-white text-small">Back to chat</span>
          </button>
        </div>
        <RouterView #default="{Component, route}">
          <template v-if="Component">
            <component :is="Component" :key="route.fullPath" />
          </template>

        </RouterView>
      </div>


  </div>

</template>

<style scoped></style>
