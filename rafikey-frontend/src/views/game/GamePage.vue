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
    :class="{ 'pt-[38px]': route.name != 'game-page-quiz-result' }"
  >
    <div class="w-10/12 mx-auto space-y-4">
      <div class="sticky top-10">
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
