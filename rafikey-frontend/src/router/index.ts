import { createRouter, createWebHistory,type  NavigationGuardNext, type  RouteLocationNormalized } from 'vue-router'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { ref } from 'vue'


const routes = [
  {
    name: 'home',
    path: '/',
    redirect: '/auth'
  },
  {
    name: 'trying',
    path: '/trying',
    // component: () => import('@/views/auth/welcomepages/LoadingSpinner.vue')
    component: () => import('@/views/auth/welcomepages/LoadingPage_1.vue')
  },

  {
    name: 'auth',
    path: '/auth',
    component: () => import('@/views/auth/UserPage.vue'),
    meta: {
      requiresAuth: false
    },
    children: [
      {
        name: 'welcome-page',
        path: '',
        component: () => import('@/views/auth/welcomepages/WelcomePage.vue'),
        beforeEnter: (to:RouteLocationNormalized, _from:RouteLocationNormalized, next:NavigationGuardNext) => {
          const authStore = useAuthStore()
          // If user has ever logged in , redirect to chat page
          // if (authStore.isEverLoggedIn) {
          //   next({ name: 'login' })
          // } else {
          //   next()
          // }
          next()
        }
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('@/views/auth/signup/UserSignup.vue'),
        children: [
          {
            name: 'set-profile',
            path: '',
            component: () => import('@/views/auth/signup/SetProfile.vue')
          },
          {
            name: 'get-to-know-you',
            path: 'get-to-know-you',
            component: () => import('@/views/auth/signup/GetToKnowYou.vue')
          },
          {
            name: 'privacy-policy-1',
            path: 'privacy-policy-1',
            component: () => import('@/views/auth/terms&conditions/PrivacyPolicy_1.vue')
          },
          {
            name: 'privacy-policy-2',
            path: 'privacy-policy-2',
            component: () => import('@/views/auth/terms&conditions/PrivacyPolicy_2.vue')
          },
          {
            name: 'terms-of-service',
            path: 'terms-of-service',
            component: () => import('@/views/auth/terms&conditions/TermsCondition.vue')
          }

        ]
      },
      {
        name: 'login',
        path: 'login',
        component: () => import('@/views/auth/UserLogin.vue'),
        beforeEnter: (to:RouteLocationNormalized, _from:RouteLocationNormalized, next:NavigationGuardNext) => {
          const authStore = useAuthStore()

          // If user is already logged in, redirect to chat page
          // if (!authStore.isEverLoggedIn) {
          //   next({ name: 'welcome-page' })
          // }
          // else if(authStore.userIsLoggedIn){
          //   next({
          //     name: 'chat-page'
          //   })
          // }
          // else{
          //   next()
          // }
          next()
        }
      },
      {
        name: 'forgot-password',
        path: 'forgot-password',
        component: () => import('@/views/auth/UserForgotPassword.vue'),
      },
      {
        name: 'reset-password',
        path: 'reset-password/:token',
        component: () => import('@/views/auth/UserResetPassword.vue'),
        props: (route: RouteLocationNormalized) => {
          const { query } = route
          return {
            token: query.token
          }
        },

      }
    ]
  },
  {
    name: 'chat-page',
    path: '/user/chat',
    component: () => import('@/views/chatbot/ChatPage.vue'),
    children: [
      {
        name: 'newChat',
        path: '',
        component: () => import('@/views/chatbot/user/NewChat.vue'),
        meta: {
          requiresAuth: true,
          newChat: true
        },
        beforeEnter: (to:RouteLocationNormalized, _from:RouteLocationNormalized, next:NavigationGuardNext) => {
          const chatbotStore = useRafikeyChatbotStore()
          const authStore = useAuthStore()
          // Reset the chat history when entering a new chat
          chatbotStore.isNewChat = true
          chatbotStore.setStreamError({
            hasError: false,
            errorMessage: '',
            isLoggedIn: true
          })
          // If user is already logged in, redirect to chat page
          if (!authStore.isEverLoggedIn) {
            next({ name: 'welcome-page' })
          } else{
            next()
          }
        }
      },
      {
        name: 'chatWithId',
        path: ':sessionId',
        component: () => import('@/views/chatbot/user/HistoryPage.vue'),
        props: (route: RouteLocationNormalized) => {
          const { params } = route
          return {
            sessionId: params.sessionId,
          }
        },
        meta: {
          requiresAuth: true
        },
        beforeEnter: (to:RouteLocationNormalized, _from:RouteLocationNormalized, next:NavigationGuardNext) => {
          const chatbotStore = useRafikeyChatbotStore()
          const authStore = useAuthStore()
          // Reset the chat history when entering a new chat
          // chatbotStore.isNewChat = false

          // If user is already logged in, redirect to chat page
          if (!authStore.userIsLoggedIn) {
            next({ name: 'welcome-page' })
          } else{
            next()
          }

        }
      }
    ]
  },
  {
    name: 'guest-page',
    path: '/guest-user/:sessionId?',
    component: () => import('@/views/chatbot/guest/ChatPage.vue'),
      props: (route: RouteLocationNormalized)=>{
        const { params } = route
        return {
          sessionId: params.sessionId || '',
        }
      },
    meta: {
      requiresAuth: false
    },
  }

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, from, next) => {

  const authStore = useAuthStore()
  const chatbotStore = useRafikeyChatbotStore()
  const  isRequiresAuth =  to.meta.requiresAuth as boolean
  chatbotStore.previousRoute = from.fullPath
  //   check if  routes requires authentication
  // check if user has ever logged in if so direct them to login page no welcome pages
  // If user is not logged in redirect them to login page
  if(!isRequiresAuth){
    next()
  }
  else {
    if (!authStore.userIsLoggedIn && to.name != 'login') {
      console.log('Auth needed but no token')
      next({
        name: 'login'
      })
    } else {
      next()
    }
  }
  // next()
})


export default router
