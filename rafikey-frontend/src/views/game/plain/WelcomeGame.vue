<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'
// import {type  RadioGroup } from '@/components/chat/RadioGroup.vue'
import RadioGroup from '@/components/chat/RadioGroup.vue'

const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()

const quizCategory = ref<RadioButton[]>([])
interface RadioButton {
  name: string
  id: number
}
interface Data {
  title: string
  id: number
  description?: string
}
const isCategory = ref(false)
const isError = ref(false)
const selectedCategory = ref()

onMounted(() => {
  chatbotStore
    .getQuizCategory()
    .then((data) => {
      console.log('Quiz Categories: ', data)
      if (data?.result === 'ok') {
        data.data.map((category: Data) => {
          console.log('Category: ', category)
          quizCategory.value?.push({
            name: category.title,
            id: category.id,
          })
        })
        isCategory.value = true
        console.log('Category', quizCategory.value)
      } else {
        isError.value = true
      }
    })
    .catch((error) => {
      isError.value = true
      console.error('Error fetching quiz categories: ', error)
    })
})
const selectedRadio = (value: RadioButton) => {
  selectedCategory.value = value.id
  chatbotStore.score = 0
  chatbotStore.totalQuestions = 0
  chatbotStore
    .getQuizzes(value.id)
    .then((data) => {
      if (data?.result === 'ok') {
        chatbotStore.setQuiz(data.data)
      } else {
        return
      }
    })
    .catch((error) => {
      isError.value = true
      console.error('Error fetching quizzes: ', error)
    })
}
const startGame = () => {
  router.push({
    name: 'game-page-quiz',
    params: { quizCategory: selectedCategory?.value },
  })
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center space-y-12 pt-10">
      <div class="flex flex-col items-center">
        <p class="dark:text-white text-small md:text-extra-extra-large-1">RAFIKEY</p>
        <p class="dark:text-white text-small md:text-extra-extra-large-1">Play and Learn</p>
      </div>
      <div class="relative">
        <div
          class="flex flex-col dark:bg-darkgray bg-link-water-50 space-y-4 items-center border-[1px] md:w-[419px] dark:border-veryLightEight rounded-[14px] py-[27px] px-[33px]"
        >
          <div class="flex flex-col space-y-5 items-center">
            <p class="dark:text-white text-small md:text-[20px]">Trivia</p>
            <p class="dark:text-white text-small md:text-[20px]">Test your knowledge and learn</p>
          </div>
          <div class="w-full flex justify-center">
            <button
              @click="startGame"
              :disabled="!selectedCategory"
              :class="[!selectedCategory ? 'bg-gray-400 cursor-not-allowed' : 'bg-casablanca-300 hover:scale-105', 'transition-all duration-300 ease-in-out']"
              class="btn btn-sm py-4 px-10 rounded-[12px]  shadow-none border-none"
            >
              <span class="text-extra-small">Start Game</span>
            </button>
          </div>
        </div>
        <div class="absolute -top-14 -left-10">
          <img src="@/assets/images/video-game.png" alt="video-game-image" />
        </div>
      </div>
      <div
        v-if="!isError && quizCategory"
        class="flex flex-wrap space-y-2 justify-center w-full gap-2"
      >
        <p class="dark:text-white">Select Quiz Game to Play</p>
        <RadioGroup :radio-type="quizCategory" @change="selectedRadio" />
      </div>
      <div v-else class="flex flex-col">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-coral-red-600">error</span>
          <p class="dark:text-white">Unable to load please reload</p>
        </div>
      </div>
      <div class="md:w-2/5 pt-10">
        <p class="text-center dark:text-white text-small">
          Explore fun and interactive games that test your knowledge, challenge your skills and help
          you learn in exciting new ways.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
