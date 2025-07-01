import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { reactive } from 'vue'
import { useCreateAccountFormStore } from '@/stores'

export interface UserInfo {
  username: string
  email: string
}

export interface CreateAccountPayload {
  username: string
  email: string
  password: string
  age: string
  gender: string
  relationship_status: string
  terms_accepted: boolean
}

export interface LoginPayload {
  username: string
  password: string
}

export interface ResetPassword {
  token: string
  newPassword: string
}

export interface UserData {
  id: number,
  username: string
  email: string
  age: string
  gender: string
  relationship_status: string
  createAt: string
}

const BASE_URL = import.meta.env.VITE_APP_RAFIKEY_CHATBOT as string

export const useAuthStore = defineStore('authStore', () => {

  const user = useStorage('rafikey-user', '')
  const token = useStorage('rafikey-token', '')
  const isEverLoggedIn = useStorage('rafikey-ever-logged-in', false)
  const tokenExpiry = useStorage('rafikey-token-expiry', '')
  const isLoggedIn = useStorage('rafikey-is-logged-in', false)
  const userPayload = reactive({})

//   actions
//   account creation function
  async function createAccount() {
    const createAccountFormStore = useCreateAccountFormStore()
    const payload: CreateAccountPayload = createAccountFormStore.getProfile
    console.log('User payload', payload)
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload
        })
      })
      const data = await response.json()
      if (!response.ok) {
        console.log('An error has occurred please try again later')
        return {
          result: 'error',
          message: data.detail
          // message: data.message
        }
      } else {
        console.log('Account created successfully', data)
        return {
          result: 'ok',
          message: data.message
        }
      }
    } catch (error) {
      console.error('Error creating account:', error)
      return {
        result: 'error',
        message: 'An error occurred while creating account'
      }
    }
  }

  // login function
  async function login(payload: LoginPayload) {
    const formData = new FormData()
    formData.append('username', payload.username)
    formData.append('password', payload.password)

    try {
      const response = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        return {
          result: 'error',
          message: data.detail
          // message: data.message
        }
      } else {
        return {
          result: 'ok',
          message: data.access_token
        }
      }
    }
    catch(error){
      console.log('There is an error logging in')
      return {
        result: 'error',
        message: 'An error occurred while logging in, kindly try again'
      }
    }
  }

  // forgot password function
  async function forgotPassword(email: string) {
    try{
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      })
      const data = await response.json()
      if (!response.ok) {
        return {
          result: 'error',
          message: data.detail
        }
      } else {
        return {
          result: 'ok',
          message: data.message
        }
      }
    }
    catch (error) {
      console.error('Error sending forgot password request:', error)
      return
    }
  }

  // resetPassword function
  async function resetPassword(payload:  ResetPassword ) {
    console.log('Reset Password Payload:', payload)
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: payload.token,
          new_password: payload.newPassword
        })
      })

      const data = await  response.json()

      if( !response.ok ) {
        return {
          result: 'error',
          message: data.detail
        }
      } else{
        return {
          result: 'ok',
          message: data.message
        }
      }
    }
    catch(error){
      console.log('Error sending forgot password request:', error)
      return
    }
  }


  return {
    user,
    token,
    isEverLoggedIn,
    tokenExpiry,
    isLoggedIn,
    createAccount,
    login,
    forgotPassword,
    resetPassword,
  }
})
