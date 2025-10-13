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
        isEverLoggedIn.value = true

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
        await setUserData(data.access_token)
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

  // logout from all devices
  async function  logOutAllDevices (){
    try{
      const response = await fetch(`${BASE_URL}/auth/logout_all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      })

      const res = await response.json()
      if(!response.ok) {
        return{
          result: 'fail',
          message: res.message
        }
      } else{
        return {
          result: 'ok',
          message: res.message
        }
      }
    } catch(e) {
      console.error('Error logging out from all devices')
      return {
        result: 'fail',
        message: 'An error occurred, please try again later'
      }
    }

  }

  async function getUserProfile(){
    try {
      const response = await fetch(`${BASE_URL}/auth/users/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        }
      })

      const data = await response.json()
      if(!response.ok){
        return {
          result: 'fail',
          message: data.detail
        }
      } else {
        return {
          result: 'ok',
          data: data
        }
      }
    } catch(e){
      console.error('Error fetching user data:', e)
      return {
        result: 'fail',
        message: 'An error occurred while fetching user data'
      }
    }
  }

  // set user data on local storage
  async function setUserData(token: string){
    const {sub} = jwtDecode(token)


    user.value = JSON.stringify({
      username: sub,
    })
    return user



  }

  const getUserInfo = () =>{
    try {
      if (user.value) {
        return JSON.parse(user.value) as UserData
      } else {
        return null
      }
    } catch (error) {
      console.error('Error parsing user info:', error)
      return null
    }
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
    getUserInfo,
    token,
    isEverLoggedIn,
    tokenExpiry,
    isLoggedIn,
    createAccount,
    login,
    forgotPassword,
    resetPassword,
    userIsLoggedIn,
    logout,
    logOutAllDevices,
    getUserProfile
  }
})
