<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'

import UserInput from '@/components/chat/UserInput.vue'
import _ from 'lodash'
import hljs from 'highlight.js'
import { marked, type RendererObject, type Tokens } from 'marked'
import { useRafikeyChatbotStore, type Conversation } from '@/stores'
import { v4 as uuidV4 } from 'uuid'
import NavBar from '@/components/chat/NavBar.vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment/moment'


interface HistoryConv {
  bot_response: string
  id: number
  thread_id: string
  timestamp: string
  tile: string | null
  user_id: number
  user_message: string
}
const rafikeyChatbotStore = useRafikeyChatbotStore()
const router = useRouter()
const route = useRoute()
const isError = ref(false)


const isGeneratingResponse = ref(false)
const isBottom = ref(false)
const now = moment()

//   create Rafikey message object
const rafikeyMessage = ref<Conversation>({
  message: '',
  isUser: false,
  isTyping: true,
  uniqueId: _.uniqueId('rafikey-'),
  timestamp : ''
})

// Create user message object
const userMessage = ref<Conversation>({
  message: '',
  isUser: true,
  uniqueId: _.uniqueId('user-'),
  timestamp : ''
})


const conversationContainerRef = ref<HTMLDivElement | null>()
// const isScrollable = ref(false)
// const notificationStore = useNotificationStore()

// const isDark = false
// toggle welcome image based on dark mode

// scrolltop bottom when rafikey chatbot is typing

const scrollToBottom = () => {
  const userInputPlaceholder = document.getElementById('#userInputPlaceholder')
  userInputPlaceholder?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest',
  })
}

