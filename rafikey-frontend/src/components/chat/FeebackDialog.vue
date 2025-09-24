<script setup lang="ts">
import EmojiAngered from '@/assets/images/emoji-angered.png'
import EmojiSucks from '@/assets/images/emoji-sucks.png'
import EmojiHappy from '@/assets/images/emoji-happy.png'
import EmojiVeryHappy from '@/assets/images/emoji-loveit.png'
import EmojiNeutral from '@/assets/images/emoji-neutral.png'
import { ref } from 'vue'
import { useNotificationStore, useRafikeyChatbotStore } from '@/stores'

interface FeedbackContent {
  id: number
  emoji: string
  text: string
}

export interface Feedback {
  emoji: string
  comment: string | ''
}

const chatbotStore = useRafikeyChatbotStore()
const feedback = ref<string>('')
const feedbackContent = [
  {
    id: 1,
    emoji: '😡',
    text: 'Awful',
  },
  {
    id: 2,
    emoji: '😤',
    text: 'Sucks',
  },
  {
    id: 3,
    emoji: '🙂',
    text: 'Okay',
  },
  {
    id: 4,
    emoji: '😍',
    text: 'I like it',
  },
  {
    id: 5,
    emoji: '😍',
    text: 'Love it',
  },
] as FeedbackContent[]
const activeEmoji = ref<FeedbackContent>()
const emojiHandler = (id: Number) => {
  activeEmoji.value = feedbackContent.find((em) => em.id === id)
}

const emits = defineEmits<{
  (event: 'closeFeedbackDialog'): void
}>()

const closeFeedbackDialog = () => {
  emits('closeFeedbackDialog')
}

const notificationStore = useNotificationStore()
const isLoading = ref(false)

const sendFeedbackHandler = () => {
  const payload = {
    emoji: activeEmoji.value?.emoji as string,
    comment: feedback.value,
  }
  isLoading.value = true
  chatbotStore
    .ratingFeedback(payload)
    .then((res) => {
      console.log('Feedback response: ', res)
      if (res?.result === 'ok') {
        notificationStore.addNotification('Feedback sent successfully', 'success')
        closeFeedbackDialog()
      } else{
        notificationStore.addNotification('Failed to send feedback, please retry', 'error')
      }
    })
    .catch((err) => {
      notificationStore.addNotification('Error sending feedback, please retry', 'error')
      console.error('Error sending feedback: ', err)
    })
    .finally(()=>{
      isLoading.value = false
    })
}
</script>

<template>
  <div
    class="z-50 dark:bg-darkgray bg-white space-y-4 border-[1px] px-[20px] pt-[27px] pb-[20px] rounded-[20px] dark:border-lightgrayThree"
  >
    <div class="flex justify-between space-x-12">
      <div>
        <p class="dark:text-white text-small">Share Your Thoughts</p>
      </div>
      <div class="flex justify-center">
        <button
          @click="closeFeedbackDialog"
          class="btn btn-sm btn-ghost bg-transparent border-none shadow-none w-[25px] h-[25px]"
        >
          <span class="material-icons-outlined dark:text-veryLightSeven">cancel</span>
        </button>
      </div>
    </div>
    <div>
      <p class="dark:text-white">Rate your experience</p>
    </div>

    <div class="flex gap-5">
      <div v-for="emotion in feedbackContent" :key="emotion.id" class="">
        <div
          @click="emojiHandler(emotion.id)"
          :class="[
            activeEmoji?.id === emotion.id
              ? 'bg-button-light dark:opacity-50'
              : 'bg-gray-100 dark:bg-veryLightNine ',
          ]"
          class="cursor-pointer rounded-full w-12 h-12 flex justify-center items-center"
        >
          <span class="text-xl">{{ emotion.emoji }}</span>
        </div>
        <div class="flex justify-center">
          <span
            v-if="activeEmoji?.id === emotion.id"
            class="text-center text-sm text-button-light"
            >{{ activeEmoji.text }}</span
          >
        </div>
      </div>
    </div>
    <!--descriptive feedback section-->
    <div>
      <label class="dark:text-white text-small">Comment (Optional)</label>

      <!--      <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>-->
      <textarea
        v-model="feedback"
        id="message"
        rows="4"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-[12px] border-[0.5px] border-lightgrayThree dark:bg-lightgrayThree dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        placeholder="Leave a comment..."
      ></textarea>
    </div>
    <div class="w-full">
      <button
        :style="!activeEmoji? 'opacity:0.4; pointer-events:none;' : ''"
        @click="sendFeedbackHandler" class="w-full bg-button-light rounded-[12px] p-2">
        <span v-if="!isLoading" class="text-extra-small">Share Feedback</span>
        <span v-else class="loading loading-spinner loading-sm"></span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
