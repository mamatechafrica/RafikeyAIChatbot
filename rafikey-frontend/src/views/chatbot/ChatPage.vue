<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

import UserInput from '@/components/chat/UserInput.vue'
import _ from 'lodash'
import hljs from 'highlight.js'
import { marked, type RendererObject, type Tokens } from 'marked'
import { useRafikeyChatbotStore, type Conversation, useAuthStore } from '@/stores'
import { v4 as uuidV4 } from 'uuid'
import NavBar from '@/components/chat/NavBar.vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment/moment'
import SpinnerLoading from '@/components/chat/SpinnerLoading.vue'
import { useDark, useToggle, useMediaQuery } from '@vueuse/core'


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
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const isDark = useDark()

// const isGeneratingResponse = ref(false)
const now = moment()

//   create Rafikey message object
const rafikeyMessage = ref<Conversation>({
  message: '',
  isUser: false,
  isTyping: true,
  uniqueId: _.uniqueId('rafikey-'),
  timestamp: '',
})

// Create user message object
const userMessage = ref<Conversation>({
  message: '',
  isUser: true,
  uniqueId: _.uniqueId('user-'),
  timestamp: '',
})

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
    // console.log('items is -> ', items)
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
      <span class="text-sm md:text-lg lg:text-xl">${text}</span>
    `
    } else if (type === 'escape') {
      return `
      <span class="text-sm md:text-lg lg:text-xl">${text}</span>
    `
    } else {
      return `
      <span class="text-sm md:text-lg lg:text-xl">${text}</span>
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

// User input
const handleUserInput = (formatted: string) => {
  const activeSessionId = route.params.sessionId as string
  if (!activeSessionId) {
    rafikeyChatbotStore.setSessionId(uuidV4())
    router.push({
      name: 'chatWithId',
      params: {
        sessionId: rafikeyChatbotStore.getSessionId,
      },
    })
  }

  // don't re-create the user bubble if the user is regenerating the response
  if (!rafikeyChatbotStore.regenerateResponse) {
    userMessage.value = {
      message: formatted,
      isUser: true,
      uniqueId: _.uniqueId('user-'),
    }

    const rafikeyMessage = ref<Conversation>({
      message: '',
      isUser: false,
      isTyping: true,
      uniqueId: _.uniqueId('rafikey-'),
      timestamp: '',
    })

    rafikeyChatbotStore.conversation.push(userMessage.value)

    //   push rafikey message to the array
    setTimeout(() => {
      rafikeyChatbotStore.conversation.push(rafikeyMessage.value)
    }, 500)
    rafikeyChatbotStore.isGeneratingResponse = true
    console.log('Raafikey Array', rafikeyMessage.value)

    rafikeyChatbotStore
      .sendMessageToRafikeyChatbot({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {
          console.log('Rafikey response', res)
          const rafikeyAllObject = rafikeyChatbotStore.conversation.filter((conv) => !conv.isUser)
          const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

          if (currentRafikeyObject) {
            currentRafikeyObject.message = res.data as string
          }
        } else {
          console.log('response from streaming', res)
          rafikeyChatbotStore.setStreamError({
            hasError: true,
            errorMessage: res?.data as string,
            isLoggedIn: res?.isLoggedIn as boolean,
          })
        }
      })
      .catch((err) => {
        console.log('error catch', err)
        rafikeyChatbotStore.setStreamError({
          hasError: true,
          errorMessage: 'An error occurred, please try again later.',
          isLoggedIn: true,
        })
      })
      .finally(() => {
        rafikeyChatbotStore.isGeneratingResponse = false
        rafikeyChatbotStore.isNewChat = false
      })
  } else {
    // pop the last message which is the chat message so that it does not show up on the page
    console.log("Regenerating response ")
    //
    // const rafikeyMessage = ref<Conversation>({
    //   message: '',
    //   isUser: false,
    //   isTyping: true,
    //   uniqueId: _.uniqueId('rafikey-'),
    //   timestamp: '',
    // })
    // rafikeyChatbotStore.conversation.push(rafikeyMessage.value)

    rafikeyChatbotStore.isGeneratingResponse = true

    rafikeyChatbotStore
      .sendMessageToRafikeyChatbot({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {
          console.log('Rafikey response', res)
          const rafikeyAllObject = rafikeyChatbotStore.conversation.filter((conv) => !conv.isUser)
          const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

          if (currentRafikeyObject) {
            currentRafikeyObject.message = res.data as string
          }
        } else {
          rafikeyChatbotStore.setStreamError({
            hasError: true,
            errorMessage: res?.data as string,
            isLoggedIn: res?.isLoggedIn as boolean,
          })
        }
      })
      .catch((err) => {
        rafikeyChatbotStore.setStreamError({
          hasError: true,
          errorMessage: 'An error occurred, please try again later.',
          isLoggedIn: true,
        })
      })
      .finally(() => {
        rafikeyChatbotStore.isGeneratingResponse = false
        rafikeyChatbotStore.isNewChat = false
        rafikeyChatbotStore.setRegenerateResponse(false)
      })
  }
}


