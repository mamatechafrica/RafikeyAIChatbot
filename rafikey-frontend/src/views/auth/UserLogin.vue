<script setup lang="ts">

import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { useRouter } from 'vue-router'
import LoadingPage_1 from '@/views/auth/welcomepages/LoadingPage_1.vue'
import DialogModal from '@/components/DialogModal.vue'


const chatbotStore = useRafikeyChatbotStore()
// const isAnonymous = ref<boolean>(false)
const isUserGuest = ref<boolean>(false)
const isUserGuestLoading = ref<boolean>(false)



const authStore = useAuthStore()
const loginData = reactive({
  username: '',
  password: '',
})

watch(
  () => chatbotStore.dialogModal.isOpen,
  (value) => {
    if (!value) {
      chatbotStore.isAnonymous = false
    }
  },
)

// before unmounting if the user is a guest, close the dialog modal
onBeforeUnmount(() => {
  if (isUserGuest.value) {
    chatbotStore.setDialogModal(false)
  }
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

watch(everyThingOk, (value) =>{
  if(value){
    loginError.isError = false
    loginError.message = ''
  }
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
  () => chatbotStore.isAnonymous,
  (value) => {
    if(value){
      chatbotStore.setDialogModal(true)
    }
    else{
      chatbotStore.setDialogModal(false)
    }

  },
)

// watch for isUserGuest and redirect to guest page after 3 seconds
watch(()=>isUserGuest.value, (value)=>{
  if(value){
    isUserGuestLoading.value = true
    setTimeout(()=>{
            router.push({
              name: 'guest-page'
            })
    }, 3000)
  }
  // chatbotStore.isAnonymous = false
})

// Load the welcome page 3 seconds before loading the login page
onMounted(()=>{
  setTimeout(()=>{
    appLoading.value = false
  }, 3000)
  chatbotStore.isAnonymous = false
})

//before unmounting if the user is a guest, close the dialog modal
onBeforeUnmount(()=>{
  if(isUserGuest.value){
    chatbotStore.setDialogModal(false)
  }
})


</script>

<template>
  <div v-if="!appLoading">
    <div class="min-h-screen overflow-hidden w-full hidden lg:block ">
      <div class="grid grid-cols-2 w-10/12 mx-auto ">
        <!--    left side-->
        <div class="col-span-1">
          <div class="">
            <img src='@/assets/images/rafikey-icon-light.png' alt="rafikey-icon" class=" w-60" />
          </div>
          <div class="flex flex-col space-y-10">
            <div class="flex flex-col space-y-6">
              <h2 class="text-extra-extra-large  font-semibold">Login</h2>
              <p class="text-large text-gray-700 ">Login to access your Rafikey account.</p>
            </div>

            <!--          login form-->
            <div class="">
              <form class="flex flex-col  w-10/12" :class="[loginError.isError?'space-y-4 xl:space-y-12': 'space-y-6 xl:space-y-12']">
                <div class="relative">
                  <input
                    v-model="loginData.username"
                    id="usernameLarge"
                    type="text"
                    required
                    class="w-full border-[1px] border-gray-300  rounded-2xl p-4 text-small d"
                    placeholder="johndoe"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 text-extra-extra-small bg-white "
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
                    class=" w-full border-[1px] border-gray-300 rounded-2xl p-4  text-small "
                    required
                    placeholder="********"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600  px-1 text-extra-extra-small bg-white "
                    for="passwordLarge">
                    Password
                  </label>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>


                  <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-4 ">visibility_off</span>
                  <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-4 cursor-pointer d">visibility</span>
                </div>
                <div v-if="loginError.isError" class="flex gap-2">
                  <span class="material-icons-outlined text-rose-500">error</span>
                  <span class="text-rose-500">{{loginError.message}}</span>
                </div>
                <div class="flex justify-between">
                  <div class="flex gap-2">
                    <input
                      v-model="chatbotStore.isAnonymous"
                      type="checkbox"
                      class="checked:bg-button-light mt-1 checked:border-none checkbox h-4 w-4 text-button-light border-slate-800 "
                    />
                    <span class=" text-extra-small">Remain Anonymous</span>
                  </div>
                  <div>
                    <router-link to="/auth/forgot-password" class="text-rose-600 text-extra-small">Forgot Password
                    </router-link>
                  </div>
                </div>

                <div
                  @click="loginHandler"
                  class="btn btn-sm text-lg rounded-2xl py-6 bg-button-light border-none shadow-none">
                  <span  v-if="!isLoading" class="text-small">Login</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </div>
              </form>
              <div class=" w-10/12">
                <p class="text-center text-slate-800  extra-small mt-4">
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
        <div class="col-span-1 relative flex  justify-center  w-full">
          <img src="@/assets/images/login.png" alt="rafikey-login-image" />
<!--          <img src="../../assets/images/rafikey-bot.png" alt="bot-image"-->
<!--               class="absolute bottom-16 left-1/4" />-->
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block min-h-screen overflow-hidden w-full ">
      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" class="w-24" />
      </div>
      <div class="flex flex-col md:px-20 px-10 md:space-y-10 space-y-2">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-extra-large font-semibold ">Login</h2>
          <p class="text-extra-small text-gray-700 text-center ">Welcome back to Rafikey</p>
        </div>
        <div class="border-b-[1px] border-stone-500 w-full pt-10"></div>
        <form class="space-y-4">
          <div class="space-y-3">
            <label for="username" class="text-black  text-extra-small">Username</label>
            <input id="username"
                   v-model="loginData.username"
                   type="text"
                   class=" w-full p-4 text-extra-small border-[1px] border-gray-300  rounded-2xl "
                   required
                   placeholder="Choose a username"
            />
          </div>
          <div class="flex gap-2">
            <input
              v-model="chatbotStore.isAnonymous"
              type="checkbox"
              class="checked:bg-button-light mt-1 checked:border-none checkbox h-4 w-4 text-button-light border-slate-800 "
            />
            <span class=" text-extra-small">Remain Anonymous</span>
          </div>
          <div class="relative space-y-3">
            <label class="text-black   text-extra-small" for="password">
              Password
            </label>
            <input
              v-model="loginData.password"
              id="password"
              :type="toggleVisibility"
              class=" w-full border-[1px] border-gray-300  rounded-2xl md:p-4 p-4  text-extra-small "
              required
              placeholder="********"
            />
            <span v-if="isPasswordVisible" @click="isPasswordVisible=false" class="material-icons-outlined absolute right-3 cursor-pointer top-10 md:top-10 ">visibility_off</span>
            <span v-else @click="isPasswordVisible= true" class="material-icons-outlined absolute right-3 top-10 md:top-10 cursor-pointer ">visibility</span>
          </div>
        </form>
        <div v-if="loginError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500">{{loginError.message}}</span>
        </div>
        <div class="border-b-[1px] border-stone-500 w-full pt-10"></div>
        <div class="flex  justify-between">
          <div class="space-x-2">
            <input type="checkbox" class="checkbox w-4 h-4 rounded-full border-slate-800  text-casablanca-300"/>
            <span class=" text-extra-small">Remember me</span>
          </div>
          <div>
            <router-link to="/auth/forgot-password" class="text-rose-600 md:text-lg text-sm ">Forgot Password</router-link>
          </div>

        </div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="loginHandler"
            class="btn w-full btn-sm  md:text-lg text-sm rounded-2xl py-6 px-4 bg-button-light border-none shadow-none">
            <span v-if="!isLoading" class="text-extra-small">Login</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
        <div>
          <p class="text-center text-slate-800  text-extra-small  mt-4">
            Don't have an account?
            <router-link to="/auth/register" class="text-rose-400 text-extra-small">
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
            <p class=" text-lg lg:text-xl">Are you Sure?</p>
            <span class=" text-sm lg:text-lg">Your chats won't be saved, if you login anonymously</span>
          </div>

        </template>
        <template #footer>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-1 w-full ">
              <button
                @click.stop="isUserGuest = true"
                class="w-full btn btn-sm border-none bg-casablanca-300 shadow-none px-4 rounded-lg"
              >
                <span v-if="!isUserGuestLoading" class="text-extra-small md:text-small">Ok</span>
                <span v-else class="loading loading-spinner loading-sm"></span>
              </button>
            </div>

            <div class="col-span-1">
              <button
                @click.stop="chatbotStore.setDialogModal(false)"
                class="w-full btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg "
              >
                <span class="text-extra-small md:text-small">Cancel</span>
              </button>
            </div>
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
