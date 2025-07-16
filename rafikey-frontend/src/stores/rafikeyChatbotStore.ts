import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
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



const RAFIKEY_CHATBOT_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT as string
export const useRafikeyChatbotStore = defineStore('rafikeyChatbotStore', ()=>{
  const sessionId = useStorage("sessionId", '');
  const isGeneratingResponse = ref(false)
  const isDarkMode = useStorage("isDarkMode", false)

  const isDark = useDark({
    onChanged(dark: boolean){
      isDarkMode.value = dark
      console.log('Dark mode changed:', dark)
    }
  })




  const chatHistoryTitles = ref<ChatHistoryTitle []>([])
  const conversation = ref<Conversation[]>([])
  const setSessionId = (value: string) => {
    sessionId.value = value
  }

  const dialogModal = ref({
    isOpen: false,
  })

  const collapseSidebarSmall = ref(false)
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

  const getSessionId = computed(()=> sessionId.value)
const rafikeyResponse = ref<string>('')
//   send message to Rafikeychatbot
  async function sendMessageToRafikeyChatbot(payload: ChatbotConversationPayload) {
    const authStore = useAuthStore()
    console.log('Token ---', authStore.token)
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
      if(!response.body){
        console.log('No response body')
        return
      }
      else{
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        // return response.json()
        while (true){
          const { done, value } = await reader?.read() as ReadableStreamReadResult<Uint8Array>
          if (done) break
          rafikeyResponse.value += decoder.decode(value, { stream: true })
          console.log('Rafikey response:', rafikeyResponse.value)
          // return rafikeyResponse.value

        }
        return rafikeyResponse.value

      }

    }
    catch (error) {
      console.log('Error sending message to RafikeyChatbot', error)
      return
    }
    // clear the variable
    finally {
      rafikeyResponse.value = ''
    }

  }

  // Get chat histories
  async function getChatHistoryTitles() {
    console.log('Here in the chat history')
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
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/chatbot/conversations/${value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore().token}`
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
  }
})
