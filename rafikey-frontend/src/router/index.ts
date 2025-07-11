import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useAuthStore } from '@/stores'



const routes = [
  {
    name: 'home',
    path: '/',
    redirect: '/auth'
  },
  {
    name: 'auth',
    path: '/auth',
    component: ()=> import('@/views/auth/UserPage.vue'),
    meta: {
      requiresAuth: false
    },
    children: [
      {
        name: 'welcome-page',
        path: '',
        component: ()=> import('@/views/auth/welcomepages/WelcomePage.vue'),
      },
      {
        name: 'register',
        path: 'register',
        component: ()=> import('@/views/auth/signup/UserSignup.vue'),
        children: [
          {
            name: 'set-profile',
            path: '',
            component:()=> import('@/views/auth/signup/SetProfile.vue')
          },
          {
            name: 'get-to-know-you',
            path: 'get-to-know-you',
            component: ()=> import('@/views/auth/signup/GetToKnowYou.vue')
          },
          {
            name: 'privacy-policy-1',
            path: 'privacy-policy-1',
            component: ()=> import('@/views/auth/terms&conditions/PrivacyPolicy_1.vue'),
          },
          {
            name: 'privacy-policy-2',
            path: 'privacy-policy-2',
            component: ()=> import('@/views/auth/terms&conditions/PrivacyPolicy_2.vue'),
          },
          {
            name:'terms-of-service',
            path: 'terms-of-service',
            component: ()=> import('@/views/auth/terms&conditions/TermsCondition.vue'),
          }

        ]
      },
      {
        name: 'login',
        path: 'login',
        component: ()=> import('@/views/auth/UserLogin.vue')
      },
      {
        name: 'forgot-password',
        path: 'forgot-password',
        component: ()=> import('@/views/auth/UserForgotPassword.vue')
      },
      {
        name: 'reset-password',
        path: 'reset-password/:token',
        component: ()=> import('@/views/auth/UserResetPassword.vue'),
        props:(route: RouteLocationNormalizedLoaded )=>{
          const { query} = route
          return {
            token: query.token
          }
        }
      }
    ]
  },
  {
    name: 'chat-page',
    path: '/chat-page',
    component: ()=> import('@/views/chatbot/ChatPage.vue'),
    children: [
      {
        name: 'user-chat-page',
        path: 'user/chat-page',
        component: () => import('@/views/chatbot/user/ChatPage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        name: 'guest-user-chat-page',
        path: 'guest-user/chat-page',
        component: ()=> import('@/views/chatbot/guest/ChatPage.vue'),
        meta: {
          requiresAuth: false
        }
      }



    ]

  }

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, from, next) => {
  // const authStore = useAuthStore()
  // const  isRequiresAuth =  to.meta.requiresAuth as boolean
  // //   check if  routes requires authentication
  // // check if user has ever logged in if so direct them to login page no welcome pages
  // // If user is not logged in redirect them to loggin page
  // if(!isRequiresAuth){
  //
  //   if(authStore.isEverLoggedIn && to.name != 'login'){
  //     next({
  //       name: 'login'
  //     })
  //   } else{
  //     next()
  //   }
  // } else{
  //   if(!authStore.userIsLoggedIn && to.name != 'login'){
  //     console.log('Auth needed but no token')
  //     next({
  //       name: 'login'
  //     })
  //   } else{
  //     next()
  //   }
  // }
  next()
})



export default router
