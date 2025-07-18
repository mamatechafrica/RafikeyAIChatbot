<script setup lang="ts">

import { reactive, ref, computed, watch, onMounted} from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { useRouter } from 'vue-router'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import LoadingPage_1 from '@/views/auth/welcomepages/LoadingPage_1.vue'
import DialogModal from '@/components/DialogModal.vue'


const chatbotStore = useRafikeyChatbotStore()
const isAnonymous = ref<boolean>(false)
const isUserGuest = ref<boolean>(false)
const isUserGuestLoading = ref<boolean>(false)

const toggleImage = computed(()=>{
  return chatbotStore.isDarkMode? imageDark : imageLight
})


const authStore = useAuthStore()
const loginData = reactive({
  username: '',
  password: '',
})

const router = useRouter()
const isLoading = ref(false)
const appLoading = ref(true)
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
            name:'newChat'
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


watch(
  () => isAnonymous.value,
  () => {
    chatbotStore.setDialogModal(true)
  },
)


watch(()=>isUserGuest.value, (value)=>{
  if(value){
    isUserGuestLoading.value = true
    setTimeout(()=>{
            router.push({
              name: 'guest-page'
            })
    }, 3000)
    chatbotStore.setDialogModal(false)
    // isAnonymous.value = false

  }
  // else{
  //   chatbotStore.setDialogModal(false)
  // }
})
onMounted(()=>{

  setTimeout(()=>{
    appLoading.value = false
    console.log("App loading finished")
  }, 3000)

})


</script>

<template>
  <div v-if="!appLoading">
    <div class="min-h-screen w-full hidden lg:block dark:bg-lightgray">
      <div class="grid grid-cols-2 w-10/12 mx-auto ">
        <!--    left side-->
        <div class="col-span-1">
          <div class="">
            <img :src="toggleImage" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="text-4xl dark:text-white font-semibold">Login</h2>
              <p class="lg:text-xl text-lg text-gray-700 dark:text-stone-300">Login to access your Rafikey</p>
            </div>

            <!--          login form-->
            <div class="">
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    v-model="loginData.username"
                    id="usernameLarge"
                    type="text"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                    placeholder="johndoe"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 dark:text-white px-1 lg:text-lg text-sm bg-white dark:bg-lightgray"
                    for="usernameLarge">
                    Username
                  </label>
                  <span  v-if="usernameMeta.validated && !usernameMeta.valid" class="text-rose-500">{{usernameErrorMessage}}</span>
                </div>
                <div class="relative">
                  <input
                    v-model="loginData.password"
                    id="passwordLarge"
                    :type="toggleVisibility"
                    class=" w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                    required
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 dark:text-white px-1 lg:text-lg text-sm bg-white dark:bg-lightgray"
                    for="passwordLarge">
                    Password
                  </label>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>


                  <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-6 dark:text-white">visibility_off</span>
                  <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-6 cursor-pointer dark:text-white">visibility</span>
                </div>
                <div v-if="loginError.isError" class="flex gap-2">
                  <span class="material-icons-outlined text-rose-500">error</span>
                  <span class="text-rose-500">{{loginError.message}}</span>
                </div>
                <div class="flex justify-between">
                  <div class="flex gap-2">
                    <input v-model="isAnonymous" type="checkbox" class="checkbox rounded-full border-slate-800 dark:border-white bg-darkgray text-casablanca-300" />
                    <span class="dark:text-white">Remain Anonymous</span>
                  </div>
                  <div>
                    <router-link to="/auth/forgot-password" class="text-casablanca-300">Forgot Password
                    </router-link>
                  </div>
                </div>

                <div
                  @click="loginHandler"
                  :class="[
                  !everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400',
                ]"

                  class="btn btn-sm text-lg rounded-2xl py-6">
                  <span  v-if="!isLoading">Login</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </div>
              </form>
              <div class=" w-10/12">
                <p class="text-center text-slate-800 dark:text-white text-lg  mt-4">
                  Don't have an account?
                  <router-link to="/auth/register" class="text-rose-400 hover:text-rose-300">
                    Sign up
                  </router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <!--    right side-->
        <div class="col-span-1 relative flex items-center  justify-center h-screen w-full">
          <img src="@/assets/images/login.png" alt="rafikey-login-image" />
