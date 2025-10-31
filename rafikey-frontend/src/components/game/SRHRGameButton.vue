<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const emits = defineEmits<{
  (event: 'closeGameButton'): void
}>()

const closePLayButton = () => {
  emits('closeGameButton')
}

const goToPlayPage = () => {
  router.push({
    name: 'welcome-page-quiz',
  })
}
</script>

<template>
  <div
    class="dark:bg-darkgray bg-white space-y-2 border-[1px] px-4 py-8 pb-[20px] rounded-[20px] dark:border-lightgrayThree"
  >
    <div class="flex justify-between">
      <div>
        <p class="dark:text-white text-small">Let's have fun</p>
      </div>
      <div class="flex justify-center">
        <!--      <button @click="closePLayButton" class="btn btn-sm btn-ghost bg-transparent border-none shadow-none w-[25px] h-[25px]">-->
        <!--        <span class="material-icons-outlined dark:text-veryLightSeven">cancel</span>-->
        <!--      </button>-->
      </div>
    </div>
    <div class="flex justify-center">
      <div
        class="bg-casablanca-300 rounded-full  flex justify-center items-center"
      >
        <img src="@/assets/images/game.png" alt="game-image" />
      </div>
    </div>
    <div class="space-y-2">
      <div>
        <p class="dark:text-white text-extra-small">Time for yet another fun session</p>
      </div>
      <div class="w-full">
        <button
          @click="goToPlayPage"
          class="btn btn-sm btn-ghost rounded-lg hover:scale-105 transition-all duration-300 ease-in-out w-full bg-casablanca-300"
        >
          <span class="text-extra-small">Play</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
