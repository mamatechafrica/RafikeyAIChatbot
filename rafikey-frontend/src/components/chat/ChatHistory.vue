<script setup lang="ts">
import { defineProps } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'


interface ChatHistoryProps {
  threadId: string
  title: string
  lastMessageAt: string
}
const props = defineProps<ChatHistoryProps>()


const chatbotStore = useRafikeyChatbotStore()

const emits = defineEmits<{
  (event: 'fetchHistoryHandler', threadId: string): void
}>()


const chatHistoryHandler = (propVal: ChatHistoryProps) => {
  // check if the button is an active button and do nothing to prevent fetching the already active chats again otherwise fetch the chat history
  if( chatbotStore.sessionId === props.threadId){
    return
  } else {
    chatbotStore.conversation = []
    chatbotStore.setActiveChatHistory(propVal.threadId)
    emits('fetchHistoryHandler', propVal.threadId)
    chatbotStore.isNewChat=false
  }
}


</script>

<template>
  <div class="flex justify-start py-2 ps-4 cursor-pointer"
       :class="[ chatbotStore.sessionId === props.threadId? 'bg-stone-300 dark:bg-stone-700  border-r-4 border-blue-600 ': 'bg-transparent']"
       @click="chatHistoryHandler(props)"
  >
    <p class="text-start line-clamp-1 text-small dark:text-white ">{{props.title}}</p>
  </div>
</template>

<style scoped>

</style>
