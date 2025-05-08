<script setup lang="ts">
import {computed, onMounted} from "vue";

export interface UserBubbleProps  {
  userName: string
  userMessage: string
  createdAt: string
  isTyping?: boolean
  isCopyable?: boolean
  hasError?: boolean
  picture?: string
  isGeneratingResponse: boolean
}

onMounted(() => {
  console.log('User bubble message', props.userMessage)
})

const props = defineProps<UserBubbleProps>()
const hasText = computed(() => {
  return props.userMessage.length > 0
})

</script>

<template>
  <div class="chat chat-end">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img
          alt="Tailwind CSS chat bubble component"
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
      </div>
    </div>
    <div class="chat-header text-xs md:text-sm">
      {{props.userName}}
      <time class="text-xs md:text-sm opacity-50">{{props.createdAt}}</time>
    </div>
    <div class="chat-bubble bg-peach-200  py-4 rounded-2xl">
      <div v-if="hasText" v-html="props.userMessage" class="lg:text-xl md:text-lg text-sm"></div>
    </div>
<!--    <div class="chat-footer opacity-50">Seen at 12:46</div>-->
  </div>
</template>

<style scoped>

</style>
