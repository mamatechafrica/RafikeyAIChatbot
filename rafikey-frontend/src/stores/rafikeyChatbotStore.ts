import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {useStorage} from "@vueuse/core";
import { get } from 'lodash';


interface ChatbotConversationPayload {
  message: string
  sessionId: string
}
const RAFIKEY_CHATBOT_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT as string
export const useRafikeyChatbotStore = defineStore('rafikeyChatbotStore', ()=>{
  const sessionId = useStorage("sessionId", '');

  const setSessionId = (value: string) => {
    sessionId.value = value
  }

  const getSessionId = computed(()=> sessionId.value)
const rafikeyResponse = ref<string>('')
//   send message to Rafikeychatbot
  async function sendMessageToRafikeyChatbot(payload: string) {
    try {
      const response = await fetch(`${RAFIKEY_CHATBOT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          mode: 'no-cors',
        },
        body: JSON.stringify({
          message: payload
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
    }
    // clear the variable
    finally {
      rafikeyResponse.value = ''
    }

  }


  return {
    sendMessageToRafikeyChatbot
  }
})
