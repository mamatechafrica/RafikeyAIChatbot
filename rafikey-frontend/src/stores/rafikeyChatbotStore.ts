import { defineStore } from 'pinia'
import { computed, ref, watch, reactive } from 'vue'
import { useDark, useStorage } from '@vueuse/core'
import { get } from 'lodash';
import { useAuthStore } from '@/stores/authStore.ts'


interface ChatbotConversationPayload {
  message: string
  sessionId: string
}

export interface ChatHistoryTitle {
  thread_id: string,
  title: string
  last_message_at: string

}
export interface Conversation {
  message: string
  isUser: boolean
  isTyping?: boolean
  hasError?: boolean
  uniqueId: string | number
  timestamp?: string
}

export interface Setting {
  key: string,
  value: boolean
}


const RAFIKEY_CHATBOT_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT as string
export const useRafikeyChatbotStore = defineStore('rafikeyChatbotStore', ()=>{
  const sessionId = useStorage("sessionId", '');
  const isGeneratingResponse = ref(false)
  const isDarkMode = useStorage("isDarkMode", false)
  const previousRoute =  useStorage("previousRoute", '')
  const isNewChat = useStorage("isNewChat", true)
  const isShowTermsButton = useStorage("isShowTermsButton", true)
  const isAnonymous = ref<boolean>(false)
  const isStreamError = reactive({
    hasError: false,
    errorMessage: '',
    isLoggedIn: true,
  })
  const getSessionId = computed(()=> sessionId.value)
  const buffer = ref<string>('')
  const regenerateResponse = ref(false)
  const regenerateUserInput = useStorage("regenerateUserInput", '')
  const isDark = useDark({
    onChanged(dark: boolean){
      isDarkMode.value = dark
    }
  })
  const accessButtonRequest = reactive({
    value: false,
    message: ''
  })
const otherSettings = useStorage("otherSettings", {})



  const chatHistoryTitles = ref<ChatHistoryTitle []>([])
  const conversation = ref<Conversation[]>([])
  const setSessionId = (value: string) => {
    sessionId.value = value
  }

  const dialogModal = ref({
    isOpen: false,
  })

  const collapseSidebarSmall = ref(true)
  const setCollapseSidebarSmall = (value: boolean) => {
    collapseSidebarSmall.value = value
  }

  const collapseSidebarLarge = ref(true)
  const setCollapseSidebarLarge = (value: boolean) => {
    collapseSidebarLarge.value = value
  }

  const setDialogModal = (value: boolean) => {
    dialogModal.value.isOpen = value
  }


//   send message to Rafikeychatbot
  async function sendMessageToRafikeyChatbot(payload: ChatbotConversationPayload) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/bot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({
          message: payload.message,
          session_id: payload.sessionId,
        }),
      })
      // initial HTTP response level check
      if(!response.ok){
        if(response.status === 401){
          console.log('Unauthorized access - please login')
          return {
            result: 'fail',
            data: 'Your session has expired, please login to continue',
            isLoggedIn: false
          }
        } else{
          console.log('Failed to send message to RafikeyChatbot')
          return {
            result: 'fail',
            data: 'An error occurred, please try again later',
            isLoggedIn: true
          }
        }
      }
      else{
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

          while (true){
            const { done, value } = await reader?.read() as ReadableStreamReadResult<Uint8Array>
            if (done) break
            buffer.value += decoder.decode(value, { stream: true })
          }
          // console.log('Rafikey response:', buffer.value)
          return {
            result: 'ok',
            data: buffer.value
          }
      }
    }
    catch (error) {
      console.log('Error sending message to RafikeyChatbot', error)
      return
    }
    // clear the variable
    finally {
      buffer.value = ''
    }

  }

  // anonymous user send message to RafikeyChatbot
  async function sendMessageToRafikeyChatbotAnonymous(payload: ChatbotConversationPayload) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/bot/anonymous_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: payload.message,
          session_id: payload.sessionId,
        }),
      })
      if(!response.ok){
        console.log(response.status)
        return {
          result: 'fail',
          data: 'An error occurred, please try again later',
        }
      }
      else{
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
          // return response.json()
        while (true) {
          const { done, value } = await reader?.read() as ReadableStreamReadResult<Uint8Array>
          if (done) break
           buffer.value += decoder.decode(value, { stream: true })
        }
        return {
          result: 'ok',
          data: buffer.value
        }
      }
    }
    catch (error) {
      console.log('Error sending message to RafikeyChatbot', error)
      return
    }
      // clear the variable
    finally {
      buffer.value = ''
    }
  }


  // Get chat histories
  async function getChatHistoryTitles() {
    // console.log('Here in the chat history')
    const authStore = useAuthStore()
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/chatbot/my-conversations/threads`, {
        method: 'GET',
        headers : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        // body: JSON.stringify({
        //   username: authStore.getUserInfo()?.username
        // })
      })
      const {threads, total_threads} = await response.json()
       console.log('titles----', threads)
      if(!response.ok){
        return {
          result: 'fail',
          data: null
        }
      }
      else {
        return {
          result: 'ok',
          data: threads
        }
      }

    }
    catch(e){
      console.error('Error fetching chat history titles:', e)
    }
  }

  async function getChatHistory(value: string) {
    const authStore = useAuthStore()
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/chatbot/conversations/${value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
      })
      const chatHistory = await response.json()
      if(!response.ok){
        return {
          result: 'fail',
          data: null
        }
      }
      else {
        return {
          result: 'ok',
          data: chatHistory
        }
      }

    }
    catch(e){
      console.error('Error fetching chat history:', e)
    }
  }

  // Set active chat hitory

  const setActiveChatHistory = (value: string)=>{
    sessionId.value = value
  }

  // set streamError
  const setStreamError = (value: {hasError: boolean, errorMessage: string, isLoggedIn: boolean}) => {
    isStreamError.hasError = value.hasError
    isStreamError.errorMessage = value.errorMessage
    isStreamError.isLoggedIn = value.isLoggedIn
  }

  // set regenerate res
  const setRegenerateResponse = (value:boolean) => {
    regenerateResponse.value = value
  }

  // const setRegenerateInput = (value: string) => {
  //   regenerateUserInput = value
  // }

  const setAccessButtonRequest = (message: string) =>{
    accessButtonRequest.value = true
    accessButtonRequest.message = message
  }
  const setOtherSettings = (setting: Setting) =>{
  // update local storage with the new setting
    otherSettings.value = {
      ...otherSettings.value,
      [setting.key]: setting.value
    }
  }

  const getOtherSettings = computed(()=>{
    const setting = localStorage.getItem('otherSettings')
    if(setting){
      return JSON.parse(setting)
    } else {
      return null
    }
  })


  return {
    sendMessageToRafikeyChatbot,
    sessionId,
    setSessionId,
    getSessionId,
    dialogModal,
    setDialogModal,
    collapseSidebarSmall,
    setCollapseSidebarSmall,
    collapseSidebarLarge,
    setCollapseSidebarLarge,
    isDarkMode,
    getChatHistoryTitles,
    chatHistoryTitles,
    setActiveChatHistory,
    conversation,
    getChatHistory,
    isGeneratingResponse,
    sendMessageToRafikeyChatbotAnonymous,
    previousRoute,
    isNewChat,
    isStreamError,
    setStreamError,
    regenerateResponse,
    setRegenerateResponse,
    regenerateUserInput,
    isDark,
    isShowTermsButton,
    accessButtonRequest,
    setAccessButtonRequest,
    isAnonymous,
    otherSettings,
    setOtherSettings,
    getOtherSettings


    // setRegenerateInput

  }
})
