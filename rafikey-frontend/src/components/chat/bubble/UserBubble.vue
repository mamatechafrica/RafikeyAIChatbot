<script setup lang="ts">
import { computed, inject} from 'vue'
import { useAuthStore,} from '@/stores'

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

const props = defineProps<UserBubbleProps>()
const authStore = useAuthStore()
const hasText = computed(() => {
  return props.userMessage.length > 0
})


const bgColor = inject('bgColor')
const darkBgColor = inject('darkBgColor')
</script>

<template>
  <div class="chat chat-end">
    <div class="flex flex-row-reverse gap-2">
      <div>
        <div
          :class="[darkBgColor, bgColor]"
          class="rounded-full h-10 w-10 flex items-center justify-center font-bold"
        >
          <span class="dark:text-white">{{
            JSON.parse(authStore.user).username.substring(0, 2).toUpperCase()
          }}</span>
          <!--          <img alt="user-avatar" src="@/assets/images/Avatar.png" />-->
        </div>
      </div>
      <div class="flex flex-col">
        <div class="chat-header dark:text-white flex justify-end items-end text-small">
          {{ props.userName }}
          <time class="text-extra-small opacity-50 flex">{{ props.createdAt }}</time>
        </div>
        <div class="bg-lightBackground dark:bg-bubbleDark p-4 rounded-2xl">
          <div v-if="hasText" v-html="props.userMessage" class="text-small dark:text-white"></div>
        </div>
      </div>
    </div>
    <!--    <div class="chat-footer opacity-50">Seen at 12:46</div>-->
    <!--    <p>Hello</p>-->
  </div>
</template>

<style scoped></style>
