<script setup lang="ts">
import { marked } from 'marked'
import RafikeyBubble from '@/components/chat/bubble/RafikeyBubble.vue'
import UserBubble from '@/components/chat/bubble/UserBubble.vue'
import { useRafikeyChatbotStore } from '@/stores'
import moment from 'moment/moment'

const chatotStore  = useRafikeyChatbotStore()
const now = moment().format('LT')
</script>



<template>
  <!--    conversation section-->

  <div
    class="md:py-12 h-[calc(100vh-10rem)] md:me-20 overflow-y-auto"
  >
    <div class="md:hidden block">

      <div class="flex justify-between sticky top-0 bg-link-water dark:bg-lightgray bg-white z-10 p-4 backdrop-blur">
        <div class="flex gap-4">
          <span class="material-icons-outlined dark:text-white">arrow_back</span>
          <span class="dark:text-white">Chatting With Rafikey</span>
        </div>
        <div @click="chatotStore.setCollapseSidebarSmall(false)" class="btn btn-sm btn-ghost shadow-none bg-transparent hover:border-none">
          <span class="material-icons-outlined dark:text-white">more_horiz</span>
        </div>
      </div>
    </div>
    <ul>
      <template v-for="(conv, index) in chatotStore.conversation" :key="index">
        <UserBubble
          v-if="conv.isUser && conv.message.length > 0 && !conv.isTyping"
          :user-message="conv.message"
          :user-name="'You'"
          :created-at="now"
          :is-generating-response="chatotStore.isGeneratingResponse"
          :key="conv.uniqueId"
        />
        <RafikeyBubble
          v-if="!conv.isUser"
          :chatbot-name="'Rafikey'"
          :rafikey-chatbot-message="marked.parse(conv.message) as string"
          :is-typing="false"
          :is-copyable="false"
          :is-error="false"
          :created-at="now"
          :is-generating-response="chatotStore.isGeneratingResponse"
          :key="conv.uniqueId"
        />
      </template>
    </ul>
  </div>

</template>

<style scoped>

</style>
