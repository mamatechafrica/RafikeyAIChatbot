import ImageDark from '@/assets/images/rafikey-icon-dark.png'
import ImageLight from '@/assets/images/rafikey-icon-light.png'
import { useRafikeyChatbotStore } from '@/stores'
const chatbotStore = useRafikeyChatbotStore()

export const toggleImage = ()=>{
  const isDark = chatbotStore.isDark
  return isDark? ImageDark: ImageLight
}

export  const imageToggleSmallDevice = () =>{
  const isDark = chatbotStore.isDark
  return isDark? ImageSmallLDark: ImageSmallLight
}
