<script setup lang="ts">
import { ref, nextTick, onMounted, watch, onUnmounted, shallowRef } from 'vue'

import UserInput from '@/components/chat/UserInput.vue'
import _ from 'lodash'
import hljs from 'highlight.js'
import { marked, type RendererObject, type Tokens } from 'marked'
import { useRafikeyChatbotStore, type Conversation, useAuthStore, useNotificationStore } from '@/stores'
import { v4 as uuidV4 } from 'uuid'
import NavBar from '@/components/chat/NavBar.vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment/moment'
import { useDark, useToggle, useMediaQuery } from '@vueuse/core'
import DialogModal from '@/components/DialogModal.vue'
import { Copy } from 'lucide-vue-next'

import TabComponent, { type Tabs } from '@/components/tab/TabComponent.vue'
import GeneralTab from '@/components/tab/GeneralTab.vue'
import PersonalizationComponent from '@/components/tab/PersonalizationComponent.vue'
import SecurityComponent from '@/components/tab/SecurityComponent.vue'


export interface HistoryConv {
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
const profileSectionElement = ref<HTMLDivElement | null>()
const linkChatInput = ref('')
const showSocials = ref<boolean>(false)
const isGeneratingLink = ref(false)
const showCopyBtn = ref(false)
const isShareChatLinkCopy = ref(false)
const notificationStore = useNotificationStore()

// const isGeneratingResponse = ref(false)
const now = moment()


const components = [
  {
    id: 1,
    name: 'General',
    component: GeneralTab,
  },
  {
    id: 2,
    name: 'Personalisation',
    component: PersonalizationComponent,
  },
  {
    id: 3,
    name: 'Security',
    component: SecurityComponent,
  },
]

const activeComponent = shallowRef(components[0])
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
    rafikeyChatbotStore.conversation.push(userMessage.value)
    console.log('User message----', userMessage.value)

    const rafikeyMessage = ref<Conversation>({
      message: '',
      isUser: false,
      isTyping: true,
      uniqueId: _.uniqueId('rafikey-'),
      timestamp: '',
    })
    //   push rafikey message to the array
    setTimeout(() => {
      rafikeyChatbotStore.conversation.push(rafikeyMessage.value)
    }, 500)
    rafikeyChatbotStore.isGeneratingResponse = true
    console.log('conversation array', rafikeyChatbotStore.conversation)

