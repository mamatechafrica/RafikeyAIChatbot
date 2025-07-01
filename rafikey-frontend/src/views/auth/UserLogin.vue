<script setup lang="ts">

import { reactive, ref, computed, watch} from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const loginData = reactive({
  username: '',
  password: '',
})

const router = useRouter()
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const loginError = reactive({
  isError: false,
  message: ''
})


const toggleVisibility = computed(()=>{
  return isPasswordVisible.value ? 'text' : 'password'
})
const usernameValidator = (value: string) =>{
  if(!value){
    return 'Username is required'
  }
  return true
}

const {
  value: username,
  errorMessage: usernameErrorMessage,
  meta: usernameMeta
} = useField('username', usernameValidator)

watch(()=> loginData.username, (value)=>{
  username.value = value
})

const passwordValidator = (value: string) =>{
  if(!value){
    return 'Password is required'
  }
  return true
}


const {
  value: password,
  errorMessage: passwordErrorMessage,
  meta: passwordMeta
} = useField('password', passwordValidator)

watch(()=> loginData.password, (value)=>{
  password.value = value
})

// before going to know you page, check if all fields are valid
const everyThingOk = computed(()=>{
  return(
    usernameMeta.validated && usernameMeta.valid &&
    passwordMeta.validated && passwordMeta.valid
  )
})

const loginHandler = ()=>{
  if(everyThingOk.value){
    isLoading.value = true
      authStore.login(loginData)
      .then(response =>{
        if(response.result === 'ok'){
          router.push({
            name:'chat-page'
          })
        } else{
          loginError.message = response.message
          loginError.isError = true
        }
      })
      .catch(()=>{
        loginError.isError = true
        loginError.message =  'An error occurred while logging in, please try again later'
      })
        .finally(()=>{
          isLoading.value = false

        })

    } else {
    loginError.isError= true
    loginError.message =  'Please fill in all fields correctly'

  }
}


onMounted(()=>{

  setTimeout(()=>{
    appLoading.value = false
    console.log("App loading finished")
  }, 3000)

})

</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block">
      <div class="grid grid-cols-2 w-10/12 mx-auto ">
        <!--    left side-->
        <div class="col-span-1">
          <div class="">
            <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-4xl text-2xl font-semibold">Login</h2>
              <p class="lg:text-xl text-lg text-gray-700">Login to access your Rafikey</p>
            </div>

            <!--          login form-->
            <div class="">
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    v-model="loginData.username"
                    id="username"
                    type="text"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                    placeholder="johndoe"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="email">
                    Username
                  </label>
                  <span  v-if="usernameMeta.validated && !usernameMeta.valid" class="text-rose-500">{{usernameErrorMessage}}</span>
                </div>
                <div class="relative">
                  <input
                    v-model="loginData.password"
                    id="password"
                    :type="toggleVisibility"
                    class=" w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                    required
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="password">
                    Password
                  </label>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>


                  <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-6">visibility_off</span>
                  <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-6 cursor-pointer">visibility</span>
                </div>
                <div v-if="loginError.isError" class="flex gap-2">
                  <span class="material-icons-outlined text-rose-500">error</span>
                  <span class="text-rose-500">{{loginError.message}}</span>
                </div>
                <div class="flex justify-between">
                  <div class="flex gap-2">
                    <input type="checkbox" class="checkbox border-slate-800" />
                    <span>Remember me</span>
                  </div>
                  <div>
                    <router-link to="/auth/forgot-password" class="text-rose-500">Forgot Password
                    </router-link>
                  </div>
                </div>

                <div
                  @click="loginHandler"

                  class="btn btn-sm bg-casablanca-400 hover:bg-casablanca-300 text-lg rounded-2xl py-6">
                  <span  v-if="!isLoading">Login</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </div>
              </form>
              <div class=" w-10/12">
                <p class="text-center text-slate-800 lg:text-lg text-sm mt-4">
                  Don't have an account?
                  <router-link to="/auth/register" class="text-sky-400 hover:text-sky-300">
                    Register
                  </router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <!--    right side-->
        <div class="col-span-1 relative flex items-center  justify-center h-screen w-full">
          <img src="@/assets/images/login.png" alt="rafikey-login-image" />
          <img src="../../assets/images/rafikey-bot.png" alt="bot-image"
               class="absolute bottom-16 left-1/4" />
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block h-screen w-full">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col px-20 space-y-6">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-2xl font-semibold">Login</h2>
          <p class="text-lg text-gray-700 text-center">Login to access your Rafikey Account</p>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-4">
          <div class="space-y-3">
            <label for="username" class="text-black  text-lg">Username</label>
            <input id="username"
                   v-model="loginData.username"
                   type="text"
                   class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
                   required
                   placeholder="Choose a username"
            />
          </div>
          <div class="space-x-2">
            <input type="checkbox" class="checkbox rounded-full  peer-checked:bg-black border-slate-800"/>
            <span class="text-lg">Remain Anonymous</span>
          </div>

          <div class="relative space-y-3">
            <label class="text-black  text-lg" for="password">
              Password
            </label>
            <input
              v-model="loginData.password"
              id="password"
              :type="toggleVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="Enter password"
            />
            <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-12">visibility_off</span>
            <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-12 cursor-pointer">visibility</span>
          </div>
        </form>
        <div v-if="loginError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500">{{loginError.message}}</span>
        </div>
        <div class="border-b border-gray-400 w-full pt-6"></div>
        <div class="flex  justify-between">
          <div class="space-x-2">
            <input type="checkbox" class="checkbox border-slate-800"/>
            <span>Remember me</span>
          </div>
          <div>
            <router-link to="/auth/forgot-password" class="text-rose-500">Forgot Password</router-link>
          </div>

        </div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="loginHandler"
            :disabled="!everyThingOk"
            class="btn w-full btn-sm bg-casablanca-300 hover:bg-casablanca-400 text-lg rounded-2xl py-6">
            <span v-if="!isLoading">Login</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
        <div>
          <p class="text-center text-slate-800 text-lg mt-4">
            Don't have an account?
            <router-link to="/auth/register" class="text-rose-500 hover:text-sky-300">
              Sign Up
            </router-link>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
