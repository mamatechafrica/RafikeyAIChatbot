<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore } from '@/stores'
import { showSweetAlert } from '@/composables/alert.ts'
import { useRouter } from 'vue-router'
import { toggleImage, imageToggleSmallDevice} from '@/composables/imageToggle.ts'



const isPasswordVisible = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const togglePasswordVisibility = computed(() => isPasswordVisible.value? 'text': 'password')
const toggleConfirmPasswordVisibility = computed(() => isConfirmPasswordVisible.value ? 'text' : 'password')
const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()


const resetPasswordError = reactive({
  isError: false,
  message: ''
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
        console.log("Reset password response", response)
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
            message: 'Something went wrong, please try again',
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
    <div class="h-screen overflow-hidden w-full hidden lg:block dark:bg-lightgray ">
      <div class="grid grid-cols-2 w-10/12 mx-auto gap-8">
        <!--      left side-->
        <div class="col-span-1">
          <div>
            <img :src="toggleImage()" alt="rafikey-icon" class="w-60"/>
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="text-extra-extra-large font-semibold dark:text-white">Set a password</h2>
              <p class="text-large text-gray-700 dark:text-white ">Your previous password has been reset.
                Please set a new password for your account</p>
            </div>

            <div class="space-y-8 ">
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    v-model="resetPassword.newPassword"
                    id="newPassword-1"
                    :type="togglePasswordVisibility"
                    required
                    placeholder="******"
                    class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300  rounded-2xl p-4 lg:text-lg text-sm "
                  />
                  <label
                    class="absolute dark:text-white dark:bg-darkgray left-1 -top-3 text-slate-600 px-1 text-text-extra-extra-small bg-white  "
                    for="newPassword-1">
                    Create Password
                  </label>
                  <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 top-6 ">visibility_off</span>
                  <span v-else  @click="isPasswordVisible = true"  class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 top-6 ">visibility</span>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
                </div>
                <div class="relative">
                  <input
                    v-model="resetPassword.confirmPassword"
                    id="confirmPassword-1"
                    :type="toggleConfirmPasswordVisibility"
                    required
                    placeholder="******"
                    class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300  rounded-2xl p-4 lg:text-lg text-sm  "
                  />
                  <label
                    class="absolute dark:text-white dark:bg-darkgray left-1 -top-3 text-slate-600 px-1 text-text-extra-extra-small bg-white "
                    for="confirmPassword-1">
                    Re-enter Password
                  </label>
                  <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>
                  <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible=false" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 top-6 ">visibility_off</span>
                  <span v-else  @click="isConfirmPasswordVisible = true"  class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 top-6 ">visibility</span>
                </div>
              </form>
              <div v-if="resetPasswordError.isError" class="flex gap-2">
                <span class="material-icons-outlined text-rose-500">error</span>
                <span class="text-rose-500">{{resetPasswordError.message}}</span>
              </div>
              <div class=" w-10/12 flex justify-between items-center">
                <button
                  @click="resetPasswordHandler"
                  class="btn w-full  rounded-2xl py-6 bg-button-light border-none shadow-none">
                  <span v-if="!isLoading" class="text-extra-small">Set Password</span>
                  <span v-else class="loading loading-spinner loading-sm"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!--      right side-->
        <div class="col-span-1 flex justify-center items-center  ">
          <div class="bg-gray-100 dark:bg-lightgray rounded-2xl h-5/6">
            <img src="@/assets/images/forgot-password.png" alt="reset-password-images"  />
          </div>
        </div>

      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block min-h-screen overflow-hidden w-full dark:bg-lightgray">
      <div class=" w-44 h-24 mx-auto flex justify-center items-center">
        <img :src="imageToggleSmallDevice()" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col md:px-20 px-10 space-y-6">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-extra-large font-semibold dark:text-white  ">Reset your Password</h2>
          <div class="text-extra-small md:space-y-2 space-y-0.5">
            <p class=" text-gray-700 text-center dark:text-white ">Your previous password has been reset</p>
            <p class="  text-gray-700 text-center dark:text-white ">Please set a new password for your account.</p>
          </div>
        </div>
        <div class="border-b-[1px] border-stone-500 w-full pt-8"></div>
        <form class="space-y-8">
          <div class="relative space-y-2">
            <label class="text-gray-950 dark:text-white text-extra-small " for="newPassword-2">
              Create Password
            </label>
            <input
              v-model="resetPassword.newPassword"
              id="newPassword-2"
              :type="togglePasswordVisibility"
              class=" w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300  rounded-2xl  p-4 md:text-lg text-sm  "
              required
              placeholder="******"
            />
            <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-10 ">visibility_off</span>
            <span v-else  @click="isPasswordVisible = true"  class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-10 ">visibility</span>
            <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
          </div>

          <div class="relative space-y-2">
            <label class="text-gray-950  dark:text-white  text-extra-small  " for="confirmPassword-2">
              Confirm Password
            </label>
            <input
              v-model="resetPassword.confirmPassword"
              :type="toggleConfirmPasswordVisibility"
              id="confirmPassword-2"
              class=" w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300  rounded-2xl  p-4 md:text-lg text-sm  "
              required
              placeholder="******"
            />
            <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible = false" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-10 ">visibility_off</span>
            <span v-else  @click="isConfirmPasswordVisible = true"  class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white material-icons-outlined absolute cursor-pointer right-3 md:top-12 top-10 ">visibility</span>
            <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>

          </div>
        </form>
        <div v-if="resetPasswordError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500">{{resetPasswordError.message}}</span>
        </div>
        <div class="border-b-[1px] border-stone-500 w-full pt-10"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="resetPasswordHandler"
            class="btn w-full md:text-lg text-sm rounded-2xl py-6 bg-button-light border-none shadow-none">
            <span v-if="!isLoading" class="text-extra-small">Set Password</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
