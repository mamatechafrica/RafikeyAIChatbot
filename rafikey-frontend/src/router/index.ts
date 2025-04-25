import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/views/chatbot/ChatPage.vue"


const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },

] as any[]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
}  as any)



export default router