<!--          <img src="../../assets/images/rafikey-bot.png" alt="bot-image"-->
<!--               class="absolute bottom-16 left-1/4" />-->
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block min-h-screen w-full dark:bg-lightgray">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" class="w-24" />
      </div>
      <div class="flex flex-col md:px-20 px-10 space-y-6">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="md:text-2xl text-lg  font-semibold dark:text-white">Login</h2>
          <p class="md:text-xl sm:text-lg text-gray-700 text-center dark:text-stone-300">Login to access your Rafikey Account</p>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-4">
          <div class="space-y-3">
            <label for="username" class="text-black dark:text-white   md:text-lg text-sm">Username</label>
            <input id="username"
                   v-model="loginData.username"
                   type="text"
                   class=" w-full border-2 md:p-4 p-2  md:text-lg text-sm border-gray-500 rounded-2xl dark:bg-lightgray dark:text-stone-400"
                   required
                   placeholder="Choose a username"
            />
          </div>
          <div class="space-x-2">
            <input v-model="isAnonymous" type="checkbox" class="checkbox w-3 h-3 rounded-full  peer-checked:bg-black dark:border-white border-slate-800"/>
            <span class="md:text-lg text-sm dark:text-white">Remain Anonymous</span>
          </div>

          <div class="relative space-y-3">
            <label class="text-black dark:text-white  md:text-lg text-sm" for="password">
              Password
            </label>
            <input
              v-model="loginData.password"
              id="password"
              :type="toggleVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl md:p-4 p-2  md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="Enter password"
            />
            <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-8 dark:text-white">visibility_off</span>
            <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-8 cursor-pointer dark:text-white">visibility</span>
          </div>
        </form>
        <div v-if="loginError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500">{{loginError.message}}</span>
        </div>
        <div class="border-b border-gray-400 w-full pt-6"></div>
        <div class="flex  justify-between">
          <div class="space-x-2">
            <input type="checkbox" class="checkbox w-4 h-4 rounded-full dark:border-white border-slate-800  text-casablanca-300"/>
            <span class="dark:text-white md:text-lg text-sm ">Remember me</span>
          </div>
          <div>
            <router-link to="/auth/forgot-password" class="text-casablanca-300 md:text-lg text-sm ">Forgot Password</router-link>
          </div>

        </div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            :class="[
                  !everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400',
                ]"
            @click="loginHandler"
            class="btn w-full btn-sm  md:text-lg text-sm rounded-2xl py-5">
            <span v-if="!isLoading">Login</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
        <div>
          <p class="text-center text-slate-800 dark:text-white md:text-lg text-sm  mt-4">
            Don't have an account?
            <router-link to="/auth/register" class="text-rose-400 md:text-lg text-sm  hover:text-sky-300">
              Sign Up
            </router-link>
          </p>
        </div>

      </div>
    </div>
    <Teleport to="body">
      <DialogModal :is-open="chatbotStore.dialogModal.isOpen" @close-modal="chatbotStore.setDialogModal(false)" >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-outlined text-casablanca-300 !text-3xl lg:!text-4xl" >info</span>
          </div>
        </template>
        <template #body>
          <div class="flex flex-col items-center py-2">
            <p class="dark:text-white text-lg lg:text-xl">Are you Sure?</p>
            <span class="dark:text-white text-sm lg:text-lg">Your chat's won't be saved, if you login anonymously</span>
          </div>

        </template>
        <template #footer>
          <div class="flex justify-center gap-4">
            <button @click.stop="isUserGuest=true" class="btn btn-sm border-none bg-casablanca-300 shadow-none px-4 rounded-lg ">
              <span v-if="!isUserGuestLoading" class="">Ok</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
            <button @click.stop="chatbotStore.setDialogModal(false)" class="btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg dark:text-white" ><span>Cancel</span></button>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>
  <div v-else>
    <LoadingPage_1 />
  </div>
</template>

<style scoped>

</style>
