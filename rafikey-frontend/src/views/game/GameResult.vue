<script setup lang="ts">
import { useRafikeyChatbotStore } from '@/stores'

const chatbotStore = useRafikeyChatbotStore()
// console.log('score', chatbotStore.score)
// console.log('totalQuestion', chatbotStore.quizzes[chatbotStore.quizzes.length - 1].order)
</script>

<template>
  <div class="flex flex-col justify-center h-[calc(100vh-10.5rem)] items-center">
    <div class="flex justify-center">
      <img src="@/assets/images/video-game.png" alt="video-game-image" />
    </div>
    <div
      class="flex flex-col md:space-y-8 space-y-6 md:py-8 py-4 rounded-[14px] items-center bg-link-water-50 shadow-lg dark:bg-darkgray lg:w-1/3 md:w-2/3 w-full mx-auto"
    >
      <div>
        <p class="dark:text-white">Your score</p>
      </div>
      <!--      <div>-->
      <!--        <img v-if="chatbotStore.score >= (chatbotStore.totalQuestions / 2)" src="@/assets/images/confetti.png" alt="confetti-image" />-->
      <!--        <img v-else src="@/assets/images/poor-score.svg" alt="poor-score-image" />-->
      <!--      </div>-->
      <div>
        <img src="@/assets/images/confetti.png" alt="confetti-image" />
      </div>

      <div>
        <p class="font-semibold text-extra-large dark:text-white">
          {{ chatbotStore.score }} / {{ chatbotStore.totalQuestions }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