const renderer: RendererObject = {
  link({ href, title, text }: Tokens.Link) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table({ header: hd, rows, align }: Tokens.Table) {
    const header = hd
      .map(({ text, header }) => {
        return `
      <th class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</th>
    `
      })
      .join('\n')

    const body = rows
      .map((row) => {
        return `
      <tr>${row
        .map(({ text, header }) => {
          return `
        <td class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</td>
      `
        })
        .join('\n')}</tr>
    `
      })
      .join('\n')

    return `
   <div class="bg-base-100 p-2.5 rounded-xl shadow-lg shadow-base-200 my-5">
    <div class="overflow-x-auto py-4">
        <table class="table table-sm md:text-md table-zebra border">
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
    console.log('items is -> ', items)
    const body = items
      .map(({ task, checked, loose, text }) => {
        return `
      <li class="text-base-accent text-sm md:text-md">${marked.parseInline(text)}</li>
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
    <li class="text-base-accent text-sm lg:text-lg md:text-md">${marked.parseInline(text)}</li>
  `
  },
  paragraph({ text, pre }: Tokens.Paragraph) {
    return `
    <p class="text-base-accent leading-relaxed text-sm md:text-md">${marked.parseInline(text)}</p>
  `
  },
  heading({ text, depth: level }: Tokens.Heading) {
    let cssClassLevel = '!text-peach-900 text-lg my-2'

    switch (level) {
      case 1:
        cssClassLevel = '!text-peach-900 text-xl md:text-2xl my-2'
        break
      case 2:
        cssClassLevel = '!text-peach-900  text-lg md:text-xl my-1.5 '
        break
      case 3:
        cssClassLevel = '!text-peach-900  text-sm md:text-lg my-1.5'
        break
      case 4:
        cssClassLevel = '!text-peach-900  text-xs md:text-base my-1'
        break
      case 5:
        cssClassLevel = '!text-peach-900 text-xxs md:text-sm my-1'
        break
      case 6:
        cssClassLevel = ' !text-peach-900 text-xxxs md:text-xs my-0.5'
        break
    }

    return `
    <h${level} class="${cssClassLevel} font-semibold text-base-accent !text-peach-900">${marked.parseInline(text)}</h${level}>
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
    <strong class="!text-peach-900 font-semi-bold  my-2.5 text-sm md:text-lg">${text}</strong>
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
    <em class="font-light my-1 text-sm md:text-md">${text}</em>
  `
  },
  del({ text }: Tokens.Del) {
    return `
    <del class="font-poppins-light my-1 text-sm md:text-md">${text}</del>
  `
  },
  text({ text, type }: Tokens.Text | Tokens.Escape | Tokens.Tag) {
    if (type === 'text') {
      return `
      <span class="text-md md:text-lg">${text}</span>
    `
    } else if (type === 'escape') {
      return `
      <span class="text-sm md:text-md">${text}</span>
    `
    } else {
      return `
      <span class="text-sm md:text-md">${text}</span>
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

// const fetchHistoryChats = ()=>{
//
// }

// Fetch chats from backend
const fetchChats = (formatted: string) =>{

  rafikeyChatbotStore.conversation.map((conv) => {
    console.log(conv.message)
  })
  rafikeyChatbotStore
    .sendMessageToRafikeyChatbot({
      message: formatted,
      sessionId: rafikeyChatbotStore.getSessionId,
    })
    .then((res) => {
      if(res != null){
        console.log('Rafikey response', res)
        const rafikeyAllObject = rafikeyChatbotStore.conversation.filter((conv) => !conv.isUser)
        const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

        if (currentRafikeyObject) {
          console.log('Current message--', currentRafikeyObject)
          currentRafikeyObject.message = res as string
        }
      }
      else{
        isError.value = true
      }

    })
    .catch((err) => {
      isError.value = true
      console.log('There is an error in rafikey response', err)
    })
    .finally(() => {
      rafikeyChatbotStore.isGeneratingResponse = false
      // rafikeyMessage.value.isTyping = false
      // rafikeyMessage.value.hasError = true
    })
}

// User input
const handleUserInput = (value: string, formatted: string) => {
  if(route.path === '/user/chat') {
    rafikeyChatbotStore.setSessionId(uuidV4())
    router.push({
      name: 'chatWithId',
      params: {
        sessionId: rafikeyChatbotStore.getSessionId
      },
    })
  }
  userMessage.value = {
    message: formatted,
    isUser: true,
    uniqueId: _.uniqueId('user-'),
  }

  rafikeyChatbotStore.conversation.push(userMessage.value)
  scrollToBottom()



  //   push rafikey message to the array
  setTimeout(() => {
    rafikeyChatbotStore.conversation.push(rafikeyMessage.value)
  }, 500)
  isGeneratingResponse.value = true
  fetchChats(formatted)
  }




const currentHtmlPosition = ref(0)
const conversationContainerHeight = ref(0)
document.addEventListener('scroll', () => {
  currentHtmlPosition.value = document.documentElement.scrollTop
  if (conversationContainerRef.value) {
    isBottom.value =
      conversationContainerRef.value.scrollHeight >=
      conversationContainerRef.value.scrollHeight - conversationContainerRef.value.clientHeight
  }
})

watch(rafikeyChatbotStore.conversation, () => {
  if (conversationContainerRef.value) {
    conversationContainerHeight.value = conversationContainerRef.value.clientHeight || 0
  }
  scrollToBottom()
})

//date format
const timeFormatter = (timestamp: string) => {
  const date = moment(timestamp)
  if (now.isSame(date, 'day')) {
    return  now
  } else if (now.subtract(1, 'days').isSame(date, 'day')) {
    return date.format('[Yesterday] h: mm A')
  }  else if(now.subtract(1, 'weeks').isBefore(date, 'day')) {
    return date.format('dddd h: mm A')
  }
  else if (now.subtract(1, 'weeks').isAfter(date)) {
    return date.format('[Last]dddd h:mm A')
  } else if (now.subtract(1, 'years').isBefore(date)) {
    return  date.format('MMMM D, dddd h:mm A')
  } else {
    return date.format('YYYY')
  }
}


// 2025-07-15T21:41:48.525760
// fetching chat history
const fetchHistoryHandler = (activeSessionId: string) =>{
  if(rafikeyChatbotStore.conversation.length > 0){
    return
  }
  else {
    console.log('fetchHistoryHandler activreSessionId---', activeSessionId)
    rafikeyChatbotStore.getChatHistory(activeSessionId)
      .then(res => {
        if (!res?.data) {
          isError.value = true
        } else {
          console.log('Chat history data', res.data)

          router.push({
            name: 'chatWithId',
            params: {
              sessionId: activeSessionId,
            },
          })
          console.log('Chat history response', res.data)
          res.data.map((conv: HistoryConv) => {
            console.log(conv)
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
          console.log('Chat history conversation', rafikeyChatbotStore.conversation)

        }
      })
      .catch(err => {
        isError.value = true
        console.error('Error fetching chat history', err)
      })
      .finally(() => {
        rafikeyChatbotStore.isGeneratingResponse = false
        rafikeyMessage.value.isTyping = false
        // rafikeyChatbotStore.conversation = []
      })
  }
}
</script>

<template>
  <div class="p-6 dark:bg-lightgray min-h-screen">
    <div >
      <NavBar  @fetch-history-handler="fetchHistoryHandler"/>
    </div>
    <!--    right side-->
    <div class="relative w-full">
      <div
        class=""
        :class="[
          rafikeyChatbotStore.collapseSidebarLarge ? 'md:ml-32 duration-300' : 'ml-96 duration-300',
        ]"
      >
        <!--    top -->
        <div class="justify-end gap-4 cursor-pointer hidden lg:flex">
          <div class="flex gap-1 border dark:border-white border-stone-300 rounded-lg px-2 py-1">
            <span class="material-icons-outlined dark:text-stone-300">share</span>
            <span class="dark:text-white">Share</span>
          </div>
          <div class="">
            <span class="dark:text-white">Feedback</span>
          </div>
        </div>


        <RouterView #default="{Component, route}">
          <template v-if="Component">
            <component :is="Component" :key="route.fullPath" />
          </template>
        </RouterView>


          <!--        <ErrorScreen />-->
          <!--    text area-->
          <div
            ref="userInputContainerHeightRef"
            :class="[
              !rafikeyChatbotStore.collapseSidebarLarge
                ? 'md:left-96  md:w-[calc(100vw-28rem)]  duration-300 '
                : 'md:left-40 md:w-[calc(100vw-14rem)] duration-300 ',
            ]"
            class="fixed bottom-6 bg-white left-4 w-[calc(100vw-2rem)]  dark:bg-lightgray"
          >
            <!--        <div-->
            <!--          v-if="isBottom"-->
            <!--          class="py-4 mt-6 bg-gradient-to-t from-main-color-light-color block"-->
            <!--        ></div>-->
            <div class="bg-white backdrop-blur-2xl pb-6 dark:bg-lightgray">
              <div class="">
                <UserInput
                  class="mx-auto"
                  :disabled="false"
                  :is-generating="rafikeyChatbotStore.isGeneratingResponse"
                  @user-input="handleUserInput"
                  :display-bottom="rafikeyChatbotStore.conversation.length > 0"
                />
              </div>
            </div>
          </div>
          <div id="#userInputPlaceholder"></div>

      </div>
    </div>
  </div>
</template>

<style scoped></style>
