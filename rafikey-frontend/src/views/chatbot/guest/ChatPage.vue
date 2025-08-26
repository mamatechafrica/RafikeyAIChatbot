<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import _ from 'lodash'

import UserInput from '@/components/chat/UserInput.vue'
import type { Conversation } from '@/stores/rafikeyChatbotStore.ts'
import { v4 as uuidV4 } from 'uuid'
import { useRafikeyChatbotStore } from '@/stores'
import { marked, type RendererObject, type Tokens } from 'marked'
import hljs from 'highlight.js'
import RafikeyBubble from '@/components/chat/bubble/RafikeyBubble.vue'
import UserBubble from '@/components/chat/bubble/UserBubble.vue'
import moment from 'moment/moment'
import ErrorScreen from '@/components/chat/ErrorScreen.vue'
import { useRouter } from 'vue-router'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import type { AccessQuestion } from '@/views/chatbot/user/NewChat.vue'
import { useMediaQuery } from '@vueuse/core'
import type { HistoryConv } from '@/views/chatbot/ChatPage.vue'

const rafikeyChatbotStore = useRafikeyChatbotStore()
const isError = ref(false)
const router = useRouter()
const now = moment()
const isSmallDevice = useMediaQuery('(max-width: 767px)')

const formattedResponse = ref<string>('')

