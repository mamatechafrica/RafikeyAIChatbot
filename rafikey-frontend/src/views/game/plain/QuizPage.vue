<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'
import QuestionItem, { type Answer } from '@/components/game/QuestionItem.vue'
import { useRouter } from 'vue-router'

const chatbotStore = useRafikeyChatbotStore()
// const props = defineProps<{
//   quizCategory: string
// }>()

const isError = ref(false)
const isErrorQuestion = ref(false)
const errorQuestion = (value: boolean) => {
  isErrorQuestion.value = value
}

// onMounted(() => {
//   chatbotStore
//     .getQuizzes(Number(props.quizCategory))
//     .then((data) => {
//       if (data?.result === 'ok') {
//         chatbotStore.setQuiz(data.data)
//       } else {
//         return
//       }
//     })
//     .catch((error) => {
//       isError.value = true
//       console.error('Error fetching quizzes: ', error)
//     })
// })



const moveNextQuestion = ref(false)

const isLoading = ref(false)
const isErrorLoadingAnswer = ref(false)

const selectedAnswer = (value: Answer) => {
  chatbotStore
    .answerQuestion(value)
    .then((res) => {
      isLoading.value = true
      chatbotStore.totalQuestions += 1
      if (res?.result === 'ok') {
        if(res.data?.correct){
          chatbotStore.score += 1
        }
        chatbotStore.setCorrectAnswer(res.data)
        moveNextQuestion.value = true
      } else {
        isErrorLoadingAnswer.value = true
      }
    })
    .catch((error) => {
      isErrorLoadingAnswer.value = true
      console.error('Error submitting answer: ', error)
    })
    .finally(() => {
      isLoading.value = false
    })
}
const removeFirstQuestion = () => {
  chatbotStore.quizzes.shift()
  chatbotStore.isSelected = false
}
const skipQuestionHandler = () => {
  removeFirstQuestion()
  chatbotStore.totalQuestions += 1
}

const moveNextQuestionHandler = () => {
  removeFirstQuestion()
  moveNextQuestion.value = false
  chatbotStore.correctAnswer = {
    correct: null,
    feedback: '',
  }
}
const router = useRouter()
watch(
  () => chatbotStore.quizzes,
  (newVal) => {
    if (newVal.length === 0) {
      router.push({
        name: 'game-page-quiz-result',
      })
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="pb-4" v-if="chatbotStore.quizzes.length">
      <div class="flex justify-center">
        <img src="../../../assets/images/video-game.png" alt="video-game-image" />
      </div>

      <!--      <div class="dark:bg-darkgray rounded-[12px] py-2 w-44 flex justify-center">-->
      <!--        <span class="text-greenTime text-extra-small">20.00s</span>-->
      <!--      </div>-->
    </div>
    <div
      v-if="!isError && chatbotStore.quizzes.length"
      class="xl:w-1/3 md:w-2/3 w-full dark:bg-transparent bg-link-water-50 dark:border-veryLightEight py-[27px] px-[33px] border-[1px] rounded-[14px]"
    >
      <div class="space-y-8">
        <div class="flex justify-center">
          <p class="font-bold text-small md:text-[20px] dark:text-white">
            Question {{ chatbotStore.quizzes[0].order }} of
            {{ chatbotStore.quizzes[chatbotStore.quizzes.length - 1].order }}
          </p>
        </div>
        <div class="flex justify-center">
          <p class="font-bold text-small md:text-[20px] dark:text-white">
            {{ chatbotStore.quizzes[0].text }}
          </p>
        </div>
        <div>
          <QuestionItem
            @error-question="errorQuestion"
            @selected-answer="selectedAnswer"
            :isLoadingAnswer="isLoading"
          />
        </div>
      </div>
      <!--      explanation if answer is wrong -->
      <div v-if="chatbotStore.correctAnswer?.correct === false" class="w-full pt-4 space-y-4">
        <p class="text-coral-red-700">Oops! That's not it</p>
        <p class="dark:text-white">{{ chatbotStore.correctAnswer?.feedback }}</p>
      </div>
    </div>
    <div class="py-6" v-if="chatbotStore.quizzes.length > 0 && !isErrorQuestion">
      <button
        v-if="!moveNextQuestion"
        @click="skipQuestionHandler"
        class="btn btn-sm dark:bg-transparent bg-button-light text-extra-small shadow-none dark:text-white py-5 px-20 btn-ghost dark:bg-darkgray rounded-[12px] border-casablanca-300 borer-[1px]"
      >
        <span>Skip</span>
      </button>
      <button
        v-else
        @click="moveNextQuestionHandler"
        class="btn btn-sm dark:bg-transparent bg-button-light text-extra-small shadow-none dark:text-white py-5 px-20 btn-ghost dark:bg-darkgray rounded-[12px] border-casablanca-300 borer-[1px]"
      >
        <span>Next</span>
      </button>
    </div>
    <div  v-if="chatbotStore.quizzes.length === 0" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <div

        class="flex flex-col md:space-y-8 space-y-6 md:py-8 py-4 items-center    mx-auto"
      >
        <img src="@/assets/images/no-data.svg" alt="no-question-image" class="w-1/3 " />
        <div class="flex flex-col items-center">
          <span class=" dark:text-white text-center text-extra-large">You are done!</span>
          <span class="dark:text-white text-small">No more questions</span>
        </div>

      </div>
      <div>
        <button></button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
