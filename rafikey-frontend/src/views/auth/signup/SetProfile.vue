<script setup lang="ts">
import { useField } from 'vee-validate'
import { reactive, watch, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/views/auth/welcomepages/LoadingSpinner.vue'
import { useCreateAccountFormStore, useRafikeyChatbotStore } from '@/stores'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import DialogModal from '@/components/DialogModal.vue'



const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()
const createAccountFormStore = useCreateAccountFormStore()

const isPasswordVisible = ref<boolean>(false)
const isUserGuest = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const isUserGuestLoading = ref<boolean>(false)
const SetProfileError = reactive({
  isError: false,
  message: ''
})
const togglePasswordVisibility = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const toggleConfirmPasswordVisibility = computed(() =>
  isConfirmPasswordVisible.value ? 'text' : 'password',
)


const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ? imageDark : imageLight
})
const setProfileData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  remainAnonymous: false,
})

const isAnonymous = ref<boolean>(false)
const isLoading = ref(false)

// watch(
//   () => isAnonymous.value,
//   (value) => {
//     isLoading.value = true
//     if (value) {
//       setTimeout(() => {
//         isLoading.value = false
//         router.push({
//           name: 'guest-page',
//         })
//       }, 3000)
//     }
//   },
// )

watch(
  () => isAnonymous.value,
  () => {
    chatbotStore.setDialogModal(true)
  },
)

// watch for isUserGuest and redirect to guest page after 3 seconds
watch(
  () => isUserGuest.value, (value) => {
    if (value) {
      isUserGuestLoading.value = true
      setTimeout(() => {
        router.push({
          name: 'guest-page',
        })
      }, 3000)
    }
  },
)

onMounted(() => {
  setProfileData.username = createAccountFormStore.getProfile.username
  setProfileData.email = createAccountFormStore.getProfile.email
  setProfileData.password = ''
  setProfileData.confirmPassword = ''
})

const usernameValidator = (value: string) => {
  if (!value) {
    return 'Username is required'
  }
  if (value.length > 20) {
    return 'Username too long'
  }
  if (value.length < 3) {
    return 'Username too short'
  }
  return true
}

const {
  value: username,
  errorMessage: usernameErrorMessage,
  meta: usernameMeta,
} = useField('username', usernameValidator)

watch(
  () => setProfileData.username,
  (value) => {
    if (value) {
      username.value = value
    }
  },
)

const emailValidator = (value: string) => {
  if (!value) {
    return 'Email is required'
  }
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //
  // if (!emailRegex.test(value)) {
  //   return 'Email must be valid'
  // }
  return true
}

const {
  value: email,
  errorMessage: emailErrorMessage,
  meta: emailMeta,
} = useField('email', emailValidator)

watch(
  () => setProfileData.email,
  (value) => {
    if (value) {
      email.value = value
    }
  },
)

const passwordValidator = (value: string) => {
  if (!value) {
    return 'Password is required'
  }
  // const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{6,}$/
  if (!passwordRegExp.test(value)) {
    return 'Password must contain at least 6 characters, one uppercase letter, one lowercase letter and one number and optional special characters'
  }
  return true
}

const {
  value: password,
  errorMessage: passwordErrorMessage,
  meta: passwordMeta,
} = useField('password', passwordValidator)

watch(
  () => setProfileData.password,
  (value) => {
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

watch(
  () => setProfileData.confirmPassword,
  (value) => {
    if (value) {
      confirmPassword.value = value
    }
  },
)

// before going to know you page, check if all fields are valid
const everyThingOk = computed(() => {
  return (
    usernameMeta.validated &&
    usernameMeta.valid &&
    emailMeta.validated &&
    emailMeta.valid &&
    passwordMeta.validated &&
    passwordMeta.valid &&
    confirmPasswordMeta.validated &&
    confirmPasswordMeta.valid
  )
})

// persist the profile data to the createAccountFormStore if no errors on the form
const goToKnowYou = () => {
  if (everyThingOk.value) {
    createAccountFormStore.setProfile({
      username: setProfileData.username,
      email: setProfileData.email,
      password: setProfileData.password,
    })
    isAnonymous.value = false
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      router.push({
        name: 'get-to-know-you',
      })
    }, 3000)
  } else{
    SetProfileError.isError = true
    SetProfileError.message = 'Please fill all fields correctly before proceeding'
  }
}

// before unmounting if the user is a guest, close the dialog modal
onBeforeUnmount(()=>{
  if(isUserGuest.value){
    chatbotStore.setDialogModal(false)
  }
})
</script>