// Marked parse function
const renderer: RendererObject = {
  link({ href, title, text }: Tokens.Link) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table({ header: hd, rows, align }: Tokens.Table) {
    const header = hd
      .map(({ text, header }) => {
        return `
      <th class="text-base-content text-large">${marked.parseInline(text)}</th>
    `
      })
      .join('\n')

    const body = rows
      .map((row) => {
        return `
      <tr>${row
          .map(({ text, header }) => {
            return `
        <td class="text-base-content text-large">${marked.parseInline(text)}</td>
      `
          })
          .join('\n')}</tr>
    `
      })
      .join('\n')

    return `
   <div class="bg-base-100 p-2.5 rounded-xl shadow-lg shadow-base-200 my-5">
    <div class="overflow-x-auto py-4">
        <table class="table table-sm text-large table-zebra border">
        <thead>
            ${header}
        </thead>
        <tbody>
            ${body}
        </tbody>
    </table>
    </div>
    </div>
  `
  },
  // tablerow(content: string) {
  //   return `
  //   <tr class="hover">${content}</tr>
  // `
  // },
  // tablecell(content: string) {
  //   return `
  //   <td>${content}</td>
  // `
  // },
  code({ text: code, lang: language, codeBlockStyle, escaped }: Tokens.Code) {
    // return `
    //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    if (language) {
      const ignoreIllegals = true
      return `
  <div class="p-2 flex w-full">
       <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${
        hljs.highlight(code, {
          language,
          ignoreIllegals,
        }).value
      }</code></div></div></pre>
  </div>
    `
    } else {
      return `
  <div class="p-3 flex w-full">
    <div class="mockup-code bg-base-100 my-2.5 w-full overflow-auto max-w-full"><pre class="w-full text-sm md:text-md text-base-content"><div class="px-4 flex-1 overflow-auto h-full w-full"><code>${code}</code></div></pre></div>
  </div>
  `
    }
  },
  list({ ordered, start, loose, items }: Tokens.List) {
    // console.log('items is -> ', items)
    const body = items
      .map(({ task, checked, loose, text }) => {
        return `
      <li class="text-base-accent text-large">${marked.parseInline(text)}</li>
      `
      })
      .join('\n')

    if (ordered) {
      if (start) {
        return `
         <div class="my-2 py-2 mx-3">
            <ol start="${start}" class="list-decimal list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
      `
      }
      return `
         <div class="my-2 py-2 mx-3">
            <ol class="list-decimal mx-5 list-outside space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
    `
    } else {
      return `
         <div class="my-2 py-2 mx-3">
            <ul class="list-disc list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ul>
         </div>
    `
    }
  },
  listitem({ task, checked, loose, text }: Tokens.ListItem) {
    return `
    <li class="text-base-accent text-small">${marked.parseInline(text)}</li>
  `
  },
  paragraph({ text, pre }: Tokens.Paragraph) {
    return `
    <p class="text-base-accent leading-relaxed text-small">${marked.parseInline(text)}</p>
  `
  },
  heading({ text, depth: level }: Tokens.Heading) {
    let cssClassLevel = 'dark:text-white text-large my-2'

    switch (level) {
      case 1:
        cssClassLevel = 'dark:text-white text-extra-large my-2'
        break
      case 2:
        cssClassLevel = 'dark:text-white  text-large my-1.5 '
        break
      case 3:
        cssClassLevel = 'dark:text-white  text-small my-1.5'
        break
      case 4:
        cssClassLevel = 'dark:text-white  text-extra-small  my-1'
        break
      case 5:
        cssClassLevel = 'dark:text-white text-extra-extra-small my-1'
        break
      case 6:
        cssClassLevel = 'dark:text-white   text-extra-extra-small-2  my-0.5'
        break
    }

    return `
    <h${level} class="${cssClassLevel} font-semibold text-base-accent dark:text-white">${marked.parseInline(text)}</h${level}>
  `
  },
  hr() {
    return `
    <hr class="my-4 border-neutral-200"/>
  `
  },
  blockquote({ text: quote }: Tokens.Blockquote) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 pl-4">${quote}</blockquote>
  `
  },
  image({ href, title, text }: Tokens.Image) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong({ text }: Tokens.Strong) {
    return `
    <strong class="dark:text-white font-semi-bold  my-2.5 text-small">${text}</strong>
  `
  },
  codespan({ text: code }: Tokens.Codespan) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  em({ text }: Tokens.Em) {
    return `
    <em class="font-light my-1 text-small">${text}</em>
  `
  },
  del({ text }: Tokens.Del) {
    return `
    <del class="font-poppins-light my-1 text-small">${text}</del>
  `
  },
  text({ text, type }: Tokens.Text | Tokens.Escape | Tokens.Tag) {
    if (type === 'text') {
      return `
      <span class="text-small">${text}</span>
    `
    } else if (type === 'escape') {
      return `
      <span class="text-small">${text}</span>
    `
    } else {
      return `
      <span class="text-small">${text}</span>
    `
    }
  },
}
marked.use({
  renderer,
  breaks: true,
  gfm: true,
  useNewRenderer: true,
})
// User Input
const handleUserInput = (formatted: string) => {
  if(!rafikeyChatbotStore.regenerateResponse){
    formattedResponse.value = formatted
    //   Create userMessage object
    const userMessage = ref<Conversation>({
      message: formatted,
      isUser: true,
      uniqueId: _.uniqueId('user-'),
    })
    scrollToBottom()
    // push user message to the conversation array
    rafikeyChatbotStore.conversation.push(userMessage.value)
    const rafikeyMessage = ref<Conversation>({
      message: '',
      isUser: false,
      isTyping: true,
      uniqueId: _.uniqueId('rafikey-'),
    })

    console.log('Here in the handler ')
    //   push rafikey message to conversation array
    setTimeout(() => {
      rafikeyChatbotStore.conversation.push(rafikeyMessage.value)
    }, 500)
    // console.log('conversation array---', conversation.value)
    rafikeyChatbotStore.isGeneratingResponse = true
    rafikeyChatbotStore
      .sendMessageToRafikeyChatbotAnonymous({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {

          const rafikeyAllObject = rafikeyChatbotStore.conversation.filter((conv) => !conv.isUser)
          const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

          if (currentRafikeyObject) {
            currentRafikeyObject.message = res?.data as string
          }
        } else {
          rafikeyChatbotStore.setStreamError({
            hasError: true,
            errorMessage: res?.data as string,
            isLoggedIn: true
          })
        }
      })
      .catch((err) => {
        rafikeyChatbotStore.setStreamError({
          hasError: true,
          errorMessage: "An error occurred while generating the response. Please try again later.",
          isLoggedIn: true
        })
      })
      .finally(() => {
        rafikeyChatbotStore.isGeneratingResponse = false
        rafikeyMessage.value.isTyping = false
      })
  } else{
    // pop the last message which is the chat message so that it does not show up on the page

    rafikeyChatbotStore.isGeneratingResponse = true
    rafikeyChatbotStore
      .sendMessageToRafikeyChatbot({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {

          const rafikeyAllObject = rafikeyChatbotStore.conversation.filter((conv) => !conv.isUser)
          const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

          if (currentRafikeyObject) {
            currentRafikeyObject.message = res.data as string
          }
        } else {
          rafikeyChatbotStore.setStreamError({
            hasError: true,
            errorMessage: res?.data as string,
            isLoggedIn: true,
          })
        }
      })
      .catch((err) => {
        console.log("error catch", err)
        rafikeyChatbotStore.setStreamError({
          hasError: true,
          errorMessage: "An error occurred, please try again later.",
          isLoggedIn: true
        })
      })
      .finally(() => {
        rafikeyChatbotStore.isGeneratingResponse = false
        rafikeyChatbotStore.setRegenerateResponse(false)
      })
  }
}

//date format
const timeFormatter = (timestamp: string) => {
  const date = moment.utc(timestamp).local()
  if (now.isSame(date, 'day')) {
    return date.format('[Today] h:mm A')
  } else if (now.clone().subtract(1, 'days').isSame(date, 'day')) {
    return date.format('[Yesterday] h:mm A')
  } else if (now.clone().subtract(1, 'weeks').isBefore(date, 'day')) {
    return date.format('dddd h:mm A')
  } else if (now.clone().subtract(1, 'weeks').isAfter(date)) {
    return date.format('[Last]dddd h:mm A')
  } else if (now.clone().subtract(1, 'years').isBefore(date)) {
    return date.format('MMMM D, dddd')
  } else {
    return date.format('YYYY')
  }
}
// Create user message object
const userMessage = ref<Conversation>({
  message: '',
  isUser: true,
  uniqueId: _.uniqueId('user-'),
  timestamp: '',
})

const rafikeyMessage = ref<Conversation>({
  message: '',
  isUser: false,
  isTyping: true,
  uniqueId: _.uniqueId('rafikey-'),
  timestamp: '',
})
const isLoading = ref(true)
// fetching chat history
const fetchHistoryHandler = (activeSessionId: string) => {
  rafikeyChatbotStore.conversation = []
  // isLoading.value = true
  rafikeyChatbotStore
    .getChatHistory(activeSessionId)
    .then((res) => {
      if (res?.result != 'ok') {
        return
        // rafikeyChatbotStore.setStreamError({
        //   hasError: true,
        //   errorMessage: res?.data as string,
        //   isLoggedIn: res?.isLoggedIn as boolean,
        // })
      } else {
        // router.replace({
        //   name: 'chatWithId',
        //   params: {
        //     sessionId: activeSessionId,
        //   },
        // })
        const sortedHistory = res.data.sort((a: HistoryConv, b: HistoryConv) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })

        sortedHistory.forEach((conv: HistoryConv) => {
          const time = timeFormatter(conv.timestamp)
          userMessage.value = {
            message: conv.user_message,
            isUser: true,
            uniqueId: _.uniqueId('user-'),
            timestamp: time as string,
          }
          rafikeyChatbotStore.conversation.push(userMessage.value)

          rafikeyMessage.value = {
            message: conv.bot_response,
            isUser: false,
            isTyping: false,
            uniqueId: _.uniqueId('rafikey-'),
            timestamp: time as string,
          }
          rafikeyChatbotStore.conversation.push(rafikeyMessage.value)
        })
      }
    })
    .catch((err) => {
      // rafikeyChatbotStore.setStreamError({
      //   hasError: true,
      //   errorMessage: "An error occurred while generating the response. Please try again later.",
      //   isLoggedIn: true,
      // })
      console.error('Error fetching chat history', err)
    })
    .finally(() => {
      rafikeyChatbotStore.isGeneratingResponse = false
      rafikeyMessage.value.isTyping = false
      isLoading.value = false
    })
}

const isShowDisclaimer = ref(false)
onMounted(() => {
  rafikeyChatbotStore.setSessionId(uuidV4())
  setTimeout(() => {
    isShowDisclaimer.value = true
  }, 3000)
})


const loginHandler = () => {
  router.push({
    name: 'login',
  })
}

const signUpHandler = () => {
  router.push({
    name: 'welcome-page',
  })
}

// toggle images in dark ans light mode
const toggleImage = computed(() => {
  // console.log('rafikeyChatbotStore.isDarkMode', rafikeyChatbotStore.isDarkMode)
  return rafikeyChatbotStore.isDarkMode? imageLight: imageDark
})

const isStartChatSmallScreen = ref(false)
const startChatSmallScreen = () => {
  isStartChatSmallScreen.value = true
}
const scrollToBottom = () => {

  // const userInputPlaceholderSmall = document.getElementById('userInputPlaceholder-small')
nextTick(()=>{
  if(!isSmallDevice){
    const userInputPlaceholder = document.getElementById('userInputPlaceholder')
    if(userInputPlaceholder){
      console.log("Scrolling desktop")
      userInputPlaceholder.scrollIntoView({
        behavior: 'smooth',
        block:  'end',
        inline: 'nearest'
      })
    }

  } else{
    const userInputPlaceholderSmall = document.getElementById('userInputPlaceholder-small')
    if(userInputPlaceholderSmall){
      console.log("Scrolling small")
      userInputPlaceholderSmall.scrollIntoView({
        behavior: 'smooth',
        block:  'end',
        inline: 'nearest'
      })
    }

  }
})
}


// watch the conversation container and scroll to bottom
watch(()=>rafikeyChatbotStore.conversation || rafikeyChatbotStore.isStreamError.hasError, () => {
  console.log("Now scrolling!!!")
  scrollToBottom()
})

// check if the regenerate has been punched to regenerate the response
watch(()=> rafikeyChatbotStore.regenerateResponse, (newValue) =>{
  if(newValue){
    handleUserInput(rafikeyChatbotStore.regenerateUserInput)
  }
})

// when mounted scroll to bottom
setTimeout(()=>{
  scrollToBottom()
}, 1000)


const accessQuestions = [
  {
    id: 1,
    question: 'How can I know I have STI?',
    icon: 'sms',
  },
  {
    id: 2,
    question: 'Best gynecologist?',
    icon: 'sms',
  },
  {
    id: 3,
    question: 'How to wear a condom',
    icon: 'sms',
  },
] as AccessQuestion[]

const accessButtonQuestionHandler = (message: string) =>{
  rafikeyChatbotStore.conversation = []
  handleUserInput(message)
  isStartChatSmallScreen.value = true
}
</script>

<template>
  <div class="min-h-screen dark:bg-lightgray w-full">
    <div class="lg:w-9/12 w-11/12 mx-auto py-10 hidden md:block">
      <!--    top -->
      <div class="flex justify-between sticky top-0  bg-opacity-30 white  backdrop-blur" :class="[rafikeyChatbotStore.conversation.length > 0 ? 'pt-4': '']">
        <div>
          <button><span class="dark:text-white text-extra-extra-small">Feedback</span></button>
        </div>
        <div class="flex items-end gap-2 ">
          <div class="">
            <button
              @click="loginHandler"
              class="btn btn-sm px-6 py-2 shadow-none border-none bg-black dark:bg-white text-white dark:text-black rounded-lg"
            >
              <span class="text-extra-small">Log in</span>
            </button>
          </div>
          <span class="text-extra-small dark:text-white">or</span>
          <div>
            <button
              @click="signUpHandler"
              class="btn btn-sm px-6 py-2 shadow-none bg-white dark:bg-transparent rounded-xl border dark:border-white border-black dark:text-white text-black"
            >
              <span class="text-extra-small">Sign up</span>
            </button>
          </div>
        </div>
      </div>

      <!--    hero section-->
      <div class="space-y-8 pt-12" v-if="rafikeyChatbotStore.conversation.length < 1">
        <div class="space-y-1">
          <h2
            class="text-extra-extra-large-2 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-azure-radiance-600 to-coral-red-500"
          >
            Hi there
          </h2>
          <p v-if="!isShowDisclaimer" class="text-extra-extra-large-1 text-stone-400">
            Let's talk sexual and reproductive health
          </p>
          <div
            v-else
            class="border border-casablanca-300 lg:py-4 px-2 py-1 rounded-lg w-full lg:w-3/4 xl:w-1/2"
          >
            <span class="dark:text-white lg:text-lg text-sm"
              >Heads up! Your chat is temporary unless you're logged in.</span
            >
            <p class="dark:text-white lg:text-lg text-sm">
              <RouterLink to="/auth/register" class="text-casablanca-300 lg:text-lg text-sm"
                >Create an account
              </RouterLink>
              or
              <RouterLink to="/auth/login" class="text-casablanca-300 lg:text-lg text-sm"
                >Log in
              </RouterLink>
              to save your conversations and access them anytime.
            </p>
          </div>
        </div>
        <div class="flex justify-end" >
          <img src="@/assets/images/rafikey-hi.png" alt="rafikey-image" class="lg:w-60 w-40" />
        </div>
      </div>
      <!--    conversation section-->
      <div class="py-10 h-full">
        <ul>
          <template v-for="(conv, index) in rafikeyChatbotStore.conversation" :key="index">
            <UserBubble
              v-if="conv.isUser && conv.message.length > 0 && !conv.isTyping"
              :user-message="conv.message"
              :user-name="'You'"
              :created-at="now"
              :is-generating-response="rafikeyChatbotStore.isGeneratingResponse"
              :key="conv.uniqueId"
            />
            <RafikeyBubble
              v-if="!conv.isUser && !isError"
              :chatbot-name="'Rafikey'"
              :rafikey-chatbot-message="marked.parse(conv.message) as string"
              :is-typing="false"
              :is-copyable="false"
              :is-error="false"
              :created-at="now"
              :is-generating-response="rafikeyChatbotStore.isGeneratingResponse"
              :key="conv.uniqueId"
            />
          </template>
        </ul>
        <div v-if="rafikeyChatbotStore?.isStreamError.hasError">
          <ErrorScreen :error-message="rafikeyChatbotStore.isStreamError.errorMessage" :is-logged-in="rafikeyChatbotStore.isStreamError.isLoggedIn"/>

        </div>
      </div>

      <!--    text area-->
      <div
        v-if="!rafikeyChatbotStore.isStreamError.hasError"
        ref="userInputContainerHeightRef"
        class="sticky w-full bottom-0 bg-white  dark:bg-lightgray"
      >
        <!--        <div-->
        <!--          v-if="isBottom"-->
        <!--          class="py-4 mt-6 bg-gradient-to-t from-main-color-light-color block"-->
        <!--        ></div>-->
        <div
          class="bg-white dark:bg-lightgray backdrop-blur-2xl pb-6"
          :class="[rafikeyChatbotStore.conversation.length > 0 ? 'fixed bottom-0 left-0 right-0' : '']"
        >
          <div class="">
            <UserInput
              class="mx-auto"
              :class="[rafikeyChatbotStore.conversation.length > 0 ? 'w-11/12 lg:w-9/12' : '']"
              :disabled="false"
              :is-generating="rafikeyChatbotStore.isGeneratingResponse"
              @user-input="handleUserInput"
              :display-bottom="rafikeyChatbotStore.conversation.length > 0"
            />
          </div>
        </div>
      </div>
      <div id="userInputPlaceholder" class="pt-20"></div>
    </div>
    <div class="px-4 w-full md:hidden block">
      <div v-if="!isStartChatSmallScreen">
        <div class="flex items-center justify-between">
          <div class="w-32">
            <img :src="toggleImage" alt="rafikey-icon" />
          </div>
          <div
            class="border dark:border-stone-300 rounded-full flex h-8 w-8 justify-center items-center"
          >
            <span class="material-icons-outlined dark:text-stone-300 !text-lg">settings</span>
          </div>
        </div>
        <div class="space-y-12">
          <div class="cursor-pointer flex gap-4 pt-8 w-full">
            <div
              class="w-full bg-link-water-50 flex flex-col  dark:bg-darkgray rounded-xl sm:p-4 p-2  space-y-2"
              @click="startChatSmallScreen"
            >
              <div class="bg-purple-500 rounded-full h-10 w-10 flex justify-center items-center">
                <span class="material-icons-outlined dark:text-white">sms</span>
              </div>
              <div class="flex justify-between dark:text-white gap-4">
                <p class="text-small">Chat with Rafikey</p>
                <span class="material-icons-outlined text-sm">arrow_forward</span>
              </div>
            </div>
            <div class="w-full bg-link-water-50   dark:bg-darkgray rounded-xl sm:p-4 p-2  space-y-2">
              <div class="bg-yellow-500 rounded-full h-10 w-10 flex justify-center items-center">
                <span class="material-icons-outlined dark:text-white">mic_none</span>
              </div>
              <div class="flex dark:text-white gap-4">
                <p class="text-small">Chat with Rafikey</p>
                <span class="material-icons-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="border border-casablanca-300 px-2 py-1 rounded-lg w-full">
              <span class="dark:text-white text-sm"
                >Heads up! Your chat is temporary unless you're logged in.</span
              >
              <p class="dark:text-white text-sm">
                <RouterLink to="/auth/register" class="text-casablanca-300 lg:text-lg text-sm"
                  >Create an account
                </RouterLink>
                or
                <RouterLink to="/auth/login" class="text-casablanca-300 text-sm"
                  >Log in
                </RouterLink>
                to save your conversations and access them anytime.
              </p>
            </div>
          </div>

          <div class=" ">
            <div class=" space-y-2 p-5">
              <div class="flex justify-between sm:p-4">
                <p class="dark:text-white text-extra-large">History</p>
                <span class="text-purple-400 text-small">See all</span>
              </div>
              <div v-for="qn in accessQuestions" :key="qn.id">
                <div
                  @click="accessButtonQuestionHandler(qn.question)"
                  class="cursor-pointer flex dark:bg-darkgray bg-link-water-50 rounded-xl sm:p-5 p-3 gap-4"
                >
                  <span class="material-icons-outlined dark:text-white ">{{ qn.icon }}</span>
                  <p class="dark:text-white text-small">{{ qn.question }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <!--        top side-->
        <div class="cursor-pointer flex justify-between sticky top-0 dark:bg-lightgray bg-white z-10 p-4 backdrop-blur">
          <div class="flex gap-4 cursor-pointer" @click="isStartChatSmallScreen = !isStartChatSmallScreen">
            <span class="material-icons-outlined dark:text-white">arrow_back</span>
            <span class="dark:text-white">Chatting With Rafikey</span>
          </div>
          <div>
            <span class="material-icons-outlined dark:text-white">more_horiz</span>
          </div>

        </div>

        <!--       Down side -->
        <!--    conversation section-->
        <div class="py-12 h-full">
          <ul>
            <template v-for="(conv, index) in rafikeyChatbotStore.conversation" :key="index">
              <UserBubble
                v-if="conv.isUser && conv.message.length > 0 && !conv.isTyping"
                :user-message="conv.message"
                :user-name="'You'"
                :created-at="now"
                :is-generating-response="rafikeyChatbotStore.isGeneratingResponse"
                :key="conv.uniqueId"
              />
              <RafikeyBubble
                v-if="!conv.isUser && !isError"
                :chatbot-name="'Rafikey'"
                :rafikey-chatbot-message="marked.parse(conv.message) as string"
                :is-typing="false"
                :is-copyable="false"
                :is-error="false"
                :created-at="now"
                :is-generating-response="rafikeyChatbotStore.isGeneratingResponse"
                :key="conv.uniqueId"

              />
            </template>
          </ul>
          <div v-if="rafikeyChatbotStore?.isStreamError.hasError">
            <ErrorScreen :error-message="rafikeyChatbotStore.isStreamError.errorMessage" :is-logged-in="rafikeyChatbotStore.isStreamError.isLoggedIn" />
          </div>
        </div>

        <!--    text area-->
        <div
          v-if="!rafikeyChatbotStore.isStreamError.hasError"
          ref="userInputContainerHeightRef"
          class="sticky w-full bottom-0 bg-white dark:bg-lightgray"
        >
          <div
            class="bg-white dark:bg-lightgray backdrop-blur-2xl pb-6 fixed bottom-0"
            :class="[rafikeyChatbotStore.conversation.length > 0 ? 'left-0 right-0': 'left-4 right-4']"
          >
            <div class="">
              <UserInput
                class="mx-auto"
                :class="[rafikeyChatbotStore.conversation.length > 0 ? 'w-11/12' : '']"
                :disabled="false"
                :is-generating="rafikeyChatbotStore.isGeneratingResponse"
                @user-input="handleUserInput"
                :display-bottom="rafikeyChatbotStore.conversation.length > 0"
              />
            </div>
          </div>
        </div>
        <div id="userInputPlaceholder-small" class="pt-20"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