//date format
const timeFormatter = (timestamp: string) => {
  const date = moment(timestamp)
  if (now.isSame(date, 'day')) {
    return now
  } else if (now.subtract(1, 'days').isSame(date, 'day')) {
    return date.format('[Yesterday] h: mm A')
  } else if (now.subtract(1, 'weeks').isBefore(date, 'day')) {
    return date.format('dddd h: mm A')
  } else if (now.subtract(1, 'weeks').isAfter(date)) {
    return date.format('[Last]dddd h:mm A')
  } else if (now.subtract(1, 'years').isBefore(date)) {
    return date.format('MMMM D, dddd h:mm A')
  } else {
    return date.format('YYYY')
  }
}

const isShowProfile = ref(false)
const profileHandler = () =>{
  isShowProfile.value = !isShowProfile.value
}


// fetching chat history
const fetchHistoryHandler = (activeSessionId: string) => {
  rafikeyChatbotStore.conversation = []
  isLoading.value = true
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
        router.push({
          name: 'chatWithId',
          params: {
            sessionId: activeSessionId,
          },
        })
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

//check whether there is a string parameter if there is then  you should get the cha history
onMounted(() => {
  console.log("Mounted Chat Page-route")

  const activeSessionId = route.params.sessionId as string
  // We can only load chat history if the user is not on the new chat page

  if (!rafikeyChatbotStore.isNewChat) {
    console.log("Not new chat page")
    nextTick(()=>{
      fetchHistoryHandler(activeSessionId)
    })
  }
})

// check if the regenerate has been punched to regenerate the response
watch(()=> rafikeyChatbotStore.regenerateResponse, (newValue) =>{
  if(newValue){
    handleUserInput(rafikeyChatbotStore.regenerateUserInput)
  }
})


</script>

<template>
  <div class="p-6 dark:bg-lightgray min-h-screen overflow-hidden w-full">
    <div>
      <NavBar @fetch-history-handler="fetchHistoryHandler" />
    </div>
    <!--    right side-->
    <div v-if="!isLoading" class="relative w-full">
      <div
        class=""
        :class="[
          rafikeyChatbotStore.collapseSidebarLarge ? 'md:ml-32 duration-300' : 'ml-96 duration-300',
        ]"
      >
        <!--    top -->
        <div class="justify-end gap-4 w-11/12 sticky top-0 cursor-pointer flex">
          <div
            class="flex gap-1 justify-between border dark:border-white border-stone-300 rounded-lg px-2 py-1"
          >
            <span class="material-icons-outlined dark:text-stone-300 md:!text-lg !text-sm"
              >share</span
            >
            <span class="dark:text-white md:text-lg text-sm">Share</span>
          </div>
          <div class="">
            <span class="dark:text-white md:text-lg text-sm">Feedback</span>
          </div>
        </div>

        <RouterView #default="{ Component, route }">
          <template v-if="Component">
            <component :is="Component" :key="route.fullPath" />
          </template>
        </RouterView>

<!--        profile section-->
        <div :class="[rafikeyChatbotStore.collapseSidebarLarge? '': 'left-28 bottom-8 z-50']"
             v-show="isShowProfile" class="dark:bg-darkgray cursor-pointer fixed space-y-4 bottom-20 z-40 bg-white border-[1px] border-stone-300  w-60 p-4 rounded-2xl">
          <div class="space-y-3">
            <div class="flex gap-4">
              <span class="material-icons-outlined dark:text-white">article</span>
              <span class="dark:text-white">Terms and Conditions</span>
            </div>
            <div class="flex gap-4">
              <span class="material-icons-outlined dark:text-white">support</span>
              <span class="dark:text-white">Help</span>
            </div>
            <div
              @click.stop="modeToggleHandler()"
              class="flex gap-4">
              <span v-if="!isDark" class="material-icons-outlined text-stone-500 dark:text-white">dark_mode</span>
              <span v-else class="material-icons-outlined text-stone-500 dark:text-white">light_mode</span>
              <span v-if="!isDark" class="dark:text-white">Dark Mode</span>
              <span v-else class="dark:text-white">Light Mode</span>
            </div>
          </div>
          <div class="border-[0.5px] border-stone-300"></div>
          <div class="space-y-4">
            <div
              @click.stop="logoutHandler"
              class="flex gap-4">
              <span class="material-icons-round dark:text-white">exit_to_app</span>
              <span class="dark:text-white">Log Out</span>
            </div>
            <div class="flex gap-4">
              <span class="material-icons-round text-stone-400 dark:text-white">person_outline</span>
              <span class="text-stone-400">{{authStore.getUserInfo()?.username}}</span>
            </div>
          </div>
        </div>

        <!--    text area-->
        <div
          v-if="!rafikeyChatbotStore.isStreamError.hasError"
          ref="userInputContainerHeightRef"
          :class="[
            !rafikeyChatbotStore.collapseSidebarLarge
              ? 'md:left-96  md:w-[calc(100vw-28rem)]  duration-300 '
              : 'md:left-44 md:w-[calc(100vw-14rem)] duration-300 ',
          ]"
          class="fixed bottom-6 bg-white left-4 w-[calc(100vw-2rem)] dark:bg-lightgray"
        >
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
      </div>
    </div>

    <div v-else>
      <SpinnerLoading />
    </div>
  </div>
</template>

<style scoped></style>
