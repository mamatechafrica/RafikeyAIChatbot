<script setup lang="ts">

import {computed} from "vue";

export interface RafikeyChatbot {
  chatbotName: string
  rafikeyChatbotMessage?: string
  originalMessage?: string
  isTyping?: boolean
  isCopyable?: boolean
  isError?: boolean
  createdAt?: string
  isGeneratingResponse: boolean

}
const props = withDefaults(defineProps<RafikeyChatbot>(),{
  isTyping: true,
  issCopyable: false,
  isError: false
})

const hasText = computed(()=>{
  return (
    (props.rafikeyChatbotMessage?.length  ?? 0) > 0 ||
    (props.originalMessage?.length ?? 0 ) > 0
  )
})
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img
          alt="Rafikey chatbot image"
          src="@/assets/images/chatbot.png" />
      </div>
    </div>
    <div class="chat-header text-xs md:text-sm">
     {{props.chatbotName}}
      <time class="text-xs md:text-sm opacity-50">{{props.createdAt}}</time>
    </div>
    <div class="chat-bubble bg-peach-600 py-4 rounded-2xl text-white ">
      <div v-if="hasText" v-html="props.rafikeyChatbotMessage || props.originalMessage" class="lg:text-xl text-lg"></div>
      <span v-else class="loading loading-dots md:loading-lg loading-sm"></span>
    </div>
<!--    <div class="chat-footer opacity-50">Delivered</div>-->
  </div>
</template>

<style scoped>

</style>
