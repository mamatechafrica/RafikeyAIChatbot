<script setup lang="ts">
import { useField } from 'vee-validate'
import { reactive, watch, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/views/auth/welcomepages/LoadingSpinner.vue'
import { useCreateAccountFormStore } from '@/stores'
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-black.png'

const isDark = localStorage.getItem('darkMode')
console.log('we have mode', isDark)
const toggleImage = computed(() => {
  return isDark ? imageDark : imageLight
})

const router = useRouter()
const createAccountFormStore = useCreateAccountFormStore()
const isPasswordVisible = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const togglePasswordVisibility = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const toggleConfirmPasswordVisibility = computed(() =>
  isConfirmPasswordVisible.value ? 'text' : 'password',
)
const setProfileData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  remainAnonymous: false,
})

const isAnonymous = ref<boolean>(false)
const isLoading = ref(false)

watch(
  () => isAnonymous.value,
  (value) => {
    isLoading.value = true
    if (value) {
      setTimeout(() => {
        isLoading.value = false
        router.push({
          name: 'chat-page',
        })
      }, 3000)
    }
  },
)

onMounted(()=>{
  setProfileData.username = createAccountFormStore.getProfile.username
  setProfileData.email = createAccountFormStore.getProfile.email
  setProfileData.password = ''
  setProfileData.confirmPassword = ''
})



const usernameValidator = (value: string) =>{
  if(!value){
    return 'Username is required'
  }
  if(value.length > 10){
    return 'Username too long'
  }
  if(value.length < 3){
    return 'Username too short'
  }
  return true
}

const {
  value: username,
  errorMessage: usernameErrorMessage,
  meta: usernameMeta,
} = useField('username', usernameValidator)

watch(() => setProfileData.username, value => {
    if (value) {
      username.value = value
    }
  },
)

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

watch(()=> setProfileData.email, value => {
    if (value) {
      email.value = value
    }
  },
)

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

