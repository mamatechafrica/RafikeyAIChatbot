import { defineStore } from 'pinia'
import { computed, ref, watch, reactive } from 'vue'
import { useDark, useStorage } from '@vueuse/core'
import { get } from 'lodash';
import { useAuthStore } from '@/stores/authStore.ts'
import type { Answer } from '@/components/game/QuestionItem.vue'
import type { Feedback } from '@/components/chat/FeebackDialog.vue'


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

export interface Quiz {
  text: string
  order: number
  id: number
  quiz_id: number
}
interface CorrectAnswer {
  correct: boolean | null
  feedback: string
  correctAnswerId?: string
}



const RAFIKEY_CHATBOT_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT as string
const RAFIKEY_CHATBOT_FRONTEND_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT_FRONTEND as string

export const useRafikeyChatbotStore = defineStore('rafikeyChatbotStore', ()=>{
  const authStore = useAuthStore()
  const sessionId = useStorage("sessionId", '');
  const isGeneratingResponse = ref(false)
  const isDarkMode = useStorage("isDarkMode", false)
  const previousRoute =  useStorage("previousRoute", '')
  const isNewChat = useStorage("isNewChat", true)
  const isAnonymous = ref<boolean>(false)
  const isMoveNext = ref(false)
  const correctAnswer = ref<CorrectAnswer>()
  const isSelected = ref(false)
  const totalQuestions =useStorage("totalQuestions", 0)
  const score = useStorage('score', 0)
  const isShowPlayButton = ref(false)
  const isChatArchive = useStorage("isChatArchive", false)

  const isStreamError = reactive({
    hasError: false,
    errorMessage: '',
    isLoggedIn: true,
  })

  const quizzes = useStorage('quizzes',<Quiz[]>([]))
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


  async function deleteAllChats() {
    const authStore = useAuthStore()
    try{
      const  response = await fetch(`${RAFIKEY_CHATBOT_URL}/chatbot/conversations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
      })

      const res = await response.json()
      console.log('Delete all chats response:', res)
      if(!response.ok){
        return {
          result: 'fail',
          data: res.detail
        }
      } else {
        return {
          result: 'ok',
          data: 'All chat history deleted successfully'
        }
      }
    } catch(e){
      console.error('Error deleting chat history:', e)
      return {
        result: 'fail',
        data: 'An error occurred while deleting chat history'
      }
    }
  }

  async function getQuizCategory () {
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/gamification/quizzes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authStore.token}`
        }
      })

      const res = await response.json()

      if(!response.ok){
        return {
          result: 'fail',
          data: null
        }
      } else {
        return {
          result: 'ok',
          data: res
        }
      }
    } catch(e){
      console.log(e)
    }
  }


  async function getQuizzes(quizId: Number){
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/gamification/quizzes/${quizId}/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authStore.token}`
        }
      })
      const res = await response.json()
      if(!response.ok){
        return{
          result: 'fail',
          data: null
        }
      }else{
        return {
          result: 'ok',
          data: res
        }
      }
    }  catch(e){
      console.log(e)
    }
  }

  async function getQuestion(questionId: Number){
    try{
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}/gamification/questions/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authStore.token}`
        }
      })
      const res = await response.json()
      if(!response.ok){
        return{
          result: 'fail',
          data: null
        }
      }else{
        return {
          result: 'ok',
          data: res
        }
        // return{
        //   result: 'fail',
        //   data: null
        // }
      }
    }  catch(e){
      console.log(e)
    }
  }


  async function answerQuestion (payload: Answer){
    const formData = new FormData();
    // formData.append('question_id', payload.questionId.toString())
    formData.append('selected_option_id', payload.optionId.toString())
    try{
      const response = await  fetch(`${RAFIKEY_CHATBOT_URL}/gamification/questions/${payload.questionId}/answer/?selected_option_id=${payload.optionId}`, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${authStore.token}`
        },
        // body: formData
      })
      const res = await response.json()
      if(!response.ok){
        return {
          result: 'fail',
          data: null
        }
      } else {
        return {
          result: 'ok',
          data: res
        }
      }
    }
    catch(e){
      console.error(e)
    }
  }

  // async function getScore(){
  //   try{
  //
  //   }
  // }

  async function ratingFeedback(payload: Feedback){
    const authStore =  useAuthStore()
    try{
      const response  = await fetch(`${RAFIKEY_CHATBOT_URL}/metrics/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({
          emoji: payload.emoji,
          option:payload.comment
        })
      })

      const res = await response.json()
      if(!response.ok){
        return {
          result: 'fail',
          message: 'An error occurred, please try again later'
        }
      } else {
        return{
          result: 'ok',
          message: 'Thank you for your feedback'
        }
      }
    } catch(e){
      console.error(e)
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

  const setIsChatArchive = (value: boolean) => {
    isChatArchive.value = value
  }

  const setQuiz = (data: Quiz[]) => {
    quizzes.value = data.sort((a: Quiz, b: Quiz) => a.order - b.order)
  }

  const setCorrectAnswer = (value: CorrectAnswer) => {
    correctAnswer.value = value
  }
  return {
    sendMessageToRafikeyChatbot,
    setCorrectAnswer,
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
    accessButtonRequest,
    setAccessButtonRequest,
    isAnonymous,
    otherSettings,
    setOtherSettings,
    getOtherSettings,
    deleteAllChats,
    RAFIKEY_CHATBOT_FRONTEND_URL,
    isMoveNext,
    getQuizCategory,
    getQuizzes,
    getQuestion,
    answerQuestion,
    setQuiz,
    quizzes,
    correctAnswer,
    isSelected,
    ratingFeedback,
    score,
    totalQuestions,
    isShowPlayButton,
    setIsChatArchive,
    isChatArchive

  }
})
