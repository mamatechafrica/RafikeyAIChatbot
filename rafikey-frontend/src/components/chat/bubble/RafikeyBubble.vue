<script setup lang="ts">
import { computed } from 'vue'

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

const props = withDefaults(defineProps<RafikeyChatbot>(), {
  isTyping: true,
  issCopyable: false,
  isError: false,
})

const hasText = computed(() => {
  return (props.rafikeyChatbotMessage?.length ?? 0) > 0 || (props.originalMessage?.length ?? 0) > 0
})
</script>

<template>
  <div class="chat chat-start">
    <div class="flex gap-2">
      <div>
        <div class="">
          <img
            class="w-12 rounded-full"
            alt="Rafikey chatbot image"
            src="@/assets/images/rafikey-avator.png"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <div
          class="chat-header flex dark:text-white justify-start items-end font-semibold text-sm md:text-lg"
        >
          {{ props.chatbotName }}
          <time class="text-xs md:text-sm opacity-50">{{ props.createdAt }}</time>
        </div>
        <div class="py-4 rounded-2xl">
          <div
            v-if="hasText"
            v-html="props.rafikeyChatbotMessage || props.originalMessage"
            class="dark:text-white"
          ></div>
          <span v-else class="loading loading-dots md:loading-lg loading-sm dark:text-white"></span>
        </div>
      </div>
    </div>
    <!--    <div class="chat-footer opacity-50">Delivered</div>-->
  </div>
</template>

<style scoped></style>
