<script setup lang="ts">
import { marked } from 'marked'
import RafikeyBubble from '@/components/chat/bubble/RafikeyBubble.vue'
import UserBubble from '@/components/chat/bubble/UserBubble.vue'
import { useRafikeyChatbotStore } from '@/stores'
import moment from 'moment/moment'
import { useRouter } from 'vue-router'

const chatbotStore  = useRafikeyChatbotStore()
const now = moment().format('LT')
const router = useRouter()
const conversationContainerRef = ref<HTMLDivElement | null>()
const isBottom = ref(false)

const isScrollable = ref(false)

const scrollToBottom = () => {
  if (currentHtmlPosition.value > 0) {
    isScrollable.value = true
  }

  // scrolll into view of the placeholder div
  const userInputPlaceholder = document.getElementById('userInputPlaceholder')
  userInputPlaceholder?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  })
}

const currentHtmlPosition = ref(0)
// const conversationContainerHeight = ref(0)
const isScrolling = ref(false)

// listening to the scroll event from the user if there is more content than the viewport
document.addEventListener('scroll', () => {
  // get the current scroll position of the document
  currentHtmlPosition.value = document.documentElement.scrollTop
  if (conversationContainerRef.value) {
    // the bottom will be true if the scrollTp is greater or equal to the difference between the scrollHeight and the clientHeight
    isBottom.value =
      conversationContainerRef.value.scrollTop >=
      conversationContainerRef.value.scrollHeight - conversationContainerRef.value.clientHeight

    //   setting isScrolling to true if the user is not at the bottom and if the ScrollTop is greater than 0
    isScrolling.value = currentHtmlPosition.value > 0 && !isBottom.value
  }
})

watch(chatbotStore.conversation, () => {
  // if (conversationContainerRef.value) {
  //   conversationContainerHeight.value = conversationContainerRef.value.clientHeight || 0
  // }
  scrollToBottom()
})

setTimeout(()=>{
  scrollToBottom()
}, 1000)




</script>



<template>
  <!--    conversation section-->

  <div
    class="md:py-12 h-[calc(100vh-10rem)] md:me-20 overflow-y-auto"
  >
    <div class="md:hidden block sticky top-0 backdrop-blur-2xl dark:bg-black z-10 bg-white">

      <div class="flex justify-between  bg-link-water dark:bg-lightgray bg-white z-10 p-4 backdrop-blur">
        <div class="flex gap-4 cursor-pointer" @click="router.go(-1)">
          <span class="material-icons-outlined dark:text-white">arrow_back</span>
          <span class="dark:text-white">Chatting With Rafikey</span>
        </div>
        <div @click="chatbotStore.setCollapseSidebarSmall(false)" class="btn btn-sm btn-ghost shadow-none bg-transparent hover:border-none">
          <span class="material-icons-outlined dark:text-white">more_horiz</span>
        </div>
      </div>
    </div>
    <ul>
      <template v-for="(conv, index) in chatbotStore.conversation" :key="index">
        <UserBubble
          v-if="conv && conv.isUser && conv.message.length > 0 && !conv.isTyping"
          :user-message="conv.message"
          :user-name="'You'"
          :created-at="now"
          :is-generating-response="chatbotStore.isGeneratingResponse"
          :key="conv.uniqueId"
        />
        <RafikeyBubble
          v-if="conv && !conv.isUser"
          :chatbot-name="'Rafikey'"
          :rafikey-chatbot-message="marked.parse(conv.message) as string"
          :is-typing="false"
          :is-copyable="false"
          :is-error="false"
          :created-at="now"
          :is-generating-response="chatbotStore.isGeneratingResponse"
          :key="conv.uniqueId"
        />
      </template>
    </ul>
  </div>

</template>

<style scoped>

</style>
