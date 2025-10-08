<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const backToChatHandler = () => {
  router.push({
    name: 'newChat',
  })
}
</script>

<template>
  <div
    class="dark:bg-lightgray min-h-screen"
    :class="{ 'md:pt-[38px] pt-4': route.name != 'game-page-quiz-result' }"
  >
    <div class="w-10/12 mx-auto">
      <div class="sticky py-4 top-0 bg-white dark:bg-lightgray">
        <button
          @click="backToChatHandler"
          class="btn btn-sm bg-transparent shadow-none border-[1px] dark:border-['#CBD5E1'] rounded-[10px] px-[8px] py-[6px]"
        >
          <span class="dark:text-white text-small">Back to chat</span>
        </button>
      </div>
      <RouterView #default="{ Component, route }">
        <template v-if="Component">
          <component :is="Component" :key="route.fullPath" />
        </template>
      </RouterView>
    </div>
  </div>
</template>

<style scoped></style>
