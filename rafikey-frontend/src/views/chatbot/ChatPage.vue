<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import RafikeyBubble from '@/components/chat/bubble/RafikeyBubble.vue'
import UserBubble from '@/components/chat/bubble/UserBubble.vue'
import TextArea from "@/components/chat/UserInput.vue";
import UserInput from "@/components/chat/UserInput.vue";
import _ from 'lodash'
import hljs from 'highlight.js'
import {marked, type RendererObject, type Tokens} from 'marked'
import {useNotificationStore, useRafikeyChatbotStore} from "@/stores";
import moment from "moment";
import {v4 as uuidV4} from 'uuid'
import ToastContainer from "@/components/toasts/ToastContainer.vue";
import ToastAlert from "@/components/toasts/ToastAlert.vue";

export interface Conversation {
  message: string
  isUser: boolean
  isTyping?: boolean
  hasError?: boolean
  uniqueId: string | number
}

const rafikeyChatbotStore = useRafikeyChatbotStore()
const conversation = ref<Conversation []>([])
const isGeneratingResponse = ref(false)
const now = moment().format('LT')
const isBottom = ref(false)
const conversationContainerRef = ref<HTMLDivElement | null>()
const isScrollable = ref(false)
const notificationStore = useNotificationStore()

// scrolltop bottom when rafikey chatbot is typing

const scrollToBottom = () => {
  const userInputPlaceholder = document.getElementById("#userInputPlaceholder")
  userInputPlaceholder?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest'
  })


}