watch(()=> setProfileData.password, value => {
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

watch(()=> setProfileData.confirmPassword, value => {
    if (value) {
      confirmPassword.value = value
    }
})

// before going to know you page, check if all fields are valid
const everyThingOk = computed(()=>{
  return(
    usernameMeta.validated && usernameMeta.valid &&
    emailMeta.validated && emailMeta.valid &&
    passwordMeta.validated && passwordMeta.valid &&
    confirmPasswordMeta.validated && confirmPasswordMeta.valid
  )
})

// persist the profile data to the store if no errors on the form
const goToKnowYou = ()=>{
  if(everyThingOk.value){
    createAccountFormStore.setProfile({
      username: setProfileData.username,
      email: setProfileData.email,
      password: setProfileData.password,
    })
    console.log('Profile************', createAccountFormStore.getProfile)
    isAnonymous.value = false
    isLoading.value = true
    setTimeout(()=>{
      isLoading.value = false
      router.push({
        name: 'get-to-know-you'
      })
    }, 3000)
  }
}
</script>

<template>
  <div v-if="!isLoading">
    <div class="h-screen w-full hidden lg:flex items-center justify-center dark:bg-lightgray">

    <div class="bg-lightBackground dark:bg-darkgray flex flex-col w-10/12 mx-auto rounded-2xl pb-10">
        <div>
          <div>
            <img :src="toggleImage" alt="rafikey-logo" />
          </div>
          <div class="w-6/12 mx-auto space-y-12 rounded-2xl">
            <div class="flex flex-col items-center space-y-4">
              <h2 class="text-4xl font-semibold dark:text-white">Set up your profile</h2>
              <p class="text-xl text-gray-700 text-center dark:text-stone-300">
                Let's get you set up so you can access your personal account for a more personalized
                experience
              </p>
            </div>
            <div class="border-b border-gray-400 w-3/4 mx-auto dark:border-stone-400"></div>
            <div>
              <form>
                <div class="space-y-6">
                  <div class="grid grid-cols-2 gap-8">
                    <div class="col-span-1 flex-col space-y-1">
                      <label
                        class="form-control w-full text-gray-950 dark:text-white text-lg"
                        for="username"
                        >Username</label
                      >
                      <input
                        v-model="setProfileData.username"
                        id="username-lg"
                        type="text"
                        class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                        required
                        placeholder="Choose a username"
                      />
                      <span
                        v-if="usernameMeta.validated && !usernameMeta.valid"
                        class="text-rose-500"
                        >{{ usernameErrorMessage }}</span
                      >
                    </div>
                    <div class="col-span-1 space-y-1">
                      <label class="text-gray-950 text-lg dark:text-white" for="email">Email</label>
                      <input
                        v-model="setProfileData.email"
                        id="email-lg"
                        type="email"
                        class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                        required
                        placeholder="Enter your email"
                      />
                      <span v-if="emailMeta.validated && !emailMeta.valid" class="text-rose-500">{{
                        emailErrorMessage
                      }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2">
                    <div class="space-x-2">
                      <input
                        v-model="isAnonymous"
                        type="checkbox"
                        class="checkbox rounded-full peer-checked:bg-black border-slate-800 dark:border-white"
                      />
                      <span class="text-lg dark:text-white">Remain Anonymous</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-8">
                    <div class="relative space-y-1">
                      <label class="text-gray-950 text-lg dark:text-white" for="password">
                        Password
                      </label>
                      <input
                        v-model="setProfileData.password"
                        id="password-lg"
                        :type="togglePasswordVisibility"
                        class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                        required
                        placeholder="Enter password"
                      />
                      <span
                        v-if="isPasswordVisible"
                        @click="isPasswordVisible = false"
                        class="material-icons-outlined absolute cursor-pointer right-3 top-12 dark:text-white"
                        >visibility_off</span
                      >
                      <span
                        v-else
                        @click="isPasswordVisible = true"
                        class="material-icons-outlined absolute cursor-pointer right-3 top-12 dark:text-white"
                        >visibility</span
                      >
                      <span
                        v-if="passwordMeta.validated && !passwordMeta.valid"
                        class="text-rose-500"
                        >{{ passwordErrorMessage }}</span
                      >
                    </div>
                    <div class="relative space-y-1">
                      <label class="text-gray-950 text-lg dark:text-white" for="confirmPassword">
                        Confirm Password
                      </label>
                      <input
                        v-model="setProfileData.confirmPassword"
                        id="confirmPassword-lg"
                        :type="toggleConfirmPasswordVisibility"
                        class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
                        required
                        placeholder="Enter password"
                      />
                      <span
                        v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"
                        class="text-rose-500"
                        >{{ confirmPasswordErrorMessage }}</span
                      >

                  <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible=false" class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility_off</span>
                  <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="border-b  border-gray-400 w-3/4 mx-auto"></div>
        <div class="w-3/4 mx-auto flex justify-between items-center">
          <button
            @click="goToKnowYou"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full btn-sm text-lg rounded-2xl py-6 ">
            Next
          </button>
        </div>
      </div>
    </div>






    <!--    Small screens-->
    <div class="lg:hidden block h-screen w-full">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col px-20 space-y-10">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-2xl font-semibold">Set up your profile</h2>
          <p class="text-lg text-gray-700 text-center">Let's get you set up so you can access your
            personal account for a more personalized experience</p>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-4">
          <div>
            <label for="username" class="text-black  text-lg">Username</label>
            <input
              v-model="setProfileData.username"
              id="username"
                   type="text"
                   class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
                   required
                   placeholder="Choose a username"
            />
            <div v-if="usernameMeta.validated && !usernameMeta.valid">
              <span class="text-rose-500">{{usernameErrorMessage}}</span>
            </div>
          </div>
          <div class="space-x-2">
            <input
              id="checkbox" v-model="isAnonymous"

              type="checkbox" class="checkbox rounded-full  peer-checked:bg-black border-slate-800"/>
            <span class="text-lg">Remain Anonymous</span>


          </div>

          <div>
            <label for="email" class="text-black  text-lg">Email</label>
            <input
              v-model="setProfileData.email"
              id="email"
                   type="email"
                   class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
                   required
                   placeholder="Enter your email"
            />
              <span  v-if="emailMeta.validated && !emailMeta.valid" class="text-rose-500">{{emailErrorMessage}}</span>

          </div>

          <div class="relative">
            <label class="text-black  text-lg" for="password">
              Password
            </label>
            <input
              v-model="setProfileData.password"
              id="password"
              :type="togglePasswordVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="Enter password"
            />
            <span  v-if="passwordMeta.validated && !passwordMeta.valid"  class="text-rose-500">{{passwordErrorMessage}}</span>
            <span v-if="isPasswordVisible" @click= "isPasswordVisible = false" class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility_off</span>
            <span v-else  @click="isPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility</span>
          </div>

          <div class="relative">
            <label class="text-black  text-lg" for="password">
              Confirm Password
            </label>
            <input
              v-model="setProfileData.confirmPassword"
              id="ConfirmPassword"
              :type="toggleConfirmPasswordVisibility"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="Enter password"
            />
            <span  v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"  class="text-rose-500">{{confirmPasswordErrorMessage}}</span>
            <span v-if="isConfirmPasswordVisible" @click= "isConfirmPasswordVisible=false" class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility_off</span>
            <span v-else  @click="isConfirmPasswordVisible = true"  class="material-icons-outlined absolute cursor-pointer right-3 top-12">visibility</span>
          </div>
        </form>
        <div class="border-b border-gray-400 w-full"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            @click="goToKnowYou"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full btn-sm  text-lg rounded-2xl py-6 disabled:opacity-50">
            Next
          </button>
        </div>

      </div>
    </div>
  </div>
  <div v-else>
    <LoadingSpinner />
  </div>

</template>

<style scoped>

</style>
