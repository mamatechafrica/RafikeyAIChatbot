<script setup lang="ts">
import { useRafikeyChatbotStore } from '@/stores'
import { failEffect, fallingConfetti, sideBurstConfetti } from '@/composables/useConfetti.ts'
import { computed, onMounted, ref } from 'vue'
import congratulations from '@/assets/images/well-done.png'
import averagePerformance from '@/assets/images/average-score.png'
import poorPerformance from '@/assets/images/poor-score.jpg'

const remarkStatement = ref('')
const performanceImage = ref('')


const scoreCard = computed(() => chatbotStore.score >= chatbotStore.totalQuestions / 2)
const chatbotStore = useRafikeyChatbotStore()
onMounted(() => {
  if (chatbotStore.gamesConfettiCount === 0) {
    if (scoreCard.value) {
      sideBurstConfetti()
    } else {
      failEffect()
    }
  }

  remarks()
  chatbotStore.gamesConfettiCount += 1
})
const remarks = () => {
  if (chatbotStore.score > chatbotStore.totalQuestions / 2) {
    performanceImage.value = congratulations
    remarkStatement.value = 'Great job! You have a good understanding of the material.'
  } else if (chatbotStore.score < chatbotStore.totalQuestions / 2) {
    performanceImage.value = poorPerformance
    remarkStatement.value = 'Better luck next time! Keep practicing to improve your knowledge.'
  } else {
    performanceImage.value = averagePerformance
    remarkStatement.value = 'Not bad! You have a fair understanding of the material.'
  }
}

// console.log('score', chatbotStore.score)
// console.log('totalQuestion', chatbotStore.quizzes[chatbotStore.quizzes.length - 1].order)
</script>

<template>
  <div
    :class="[!scoreCard ? 'shake' : '']"
    class="flex flex-col justify-center h-[calc(100vh-10.5rem)] items-center"
  >
    <div class="flex justify-center">
      <img src="@/assets/images/video-game.png" alt="video-game-image" />
    </div>
    <div
      class="flex flex-col md:space-y-8 space-y-6 md:py-8 py-4 rounded-[14px] items-center bg-link-water-50 shadow-lg dark:bg-darkgray lg:w-1/3 md:w-2/3 w-full mx-auto"
    >
      <div class="flex  flex-col items-center">
        <img :src="performanceImage" alt="confetti-image" class="w-1/3" />
<!--        <img v-else src="@/assets/images/poor-score.svg" alt="poor-score-image" />-->
        <p class="text-center pb-2 dark:text-white text-2xl font-bold">Your score</p>
        <p class="text-center w-3/4 text-lg">{{ remarkStatement }}</p>
        <p></p>
      </div>
      <!--      <div>-->
      <!--        <img v-if="chatbotStore.score >= (chatbotStore.totalQuestions / 2)" src="@/assets/images/confetti.png" alt="confetti-image" />-->
      <!--        <img v-else src="@/assets/images/poor-score.svg" alt="poor-score-image" />-->
      <!--      </div>-->
      <div>
        <img v-if="scoreCard" src="@/assets/images/confetti.png" alt="confetti-image" />
        <!--        <span class="">&#128542;</span>-->
      </div>

      <div>
        <p class="font-semibold text-extra-large dark:text-white">
          {{ chatbotStore.score }} out of {{ chatbotStore.totalQuestions }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-10px);
  }
  40%,
  80% {
    transform: translateX(10px);
  }
}

.shake {
  animation: shake 0.4s;
}
</style>
