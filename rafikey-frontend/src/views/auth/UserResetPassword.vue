<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
import { useRouter } from 'vue-router'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import imageLight from '@/assets/images/rafikey-icon.png'


const isPasswordVisible = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const togglePasswordVisibility = computed(() => isPasswordVisible.value? 'text': 'password')
const toggleConfirmPasswordVisibility = computed(() => isConfirmPasswordVisible.value ? 'text' : 'password')
const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()


const resetPasswordError = reactive({
  isError: false,
  message: ''
})
const toggleImage = computed(()=>{
  return chatbotStore.isDarkMode? imageDark : imageLight
})

const props = defineProps<{
  token: string
}>()


const resetPassword = reactive({
  newPassword: '',
  confirmPassword: ''
})

const passwordValidator = (value: string) => {
  if (!value) {
    return 'Password is required'
  }
  // const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{6,}$/
  if( !passwordRegExp.test(value)) {
    return 'Password must contain at least 6 characters, one uppercase letter, one lowercase letter and one number'
  }
  return true
}

const {
  value: password,
  errorMessage: passwordErrorMessage,
  meta: passwordMeta,
} = useField('password', passwordValidator)

watch(()=> resetPassword.newPassword, value => {
    if (value) {
      password.value = value
    }
  },
)

const confirmPasswordValidator = (value: string) => {
  if (!value) {
    return 'Confirm Password is required'
  }
  if (value !== password.value) {
    return 'Passwords do not match'
  }
  return true
}

const {
  value: confirmPassword,
  errorMessage: confirmPasswordErrorMessage,
  meta: confirmPasswordMeta,
} = useField('confirmPassword', confirmPasswordValidator)

watch(()=> resetPassword.confirmPassword, value => {
  if (value) {
    confirmPassword.value = value
  }
})

const everyThingOk = computed(() => {
  return passwordMeta.validated && passwordMeta.valid && confirmPasswordMeta.validated && confirmPasswordMeta.valid
})

watch(everyThingOk, (value) =>{
  if(value){
    resetPasswordError.isError = false
    resetPasswordError.message = ''
  }
})

const resetPasswordHandler = ()=>{
  if(everyThingOk.value){
    isLoading.value = true
    authStore.resetPassword({
      token: props.token,
      newPassword: resetPassword.newPassword,
    })
      .then(response =>{
        if(response?.result === 'ok'){
          showSweetAlert({
            type: 'success',
            message: response.message
          })
          setTimeout(()=>{
            router.push({
              name: 'login'
            })
          }, 3000)
        }
        else{
          showSweetAlert({
            type: 'error',
            message: response?.message
          })
        }
      })
      .catch(() =>{
        showSweetAlert({
          type: 'error',
          message: 'Something went wrong, please try again',
        })
      })
      .finally(()=>{
        isLoading.value = false
      })
  } else {
    resetPasswordError.isError = true
    resetPasswordError.message = 'Please fill in all the fields correctly'
  }
}


</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block dark:bg-lightgray">
      <div class="grid grid-cols-2 w-10/12 mx-auto">
        <!--      left side-->
        <div class="col-span-1">
          <div>
            <img :src="toggleImage" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-4xl text-2xl font-semibold dark:text-white">Set a password</h2>
              <p class="lg:text-xl text-lg text-gray-700 dark:text-stone-300">Your previous password has been reset.
                Please set a new password for your account</p>
            </div>

            <div>
              <form class="flex flex-col space-y-12 w-10/12" @submit.prevent="resetPasswordHandler">
                <div class="relative">
                  <input
                    v-model="resetPassword.newPassword"
                    id="newPassword-1"
                    :type="togglePasswordVisibility"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white  dark:bg-lightgray dark:text-white"
                    for="newPassword-1">
                    Create Password
                  </label>
                  <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 top-6 dark:text-white">visibility_off</span>
                  <span v-else  @click="isPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-6 dark:text-white">visibility</span>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
                </div>
                <div class="relative">
                  <input
                    v-model="resetPassword.confirmPassword"
                    id="confirmPassword-1"
                    :type="toggleConfirmPasswordVisibility"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white  dark:bg-lightgray dark:text-white"
                    for="confirmPassword-1">
                    Re-enter Password
                  </label>
                  <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>
                  <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible=false" class="material-icons-outlined absolute cursor-pointer right-3 top-6 dark:text-white">visibility_off</span>
                  <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-6 dark:text-white">visibility</span>
                </div>
                <button
                  type="submit"
                  :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
                  class="btn btn-sm text-lg rounded-2xl py-6">
                  <span v-if="!isLoading">Set Password</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </button>
              </form>
            </div>

          </div>


        </div>
        <!--      right side-->
        <div class="col-span-1 flex items-center justify-center h-screen ">
          <img src="@/assets/images/forgot-password.png" alt="reset-password-images" />

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
          <h2 class="md:text-2xl text-lg  font-semibold dark:text-white">Reset your Password</h2>
          <div class="md:space-y-2 space-y-0.5">
            <p class="md:text-xl sm:text-lg  text-gray-700 text-center dark:text-stone-300">Your previous password has been reset</p>
            <p class="md:text-xl sm:text-lg  text-gray-700 text-center dark:text-stone-300">Please set a new password for your account.</p>
          </div>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-8">
          <div class="relative space-y-2">
            <label class="text-gray-950  md:text-lg text-sm dark:text-white" for="newPassword-2">
              Create Password
            </label>
            <input
              v-model="resetPassword.newPassword"
              id="newPassword-2"
              :type="togglePasswordVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl md:p-4 p-3 md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="1234567@Hello"
            />
            <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-8 dark:text-white">visibility_off</span>
            <span v-else  @click="isPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-8 dark:text-white">visibility</span>
            <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
          </div>

          <div class="relative space-y-2">
            <label class="text-gray-950  md:text-lg text-sm  dark:text-white" for="confirmPassword-2">
              Confirm Password
            </label>
            <input
              v-model="resetPassword.confirmPassword"
              :type="toggleConfirmPasswordVisibility"
              id="confirmPassword-2"
              class=" w-full border-2 border-gray-500 rounded-2xl md:p-4 p-3 md:text-lg text-sm  dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="1234567@Hello"
            />
            <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-8 dark:text-white">visibility_off</span>
            <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-8 dark:text-white">visibility</span>
            <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>

          </div>
        </form>
        <div class="border-b border-gray-400 w-full pt-6"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="resetPasswordHandler"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full md:text-lg text-sm rounded-2xl py-5">
            <span v-if="!isLoading">Set Password</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
