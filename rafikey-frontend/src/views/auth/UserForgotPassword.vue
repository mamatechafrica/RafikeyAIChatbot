<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
// import imageLight from '@/assets/images/rafikey-icon-light.png'
// import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { toggleImage} from '@/modules/imageToggle.ts'


const router = useRouter()
const emailData = ref<string>('')
const authStore = useAuthStore()
const isLoading = ref(false)
const forgotPasswordError = reactive({
  isError: false,
  message: '',
})



// const toggleImage = computed(() => {
//   console.log('Toggle', chatbotStore.isDarkMode)
//   return chatbotStore.isDarkMode ? imageDark : imageLight
// })

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

watch(
  () => emailData.value,
  (value) => {
    if (value) {
      email.value = value
    }
  },
)

// before going to know you page, check if all fields are valid
const everyThingOk = computed(() => {
  return emailMeta.validated && emailMeta.valid
})

watch(everyThingOk, (value) => {
  if (value) {
    forgotPasswordError.isError = false
    forgotPasswordError.message = ''
  }
})

const forgotPasswordHandler = () => {
  if (everyThingOk.value) {
    isLoading.value = true
    authStore
      .forgotPassword(email.value)
      .then((response) => {
        if (response?.result === 'ok') {
          showSweetAlert({
            type: 'success',
            message: response.message,
          })
        } else {
          showSweetAlert({
            type: 'error',
            message: 'An error occurred please try again later',
          })
        }
      })
      .catch(() => {
        showSweetAlert({
          type: 'error',
          message: 'An error occurred please try again later',
        })
      })
      .finally(() => {
        isLoading.value = false
      })
  } else {
    forgotPasswordError.isError = true
    forgotPasswordError.message = 'Please fill in your email'
  }
}
</script>

<template>
  <div class="h-screen w-full py-8 overflow-hidden hidden lg:block dark:bg-lightgray">
    <div class="w-10/12 grid grid-cols-2 mx-auto gap-8">
      <!--      left-side-->
      <div class="col-span-1">
        <div>
          <img :src="toggleImage()" alt="rafikey-icon" class="w-60" />
        </div>
        <div class="flex flex-col space-y-12">
          <div
            @click="router.go(-1)"
            class="flex cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
          >
            <span class="material-icons-outlined dark:text-white ">chevron_left</span>
            <span class="text-extra-small font-light dark:text-white ">Back to login</span>
          </div>
          <div class="flex flex-col space-y-6">
            <h2 class="text-extra-extra-large font-semibold dark:text-white ">
              Forgot your password?
            </h2>
            <p class="text-large text-gray-700  dark:text-white  ">
              Don't worry, happens to all of us. Enter your email bellow to recover your password
            </p>
          </div>
          <!--          forgot password form-->
          <div>
            <form
              class="flex flex-col w-10/12"
              :class="forgotPasswordError.isError ? ' space-y-4 xl:space-y-12' : 'space-y-12 '"
            >
              <div class="relative">
                <input
                  v-model="emailData"
                  id="email"
                  type="email"
                  required
                  class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-2xl p-4 text-small "
                  placeholder="johndoe@gmail.com"
                />
                <label
                  class="absolute left-1 -top-3 dark:text-white dark:bg-darkgray text-slate-600 px-1 text-text-extra-small bg-white "
                  for="email"
                >
                  Email address
                </label>
                <span v-if="emailMeta.validated && !emailMeta.valid" class="text-rose-500">{{
                  emailErrorMessage
                }}</span>
              </div>
              <div v-if="forgotPasswordError.isError" class="flex gap-2">
                <span class="material-icons-outlined text-rose-500">error</span>
                <span class="text-rose-500">{{ forgotPasswordError.message }}</span>
              </div>
              <div
                @click="forgotPasswordHandler"
                class="btn btn-sm rounded-2xl py-6 bg-button-light border-none shadow-none"
              >
                <span v-if="!isLoading" class="text-extra-small">Submit</span>
                <span v-else class="loading loading-spinner loading-sm"></span>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!--      right--side-->
      <div class="col-span-1 flex items-center justify-center">
        <div class="bg-gray-100 dark:bg-lightgray rounded-2xl  h-5/6">
          <img src="@/assets/images/forgot-password.png" alt="forgot-password-image" />
        </div>
      </div>
    </div>
  </div>

  <!--    Small screens-->
  <div class="lg:hidden block overflow-hidden h-screen w-full dark:bg-lightgray">
    <div class="grid grid-cols-3 gap-4 items-center px-4 py-2">
      <div
        @click="router.go(-1)"
        class="col-span-1 flex cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
      >
        <span class="material-icons-outlined dark:text-white ">chevron_left</span>
        <span class="text-extra-small font-light dark:text-white  ">Back</span>
      </div>

      <div class="col-span-1 flex justify-center">
        <div class="w-54   flex justify-center ">
          <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo"  />
        </div>
      </div>
    </div>

    <div class="flex flex-col md:px-20 px-10 space-y-6">
      <div class="flex flex-col items-center space-y-4">
        <h2 class="text-extra-large font-semibold dark:text-white ">Forgot Password</h2>
        <div class="text-extra-small md:space-y-2 space-y-0.5">
          <p class=" text-gray-700 text-center dark:text-white ">
            Don't worry. Happens to all of us.
          </p>
          <p class="text-gray-700 text-center dark:text-white ">
            Enter your Email below to recover your password
          </p>
        </div>
      </div>
      <div class="border-b border-gray-400 w-full"></div>
      <form class="space-y-8">
        <div class="space-y-3">
          <label for="email" class="dark:text-white text-black text-extra-small ">Email</label>
          <input
            v-model="emailData"
            id="email"
            type="email"
            class="w-full dark:bg-darkgray dark:text-white   border-[1px] border-gray-300  rounded-2xl  md:p-4 p-3 text-extra-small "
            required
            placeholder="maryjane@gmail.com"
          />
          <span v-if="emailMeta.validated && !emailMeta.valid" class="text-rose-500">{{
            emailErrorMessage
          }}</span>
        </div>
      </form>
      <div v-if="forgotPasswordError.isError" class="flex gap-2">
        <span class="material-icons-outlined text-rose-500">error</span>
        <span class="text-rose-500">{{ forgotPasswordError.message }}</span>
      </div>
      <div class="border-b border-gray-400 w-full pt-6"></div>

      <div class="w-3/4 mx-auto flex-col space-y-2 justify-between items-center pt-6">
        <button
          @click="forgotPasswordHandler"
          class="btn w-full btn-sm md:text-lg text-sm rounded-2xl py-6 bg-button-light border-none shadow-none"
        >
          <span v-if="!isLoading" class="text-extra-small">Submit</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
<!--        <p class="text-center text-slate-800 dark:text-white text-extra-small">-->
<!--          Don't have an account?-->
<!--          <router-link to="/auth/register" class="text-rose-400 text-extra-small">-->
<!--            Sign Up-->
<!--          </router-link>-->
<!--        </p>-->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
