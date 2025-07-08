<script setup lang="ts">
import { computed, onMounted } from 'vue'

export interface UserBubbleProps {
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
    <div class="flex flex-row-reverse gap-2">
      <div>
        <div>
          <img alt="user-avatar" src="@/assets/images/Avatar.png" />
        </div>
      </div>
      <div class="flex flex-col">
        <div
          class="chat-header dark:text-white flex justify-end items-end font-semibold text-sm md:text-lg"
        >
          {{ props.userName }}
          <time class="text-xs md:text-sm opacity-50 flex ">{{ props.createdAt }}</time>
        </div>
        <div class="bg-lightBackground dark:bg-darkgray p-4 rounded-2xl">
          <div
            v-if="hasText"
            v-html="props.userMessage"
            class="lg:!text-xl md:!text-lg !text-sm dark:text-white"
          ></div>
        </div>
      </div>
    </div>
    <!--    <div class="chat-footer opacity-50">Seen at 12:46</div>-->
  </div>
</template>

<style scoped></style>