<template>
  <div v-if="!isLoading">
    <div class="h-screen w-full hidden md:flex items-center justify-center dark:bg-lightgray">
      <div
        class="bg-lightBackground dark:bg-darkgray flex flex-col w-10/12 mx-auto rounded-2xl pb-10"
      >
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

                      <span
                        v-if="isConfirmPasswordVisible"
                        @click="isConfirmPasswordVisible = false"
                        class="material-icons-outlined absolute cursor-pointer right-3 top-12 dark:text-white"
                        >visibility_off</span
                      >
                      <span
                        v-else
                        @click="isConfirmPasswordVisible = true"
                        class="material-icons-outlined absolute cursor-pointer right-3 top-12 dark:text-white"
                        >visibility</span
                      >
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="border-b border-gray-400 w-3/4 mx-auto dark:border-stone-400"></div>
            <div class="w-3/4 mx-auto flex justify-between items-center">
              <button
                @click="goToKnowYou"
                class="btn w-full btn-sm text-lg rounded-2xl py-6 bg-button-dark border-none shadow-none"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="md:hidden block min-h-screen w-full dark:bg-lightgray">
      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" class="w-24" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col md:px-20 px-10 md:space-y-5  space-y-4">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="md:text-2xl text-lg font-semibold dark:text-white">Set up your profile</h2>
          <p class="md:text-xl sm:text-lg text-sm text-gray-700 text-center dark:text-stone-300">
            Let's get you set up so you can access your personal account for a more personalized
            experience
          </p>
        </div>
        <div class="border-b border-gray-400 dark:border-stone-400 w-full"></div>
        <form class="space-y-2">
          <div class="md:space-y-1 space-y-0.5">
            <label for="username" class="text-black dark:text-white md:text-lg text-sm"
              >Username</label
            >
            <input
              v-model="setProfileData.username"
              id="username"
              type="text"
              class="w-full border-2 border-gray-500 rounded-2xl  p-3 md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="Choose a username"
            />
            <div v-if="usernameMeta.validated && !usernameMeta.valid">
              <span class="md:text-lg text-sm text-rose-500">{{ usernameErrorMessage }}</span>
            </div>
          </div>
          <div class="space-x-2">
            <input
              id="checkbox"
              v-model="isAnonymous"
              type="checkbox"
              class="checkbox rounded-full w-3 h-3 peer-checked:bg-black border-slate-800 dark:border-white"
            />
            <span class="md:text-lg text-sm text-black dark:text-white">Remain Anonymous</span>
          </div>

          <div class="md:space-y-1 space-y-0.5">
            <label for="email" class="text-black dark:text-white md:text-lg text-sm">Email</label>
            <input
              v-model="setProfileData.email"
              id="email"
              type="email"
              class="w-full border-2 border-gray-500 rounded-2xl p-3 md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="Enter your email"
            />
            <span
              v-if="emailMeta.validated && !emailMeta.valid"
              class="md:text-lg text-sm text-rose-500"
              >{{ emailErrorMessage }}</span
            >
          </div>

          <div class="relative md:space-y-1 space-y-0.5">
            <label class="text-black md:text-lg text-sm dark:text-white" for="password">
              Password
            </label>
            <input
              v-model="setProfileData.password"
              id="password"
              :type="togglePasswordVisibility"
              class="w-full border-2 border-gray-500 rounded-2xl p-3  md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="Enter password"
            />
            <span
              v-if="passwordMeta.validated && !passwordMeta.valid"
              class="md:text-lg text-sm text-rose-500"
              >{{ passwordErrorMessage }}</span
            >
            <span
              v-if="isPasswordVisible"
              @click="isPasswordVisible = false"
              class="material-icons-outlined absolute cursor-pointer right-3 top-9 dark:text-white"
              >visibility_off</span
            >
            <span
              v-else
              @click="isPasswordVisible = true"
              class="material-icons-outlined absolute cursor-pointer right-3 top-9 dark:text-white"
              >visibility</span
            >
          </div>

          <div class="relative md:space-y-1 space-y-0.5">
            <label class="text-black dark:text-white md:text-lg text-sm" for="password">
              Confirm Password
            </label>
            <input
              v-model="setProfileData.confirmPassword"
              id="ConfirmPassword"
              :type="toggleConfirmPasswordVisibility"
              class="w-full border-2 border-gray-500 rounded-2xl p-3 md:text-lg text-sm dark:bg-lightgray dark:text-stone-400"
              required
              placeholder="Enter password"
            />
            <span
              v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"
              class="text-rose-500 md:text-lg text-sm"
              >{{ confirmPasswordErrorMessage }}</span
            >
            <span
              v-if="isConfirmPasswordVisible"
              @click="isConfirmPasswordVisible = false"
              class="material-icons-outlined absolute cursor-pointer right-3 top-9 dark:text-white"
              >visibility_off</span
            >
            <span
              v-else
              @click="isConfirmPasswordVisible = true"
              class="material-icons-outlined absolute cursor-pointer right-3 top-9 dark:text-white"
              >visibility</span
            >
          </div>
        </form>
        <div class="border-b border-gray-400 dark:border-stone-400 w-full"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-3">
          <button
            @click="goToKnowYou"
            class="btn w-full btn-sm md:text-lg text-sm rounded-2xl py-5 bg-button-dark border-none shadow-none "
          >
            <span v-if="!isLoading">Next</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <DialogModal
        :is-open="chatbotStore.dialogModal.isOpen"
        @close-modal="chatbotStore.setDialogModal(false)"
      >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-outlined text-casablanca-300 !text-3xl lg:!text-4xl"
              >info</span
            >
          </div>
        </template>
        <template #body>
          <div class="flex flex-col items-center py-2">
            <p class="dark:text-white text-lg lg:text-xl">Are you Sure?</p>
            <span class="dark:text-white text-sm lg:text-lg"
              >Your chat's won't be saved, if you login anonymously</span
            >
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center gap-4">
            <button
              @click.stop="isUserGuest = true"
              class="btn btn-sm border-none bg-casablanca-300 shadow-none px-4 rounded-lg"
            >
              <span v-if="!isUserGuestLoading" class="">Ok</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
            <button
              @click.stop="chatbotStore.setDialogModal(false)"
              class="btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg dark:text-white"
            >
              <span>Cancel</span>
            </button>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>

  <div v-else>
    <LoadingSpinner />
  </div>
</template>

<style scoped></style>