    rafikeyChatbotStore
      .sendMessageToRafikeyChatbot({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {
          // console.log('Rafikey response', res)
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

    rafikeyChatbotStore.isGeneratingResponse = true

    rafikeyChatbotStore
      .sendMessageToRafikeyChatbot({
        message: formatted,
        sessionId: rafikeyChatbotStore.getSessionId,
      })
      .then((res) => {
        if (res?.result === 'ok') {
          // console.log('Rafikey response', res)
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
        router.replace({
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
  const activeSessionId = route.params.sessionId as string

  // Set initial value for isSmallScreen
  isSmallScreen.value = rafikeyChatbotStore.isNewChat && isSmallDevice.value;

  // We can only load chat history if the user is not on the new chat page
  if (!rafikeyChatbotStore.isNewChat) {
    nextTick(()=>{
      fetchHistoryHandler(activeSessionId)
    })
  }
  // create listeners once the component is mounted
  document.addEventListener('click', closeProfileSection)
})

// Destroy the listeners to prevents memory leaks and unwanted side effects
onUnmounted(()=>{
  document.removeEventListener('click', closeProfileSection)
// watch(rafikeyChatbotStore.accessButtonRequest, (val)=>{
//   if(val.value){
//     console.log('Access button request', val)
//     nextTick(()=>{
//       handleUserInput(val.message)
//     })
//
//     // rafikeyChatbotStore.setAccessButtonRequest('')
//   }
//
// })

})


// if someone clicks outside the profile section area when the profile section  is open it closes
const closeProfileSection = (event: MouseEvent) => {
  if(profileSectionElement.value && !profileSectionElement.value.contains(event.target as HTMLElement)) {
    isShowProfile.value = false
  }
}


// check if the regenerate has been punched to regenerate the response
watch(()=> rafikeyChatbotStore.regenerateResponse, (newValue) =>{
  console.log("Regenerate response")
  if(newValue){
    handleUserInput(rafikeyChatbotStore.regenerateUserInput)
  }
})


const showLogoutDialogModal = ref(false)
const confirmLogoutHandler = () =>{
  showLogoutDialogModal.value = true

}

const logoutHandler = () =>{
  authStore.logout()
  router.push({ name: 'login' })
}

const cancelLogout = () =>{
  showLogoutDialogModal.value = false
  isShowProfile.value = false
}

const isSmallScreen = ref(false)
const isSmallDevice = useMediaQuery('(max-width: 767px)')


// Checking for small devices and hiding the user input
watch(()=>isSmallDevice.value, (val)=>{
    isSmallScreen.value = rafikeyChatbotStore.isNewChat && val;
})

const termsConditionHandler = ()=>{
  router.push({ name: 'privacy-policy-1' })
  rafikeyChatbotStore.isShowTermsButton = false
}

const modeToggleHandler = useToggle(isDark)
const isProfile = ref(false)

const isProfileHandler = (val: boolean) => {
  isProfile.value = val
}

const dialogWidth = 'max-w-[600px]'
const tabHandler = (tab: Tabs) => {
  activeComponent.value = components.find((component) => component.id === tab.id) || components[0]
}

const showSettingDialog = ref(false)
const isShare = ref(false)

const shareData = {
  title:  "Rafikey Ai",
  text: "Talk freely. Learn safely. Own your sexual health with Rafikey AI 💬✨❤️",
  url: `${rafikeyChatbotStore. RAFIKEY_CHATBOT_FRONTEND_URL }/guest-user/${rafikeyChatbotStore.sessionId}`

}

// share of the chat links using the webShare API
async function  shareChat (){
  if(navigator.share){
    try{
      await navigator.share(shareData)
    } catch(error){
      console.log("An errror has occurred")
    }
  }
  // If native sharing mechanism is not supported on this device
  else{
    isShare.value = true

  }
}

const generateLink = () => {
  isGeneratingLink.value = true
  setTimeout(() => {
    linkChatInput.value = shareData.url
    isGeneratingLink.value = false
    showCopyBtn.value = true
    showSocials.value = true
  }, 2000)

}


const copyShareChatLink = ()=>{
  if(!navigator.clipboard){
    notificationStore.addNotification('Your browser does not support clipboard feature, please switch to a different browser', 'error')
  } else{
    if(typeof navigator.clipboard.writeText === 'function'){
      try{
        navigator.clipboard.writeText(linkChatInput.value as string)
        isShareChatLinkCopy.value = true
      }
      catch(error){
        console.error(error)
        notificationStore.addNotification('Failed to copy chat link, please try again', 'error')
      }
      finally {
        setTimeout(()=>{
          isShareChatLinkCopy.value = false
        }, 2000)
      }
    }
  }
}


const shareOn = (value: string) =>{
  const urlToShare = linkChatInput.value as string
  const encodeURL = encodeURIComponent(urlToShare)
  let shareUrl = ''
  const message = encodeURIComponent(shareData.text)
  if(value === 'facebook'){
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURL}&quote=${message}`
  }else if(value === 'twitter'){
    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURL}&text=${message}`
  }else if(value === 'whatsapp'){
    shareUrl = `https://api.whatsapp.com/send?text=${message}%20${encodeURL}`
  }else if(value === 'linkedIn'){
    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURL}`
  }
  window.open(shareUrl, '_blank')
}
</script>

<template>
  <div class="relative p-6 dark:bg-lightgray h-screen overflow-hidden w-full">
    <div>
      <NavBar
        @fetch-history-handler="fetchHistoryHandler"
        @share-chat="shareChat"
        @profile-handler="profileHandler"
        @is-profile="isProfileHandler"
      />
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
        <div
          v-if="!rafikeyChatbotStore.isNewChat"
          class="hidden justify-end gap-4 w-11/12 sticky top-0 cursor-pointer md:flex"
        >
          <div
            @click.stop="shareChat"
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
        <div class="md:hidden block sticky top-0 backdrop-blur-2xl dark:bg-black z-10 bg-white">
          <div
            class="flex justify-between bg-link-water dark:bg-lightgray bg-white z-10 p-4 backdrop-blur"
          >
            <div class="flex gap-4 cursor-pointer" @click="router.go(-1)">
              <span class="material-icons-outlined dark:text-white">arrow_back</span>
              <span class="dark:text-white">Chatting With Rafikey</span>
            </div>
            <div
              @click="rafikeyChatbotStore.setCollapseSidebarSmall(false)"
              class="btn btn-sm btn-ghost shadow-none bg-transparent hover:border-none"
            >
              <span class="material-icons-outlined dark:text-white">more_horiz</span>
            </div>
          </div>
        </div>

        <RouterView #default="{ Component, route }">
          <template v-if="Component">
            <component :is="Component" :key="route.fullPath" @user-input="handleUserInput" />
          </template>
        </RouterView>

        <!--        profile section-->
        <div
          :class="[rafikeyChatbotStore.collapseSidebarLarge ? '' : 'left-28 bottom-8 z-50']"
          ref="profileSectionElement"
          v-show="isShowProfile"
          class="md:block hidden divide-y divide-solid dark:divide-stone-700 dark:bg-darkgray cursor-pointer fixed space-y-4 bottom-20 z-40 bg-white shadow-2xl w-60 p-4 rounded-2xl"
        >
          <div class="space-y-1">
            <div
              @click.stop="termsConditionHandler"
              class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
            >
              <span class="material-icons-outlined dark:text-white !text-xl">article</span>
              <span class="dark:text-white text-gray-700">Terms and Conditions</span>
            </div>
            <div
              @click="showSettingDialog = true"
              class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
            >
              <span class="material-icons-outlined dark:text-white !text-xl">settings</span>
              <span class="dark:text-white text-gray-700">Settings</span>
            </div>
            <div
              @click.stop="modeToggleHandler()"
              class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
            >
              <span v-if="!isDark" class="material-icons-outlined dark:text-white !text-xl"
                >dark_mode</span
              >
              <span v-else class="material-icons-outlined dark:text-white">light_mode</span>
              <span v-if="!isDark" class="dark:text-white text-gray-700">Dark Mode</span>
              <span v-else class="dark:text-white text-gray-700">Light Mode</span>
            </div>
          </div>
          <!--          <div class="divide-y divide-solid  "></div>-->
          <div class="space-y-1 pt-2">
            <div
              @click.stop="confirmLogoutHandler"
              class="flex gap-4 hover:bg-lightBackground dark:hover:bg-stone-700 rounded-lg px-2 py-1"
            >
              <span class="material-icons-round dark:text-white !text-xl">exit_to_app</span>
              <span class="dark:text-white text-gray-700">Log out</span>
            </div>
            <div class="flex gap-4 rounded-lg px-2 py-1">
              <span class="material-icons-round text-stone-400 dark:text-white"
                >person_outline</span
              >
              <span class="text-stone-400">{{ authStore.getUserInfo()?.username }}</span>
            </div>
          </div>
        </div>

        <!--    text area-->
        <div
          v-if="!rafikeyChatbotStore.isStreamError.hasError && !isSmallScreen"
          ref="userInputContainerHeightRef"
          :class="[
            !rafikeyChatbotStore.collapseSidebarLarge
              ? 'md:left-96  md:w-[calc(100vw-28rem)]  duration-300 '
              : 'md:left-44 md:w-[calc(100vw-14rem)] duration-300 ',
          ]"
          class="fixed bottom-6 bg-white left-4 w-[calc(100vw-2rem)] dark:bg-lightgray"
        >
          <div class="bg-white backdrop-blur-2xl md:pb-6 dark:bg-lightgray">
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

    <!--    <div v-else>-->
    <!--      <SpinnerLoading />-->
    <!--    </div>-->
    <Teleport to="body">
      <DialogModal
        :is-open="showLogoutDialogModal"
        @close-modal="showLogoutDialogModal = !showLogoutDialogModal"
      >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-round dark:text-white !text-4xl">&#128546;</span>
          </div>
        </template>
        <template #body>
          <div class="flex flex-col items-center py-2">
            <p class="dark:text-white text-lg lg:text-xl">Are you Sure?</p>
            <span class="dark:text-white text-lg lg:text-lg">You want to log out?</span>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center gap-4">
            <button
              @click.stop="logoutHandler"
              class="btn btn-sm border-none outline-none bg-casablanca-300 shadow-none px-4 rounded-lg"
            >
              <span class="">Ok</span>
              <!--              <span v-else class="loading loading-spinner loading-sm"></span>-->
            </button>
            <button
              @click="cancelLogout"
              class="btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg dark:text-white"
            >
              <span>Cancel</span>
            </button>
          </div>
        </template>
      </DialogModal>
    </Teleport>

    <!--    setting dialog-->

    <DialogModal
      :max-width="dialogWidth"
      :is-open="showSettingDialog"
      @close-modal="showSettingDialog = !showSettingDialog"
    >
      <template #title>
        <TabComponent @tab-change="tabHandler" />
      </template>
      <template #body>
        <div>
          <component :is="activeComponent.component" />
        </div>
      </template>
      <template #footer> </template>
    </DialogModal>
    <DialogModal
      :is-open="isShare && !rafikeyChatbotStore.isGeneratingResponse"
      @close-modal="isShare = false"
    >
      <template #title>
        <div class="flex flex-row-reverse justify-between">
          <div @click="isShare = false" class="cursor-pointer">

              <span class="material-icons-outlined dark:text-white">close</span>

          </div>
          <div>
            <span class="font-semibold text-lg dark:text-white">Share link chat on social</span>
          </div>
        </div>
      </template>
      <template #body>
        <div>
          <p class="dark:text-white">Generate link to share with friends on social media platforms.</p>
        </div>
      </template>


      <template #footer>
        <div class="flex flex-col">
          <div
            class="md:space-x-2 w-full flex items-center border-[0.5px] py-3 !rounded-2xl px-3"
          >
            <input
              type="text"
              @copy.prevent
              @cut.prevent
              @paste.prevent
              readonly
              v-model="linkChatInput"
              class="select-none dark:bg-lightgray dark:text-white h-10 w-9/12 overflow-ellipsis  focus:outline-none focus:ring-0 focus:border-transparent  line-clamp-1  md:ps-2 ps-1  me-0.5  rounded-md"
              placeholder="https://rafikeyaichatbot-frontend.onrender.com/..."
            />
            <div
              @click="generateLink"
              v-if="!isGeneratingLink && !showCopyBtn"
              class="dark:text-white rounded-2xl bg-transparent border-gray-300 btn btn-sm"
            >
              <span class="">generate link</span>
              <!--              <span v-else  class="loading loading-spinner loading-md text-white"></span>-->
            </div>
            <div
              v-if="isGeneratingLink && !showCopyBtn"
              class="btn btn-sm rounded-xl"
              disabled
            >
              <span class="">generating...</span>
              <span class="loading loading-spinner loading-md "></span>
            </div>
            <div
              v-if="showCopyBtn"
              @click="copyShareChatLink"
              class="btn btn-sm btn-ghost border-gray-300 rounded-2xl bg-transparent dark:text-white"
            >
              <Copy />
              <span v-if="!isShareChatLinkCopy">Copy link</span>
              <span v-else>Copied</span>
            </div>
          </div>
          <div v-if="showSocials" class="flex flex-row justify-center py-4 w-full mx-auto">
            <div>
              <div @click.stop="shareOn('linkedIn')" class="btn btn-sm btn-ghost w-14 h-14">
                <img src="@/assets/images/linkedin.png" alt="linkedin_logo" />
              </div>
              <span  class="dark:text-white">LinkedIn</span>
            </div>

            <div>
              <div @click.stop="shareOn('whatsapp')" class="btn btn-sm btn-ghost w-14 h-14">
                <img src="@/assets/images/whatsapp.png" alt="whatsapp_logo" />
              </div>
              <span  class="dark:text-white">Whatsapp</span>
            </div>
            <div>
              <div @click.stop="shareOn('facebook')" class="btn btn-sm btn-ghost w-14 h-14">
                <img src="@/assets/images/facebook.png" alt="facebook_logo" />
              </div>
              <span  class="dark:text-white">Facebook</span>
            </div>
            <div>
              <div @click.stop="shareOn('twitter')" class="btn btn-sm btn-ghost w-14 h-14">
                <img src="@/assets/images/twitter.png" alt="twitter_logo" />
              </div>
              <span class="dark:text-white">Twitter</span>
            </div>
          </div>
        </div>
      </template>
    </DialogModal>
  </div>
</template>

<style scoped></style>
