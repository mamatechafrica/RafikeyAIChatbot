<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { useField } from 'vee-validate'
import { useAuthStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
import { useRouter } from 'vue-router'


const isPasswordVisible = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const togglePasswordVisibility = computed(() => isPasswordVisible.value? 'text': 'password')
const toggleConfirmPasswordVisibility = computed(() => isConfirmPasswordVisible.value ? 'text' : 'password')
const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()


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
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
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

const resetPasswordHandler = ()=>{
  console.log("Clicking the buttoon")
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


  }

}


</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block">
      <div class="grid grid-cols-2 w-10/12 mx-auto">
        <!--      left side-->
        <div class="col-span-1">
          <div>
            <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-4xl text-2xl font-semibold">Set a password</h2>
              <p class="lg:text-xl text-lg text-gray-700">Your previous password has been reset.
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
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="newPassword-1">
                    Create Password
                  </label>
                  <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 top-6">visibility_off</span>
                  <span v-else  @click="isPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-6">visibility</span>
                  <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
                </div>
                <div class="relative">
                  <input
                    v-model="resetPassword.confirmPassword"
                    id="confirmPassword-1"
                    :type="toggleConfirmPasswordVisibility"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="confirmPassword-1">
                    Re-enter Password
                  </label>
                  <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>
                  <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible=false" class="material-icons-outlined absolute cursor-pointer right-3 top-6">visibility_off</span>
                  <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-6">visibility</span>
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
        <div class="col-span-1 flex items-center justify-center h-screen">
          <img src="@/assets/images/reset-password.png" alt="reset-password-images" />

        </div>

      </div>

    </div>

    <!--    Small screens-->
    <div class="lg:hidden block h-screen w-full">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col px-20 space-y-8">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-3xl font-semibold">Rest your Password</h2>
          <div class="space-y-2">
            <p class="text-lg text-gray-700 text-center">Your previous password has been reset</p>
            <p class="text-lg text-gray-700 text-center">Please set a new password for your account.</p>
          </div>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-8">
          <div class="relative">
            <label class="text-gray-950 text-lg" for="newPassword-2">
              Create Password
            </label>
            <input
              v-model="resetPassword.newPassword"
              id="newPassword-2"
              :type="togglePasswordVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="1234567@Hello"
            />
            <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility_off</span>
            <span v-else  @click="isPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility</span>
            <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
          </div>

          <div class="relative">
            <label class="text-gray-950 text-lg" for="confirmPassword-2">
              Confirm Password
            </label>
            <input
              v-model="resetPassword.confirmPassword"
              :type="toggleConfirmPasswordVisibility"
              id="confirmPassword-2"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="1234567@Hello"
            />
            <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility_off</span>
            <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility</span>
            <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>

          </div>
        </form>
        <div class="border-b border-gray-400 w-full pt-6"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="resetPasswordHandler"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full btn-sm text-lg rounded-2xl py-6">
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
