import ImageDark from '@/assets/images/Rafikey_D-mode_Image.png'
import ImageLight from '@/assets/images/Rafikey_L-mode_Image.png'
import ImageSmallLight from '@/assets/images/Rafikey L-mode-small_Image.png'
import ImageSmallLDark from '@/assets/images/Rafikey D-mode-small_Image.png'
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
