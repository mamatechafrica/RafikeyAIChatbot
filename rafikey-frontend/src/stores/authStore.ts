import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'
import { useCreateAccountFormStore } from '@/stores'
import moment from 'moment'
import { jwtDecode } from 'jwt-decode'

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
  const tokenExpiry = useStorage('rafikey-token-expiry', 0)
  const isLoggedIn  = ref(false)
  const userIsLoggedIn =  computed(()=>{
    const expiry = moment.unix(Number(tokenExpiry.value)).utc()
    const now = moment().utc()
    const isValid = token.value && expiry.isAfter(now)
    if(!isValid){
      logout()
    }
    return  isValid

  })
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
      const {message, user, detail} = await response.json()
      if (!response.ok) {
        console.log('An error has occurred please try again later')
        return {
          result: 'error',
          message: detail
          // message: data.message
        }
      } else {
        await setUserData({
          id: user.id,
          username: user.username,
          email: user.email,
          age: user.age,
          gender: user.gender,
          relationship_status: user.relationship_status,
          createAt: user.created_at
        })

        return {
          result: 'ok',
          message: message
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
        setToken(data.access_token)
        return {
          result: 'ok',
          message: 'Logged in successfully'
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

  // set user data on local storage
  async function setUserData(userData: UserData){
    user.value = JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      age: userData.age,
      gender: userData.gender,
      relationship_status: userData.relationship_status,
      createAt: userData.createAt
    })
    return userData


  }

  function setToken(value: string){
    const {exp} = jwtDecode(value)
    try{
      token.value = value
      tokenExpiry.value = exp as number
      isLoggedIn.value = true
      setEverLoggedIn()
    }
    catch(error){
      console.log(error)
      return
    }
  }

  const logout = () =>{
    isLoggedIn.value = false
    token.value = null
  }

  const setEverLoggedIn = () =>{
    isEverLoggedIn.value = true
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
    userIsLoggedIn,
    logout
  }
})