const renderer: RendererObject = {
  link({href, title, text}: Tokens.Link) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table({header: hd, rows, align}: Tokens.Table) {
    const header = hd.map(({text, header}) => {
      return `
      <th class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</th>
    `
    }).join('\n')

    const body = rows.map((row) => {
      return `
      <tr>${row.map(({text, header}) => {
        return `
        <td class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</td>
      `
      }).join('\n')}</tr>
    `
    }).join('\n')

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
  code({text: code, lang: language, codeBlockStyle, escaped}: Tokens.Code) {
    // return `
    //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    if (language) {
      const ignoreIllegals = true
      return `
  <div class="p-2 flex w-full">
       <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${hljs.highlight(code, {
        language,
        ignoreIllegals
      }).value}</code></div></div></pre>
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
  list({ordered, start, loose, items}: Tokens.List) {
    console.log('items is -> ', items)
    const body = items.map(({task, checked, loose, text}) => {
      return `
      <li class="text-base-accent text-sm md:text-md">${marked.parseInline(text)}</li>
      `
    }).join('\n')

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
  listitem({task, checked, loose, text}: Tokens.ListItem) {
    return `
    <li class="text-base-accent text-sm lg:text-lg md:text-md">${marked.parseInline(text)}</li>
  `
  },
  paragraph({text, pre}: Tokens.Paragraph) {
    return `
    <p class="text-base-accent leading-relaxed text-sm md:text-md">${marked.parseInline(text)}</p>
  `
  },
  heading({text, depth: level}: Tokens.Heading) {
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
  blockquote({text: quote}: Tokens.Blockquote) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 pl-4">${quote}</blockquote>
  `
  },
  image({href, title, text}: Tokens.Image) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong({text}: Tokens.Strong) {
    return `
    <strong class="!text-peach-900 font-semi-bold  my-2.5 text-sm md:text-lg">${text}</strong>
  `
  },
  codespan({text: code}: Tokens.Codespan) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  em({text}: Tokens.Em) {

    return `
    <em class="font-light my-1 text-sm md:text-md">${text}</em>
  `
  },
  del({text}: Tokens.Del) {
    return `
    <del class="font-poppins-light my-1 text-sm md:text-md">${text}</del>
  `
  },
  text({text, type}: Tokens.Text | Tokens.Escape | Tokens.Tag) {
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
  }
}

marked.use({
  renderer,
  breaks: true,
  gfm: true,
  useNewRenderer: true
})

// User input
const handleUserInput = (
  value: string,
  formatted: string
) => {

  // create userMessage object
  const userMessage = ref<Conversation>({
    message: formatted,
    isUser: true,
    uniqueId: _.uniqueId('user-')
  })
//   push user message to the array
  conversation.value.push(userMessage.value)

//   create Rafikey message object
  const rafikeyMessage = ref<Conversation>({
    message: '',
    isUser: false,
    isTyping: true,
    uniqueId: _.uniqueId('rafikey-')
  })

  scrollToBottom()

//   push rafikey message to the array
  setTimeout(() => {
    conversation.value.push(rafikeyMessage.value)
  }, 500)

  isGeneratingResponse.value = true

  conversation.value.map((conv) => {
    console.log(conv.message)
  })
  rafikeyChatbotStore.sendMessageToRafikeyChatbot(
    {
      message: formatted,
      sessionId: rafikeyChatbotStore.getSessionId,
    }
  )
    .then((res) => {
      console.log('Rafikey response', res)
      const rafikeyAllObject = conversation.value.filter((conv) => !conv.isUser)
      const currentRafikeyObject = rafikeyAllObject[rafikeyAllObject.length - 1]

      if (currentRafikeyObject) {
        currentRafikeyObject.message = res as string
      }
    })
    .catch((err) => {
      console.log('There is an error in rafikey response', err)

    })
    .finally(() => {
      isGeneratingResponse.value = false
      rafikeyMessage.value.isTyping = false
      rafikeyMessage.value.hasError = true
    })

//   send user message to the server
}
const currentHtmlPosition = ref(0)
const conversationContainerHeight = ref(0)
document.addEventListener('scroll', () => {
  currentHtmlPosition.value = document.documentElement.scrollTop
  if (conversationContainerRef.value) {
    isBottom.value = conversationContainerRef.value.scrollHeight >= conversationContainerRef.value.scrollHeight - conversationContainerRef.value.clientHeight
  }
})

watch(conversation.value, () => {
  if (conversationContainerRef.value) {
    conversationContainerHeight.value = conversationContainerRef.value.clientHeight || 0
  }
  scrollToBottom()
})
onMounted(()=>{
  rafikeyChatbotStore.setSessionId(uuidV4())
})
</script>

<template>
  <div class="relative h-screen w-full" ref="conversationContainerRef">
    <div class="xl:w-8/12 w-10/12 mx-auto">
      <div class="flex md:flex-row flex-col justify-center items-center w-full gap-4 pt-6">
        <div class="">
          <img class="w-10 h-10" src="@/assets/images/chatbot.png" alt="chatbot-image"/>
        </div>
        <div class="flex flex-col justify-center leading-none">
          <h1 class="md:text-4xl text-2xl text-center">Rafikey Ai</h1>
          <p class="text-lg">Let's talk sexual and reproductive health</p>
        </div>
      </div>
      <!--    chat bubbles-->
      <div class="pt-10 h-full ">
        <RafikeyBubble
          :chatbot-name="'Rafikey'"
          :original-message="'Hello Rafiki how can I help?'"
          :key="1"
          :is-typing="false"
          :is-copyable="false"
          :is-error="false"
          :created-at="now"
          :is-generating-response="false"
        />
        <ul>
          <template v-for="(conv, index) in conversation" :key="index">
            <UserBubble
              v-if="conv.isUser &&
              conv.message.length > 0 &&
              !conv.isTyping"
              :user-message="conv.message"
              :user-name="'You'"
              :created-at="now"
              :is-generating-response="isGeneratingResponse"
              :key="conv.uniqueId"
            />
            <RafikeyBubble
              v-if="
              !conv.isUser
              "
              :chatbot-name="'Rafikey'"
              :rafikey-chatbot-message="marked.parse(conv.message) as string"
              :is-typing="false"
              :is-copyable="false"
              :is-error="false"
              :created-at="now"
              :is-generating-response="isGeneratingResponse"
              :key="conv.uniqueId"
            />

          </template>

        </ul>
      </div>


        <div ref="userInputContainerHeightRef" class="sticky w-full bottom-0 bg-white ">
          <div v-if="isBottom"
               class="py-12 mt-6 bg-gradient-to-t from-main-color-light-color block"></div>
          <div class="fixed bottom-10 left-0 right-0 bg-white backdrop-blur-2xl z-999">
            <div class="">
              <UserInput
                class="xl:w-10/12 mx-auto w-10/12"
                :disabled="false"
                :is-generating="isGeneratingResponse"
                @user-input="handleUserInput"
              />
            </div>
          </div>
        </div>

        <div id="#userInputPlaceholder"></div>


      </div>
    <Teleport to="body">
      <ToastContainer v-if="notificationStore.hasNotifications">
        <template v-for="notification in notificationStore.getNotifications" :key="notification.id">
          <ToastAlert
            v-if="notification.id && notification.isShown"
            :id="notification.id"
            :is-shown="notification.isShown"
            :message="notification.message"
            :type="notification.type"
          />
        </template>
      </ToastContainer>
    </Teleport>


    </div>


</template>

<style scoped>

</style>
