import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'



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
        path: 'reset-password',
        component: ()=> import('@/views/auth/UserResetPassword.vue')
      }
    ]
  },
  {
    name: 'chat-page',
    path: '/chat-page',
    component: ()=> import('@/views/chatbot/ChatPage.vue'),

  }

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})



export default router
