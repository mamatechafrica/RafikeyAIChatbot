<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'
import { useRouter } from 'vue-router'

interface Option {
  id: number
  text: string
  is_correct: boolean
}
interface QuestionItem {
  id: number
  text: string
  quiz_id: number
  options: Option[]
}

export interface Answer {
  questionId: number
  optionId: number
}
const emits = defineEmits<{
  (event: 'errorQuestion', value: boolean): void
  (event: 'selectedAnswer', value: Answer): void
}>()

const props = defineProps<{
  isLoadingAnswer: boolean
}>()
const chatbotStore = useRafikeyChatbotStore()
const questionItem = ref<QuestionItem>()
const isError = ref(false)
const isLoading = ref(true)

const isCorrectAnswer = ref<boolean | null>(null)
const correctAnswers = ref<number[]>([])
watch(
  () => props.isLoadingAnswer,
  (newVal) => {
    if (!newVal) {
      if (chatbotStore.correctAnswer?.correct) {
        isCorrectAnswer.value = true
      } else {
        questionItem.value?.options.map((option) => {
          if (option.is_correct) {
            correctAnswers.value.push(option.id)
          }
        })
      }
    }
  },
)
const getQuestionAndChoices = (value: number) => {
  // chatbotStore.correctAnswer = {
  //   correct: null,
  //   feedback: '',
  // }
  chatbotStore
    .getQuestion(value)
    .then((data) => {
      if (data?.result === 'ok') {
        questionItem.value = data.data
      } else {
        console.log('Error fetching question')
        isError.value = true

        return
      }
    })
    .catch(() => {
      isError.value = true
    })
    .finally(() => {
      isLoading.value = false
      emits('errorQuestion', isError.value)
    })
}
onMounted(() => {
  getQuestionAndChoices(chatbotStore.quizzes[0].id)
})

const selectedOptionId = ref<number | null>(null)
const answerHandler = (optionId: number) => {
  selectedOptionId.value = optionId
  chatbotStore.isSelected = true
  emits('selectedAnswer', { questionId: chatbotStore.quizzes[0].id, optionId: optionId })
}

watch(
  () => chatbotStore.quizzes.length,
  (newLength) => {
    if (newLength) {
      getQuestionAndChoices(chatbotStore.quizzes[0].id)
    }
  },
)
</script>

<template>
  <div v-if="!isLoading">
    <div v-if="!isError && questionItem" class="space-y-4">
      <p class="text-center pb-2 dark:text-lightgrayOne text-extra-extra-small">
        Select one option
      </p>
      <div
        @click.stop="answerHandler(option.id)"
        v-for="option in questionItem.options"
        :key="option.id"
        :style="chatbotStore.isSelected ? 'pointer-events: none;' : ''"
        :class="[
          chatbotStore.correctAnswer?.correct && selectedOptionId === option.id
            ? 'bg-greenButtonGame'
            : '',
          !chatbotStore.correctAnswer?.correct && correctAnswers.includes(option.id)
            ? 'bg-greenButtonGame'
            : '',
          !chatbotStore.correctAnswer?.correct && selectedOptionId === option.id
            ? 'bg-coral-red-700'
            : '',
          chatbotStore.isSelected ? ' cursor-not-allowed' : '',
        ]"
        class="cursor-pointer border-lightgrayThree flex justify-center p-3 border-[1px] rounded-[12px]"
      >
        <p class="text-extra-small dark:text-white">{{ option.text }}</p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center">
      <div class="w-20 flex justify-center">
        <img src="@/assets/images/no-data.svg" alt="no-data-image" />
      </div>
      <span class="dark:text-white pt-2">Unable to load data</span>
    </div>
  </div>

  <div v-else class="text-center dark:text-white">Loading...</div>
</template>

<style scoped></style>
