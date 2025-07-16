<script setup lang="ts">
import { defineProps } from 'vue'
import { useRafikeyChatbotStore } from '@/stores'


interface ChatHistoryProps {
  threadId: string
  title: string
  lastMessageAt: string
}>()
const chatbotStore = useRafikeyChatbotStore()

const emits = defineEmits<{
  (event: 'fetchHistoryHandler', threadId: string): void
}>()

const chatHistoryHandler = (threadId: string) => {
  emits('fetchHistoryHandler', threadId)
}
</script>

<template>
  <div class="btn btn-sm flex justify-start btn-ghost w-full bg-transparent shadow-none hover:border-none hover:bg-transparent"
       :class="chatbotStore.sessionId === props.threadId? 'bg-lightgray text-stone-300': ''"
       @click="chatHistoryHandler(props.threadId)"
  >
    <p class="text-start line-clamp-1 text-sm dark:text-white ">{{props.title}}</p>
  </div>
</template>

<style scoped>

</style>
