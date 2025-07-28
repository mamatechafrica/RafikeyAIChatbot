<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
import imageLight from '@/assets/images/rafikey-icon.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'

const router = useRouter()
const emailData = ref<string>('')
const isLoading = ref(false)
const forgotPasswordError = reactive({
  isError: false,
  message: ''
})



const isDark = localStorage.getItem('isDarkMode')
const toggleImage = computed(()=>{
  return isDark? imageDark : imageLight
})

const emailValidator = (value: string) => {
  if (!value) {
    return 'Email is required'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return 'Email must be valid'
  }
  if (value.length > 30) {
    return 'Email too long'
  }
  return true
}

const {
  value: email,
  errorMessage: emailErrorMessage,
  meta: emailMeta,
} = useField('email', emailValidator)

watch(()=> emailData.value, value => {
    if (value) {
      email.value = value
    }
  },
)

// before going to know you page, check if all fields are valid
const everyThingOk = computed(()=>{
  return emailMeta.validated && emailMeta.valid
})

const forgotPasswordHandler = () =>{
  if(everyThingOk.value){
    isLoading.value = true
    authStore.forgotPassword(email.value)
      .then(response =>{
        if(response?.result === 'ok'){
          showSweetAlert({
           type: 'success',
            message: response.message
          })
        } else{
          showSweetAlert({
            type: 'error',
            message: 'An error occurred please try again later'
          })
        }
      })
      .catch(()=>{
        showSweetAlert({
          type: 'error',
          message: 'An error occurred please try again later'
        })
      })
      .finally(()=>{
        isLoading.value = false
      })


  }
}




</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block dark:bg-lightgray">
      <div class="w-10/12 grid grid-cols-2 mx-auto">
        <!--      left-side-->
        <div class="col-span-1">
          <div>
            <img :src="toggleImage " alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div
              @click="router.go(-1)"
              class="flex  cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
              <span class="material-icons-outlined dark:text-white">chevron_left</span>
              <span class="text-lg font-light dark:text-white">Back to login</span>
            </div>
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-3xl text-xl font-semibold dark:text-white">Forgot your password?</h2>
              <p class="lg:text-xl text-lg text-gray-700 dark:text-stone-300">Don't worry, happens to all of us. Enter
                your email bellow to recover your password</p>
            </div>
            <!--          forgot password form-->
            <div>
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    v-model="emailData"
                    id="email"
                    type="email"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                    placeholder="johndoe@gmail.com"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white dark:bg-lightgray dark:text-white"
                    for="email">
                    Email address
                  </label>
                  <span v-if="emailMeta.validated && !emailMeta.valid"  class="text-rose-500">{{emailErrorMessage}}</span>

                </div>
                <div
                  @click="forgotPasswordHandler"
                  :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
                  class="btn btn-sm  text-lg rounded-2xl py-6">
                  <span v-if="!isLoading">Submit</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!--      right--side-->
        <div class="col-span-1 flex items-center justify-center h-screen">
          <div class="bg-gray-100 rounded-2xl dark:bg-transparent">
            <img src="@/assets/images/forgot-password.png" alt="forgot-password-image" />
          </div>

        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block min-h-screen w-full dark:bg-lightgray">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" class="w-24"/>
      </div>
      <div class="flex flex-col md:px-20 px-10 space-y-6">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="md:text-2xl text-lg font-semibold dark:text-white">Forgot Password</h2>
          <div class="md:space-y-2 space-y-0.5">
            <p class="md:text-xl sm:text-lg text-gray-700 text-center dark:text-stone-300">Don't worry. Happens to all of us. </p>
            <p class="md:text-xl sm:text-lg text-gray-700 text-center dark:text-stone-300">Enter your Email below to recover your password</p>
          </div>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-8">

          <div class="space-y-3">
            <label for="email" class="text-black md:text-lg text-sm  dark:text-white">Email</label>
            <input
                  v-model="emailData"
                  id="email"
                   type="email"
                   class=" w-full border-2 border-gray-500 rounded-2xl md:p-4 p-3  md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                   required
                   placeholder="Enter your email"
            />
            <span v-if="emailMeta.validated && !emailMeta.valid"  class="text-rose-500">{{emailErrorMessage}}</span>
          </div>
        </form>
        <div class="border-b border-gray-400 w-full pt-6"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="forgotPasswordHandler"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full btn-sm  md:text-lg text-sm rounded-2xl py-5">
            <span v-if="!isLoading">Submit</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>


      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
