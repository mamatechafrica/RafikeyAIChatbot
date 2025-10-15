<script setup lang="ts">
import { useField } from 'vee-validate'
import { reactive, watch, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useCreateAccountFormStore, useRafikeyChatbotStore } from '@/stores'
import DialogModal from '@/components/DialogModal.vue'
import { toggleImage, imageToggleSmallDevice } from '@/composables/imageToggle.ts'

const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()
const createAccountFormStore = useCreateAccountFormStore()
const authStore = useAuthStore()

const isPasswordVisible = ref<boolean>(false)
const isUserGuest = ref<boolean>(false)
const isConfirmPasswordVisible = ref<boolean>(false)
const isUserGuestLoading = ref<boolean>(false)
const SetProfileError = reactive({
  isError: false,
  message: '',
})
const togglePasswordVisibility = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const toggleConfirmPasswordVisibility = computed(() =>
  isConfirmPasswordVisible.value ? 'text' : 'password',
)

// const toggleImage = computed(() => {
//   return chatbotStore.isDarkMode ? imageDark : imageLight
// })
const setProfileData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  remainAnonymous: false,
  isTermsCondition: false,
})

// const isAnonymous = ref<boolean>(false)
const isLoading = ref(false)
watch(
  () => chatbotStore.isAnonymous,
  (value) => {
    if (value) {
      chatbotStore.setDialogModal(true)
    }
  },
)

watch(
  () => chatbotStore.dialogModal.isOpen,
  (value) => {
    if (!value) {
      chatbotStore.isAnonymous = false
    }
  },
)

// watch for isUserGuest and redirect to guest page after 3 seconds
watch(
  () => isUserGuest.value,
  (value) => {
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
  setProfileData.isTermsCondition = createAccountFormStore.getProfile.terms_accepted
  chatbotStore.isAnonymous = false
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return 'Email must be valid'
  }
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
    confirmPasswordMeta.valid &&
    setProfileData.isTermsCondition
  )
})

watch(everyThingOk, (value) => {
  if (value) {
    SetProfileError.isError = false
    SetProfileError.message = ''
  }
})
const accountExistText = ref('')
// persist the profile data to the createAccountFormStore if no errors on the form
const goToKnowYou = () => {
  if (everyThingOk.value) {
    createAccountFormStore.setProfile({
      username: setProfileData.username,
      email: setProfileData.email,
      password: setProfileData.password,
      terms_accepted: setProfileData.isTermsCondition,
    })
    chatbotStore.isAnonymous = false
    isLoading.value = true
    authStore
      .checkAccountExist({
        username: setProfileData.username,
        email: setProfileData.email,
      })
      .then((response) => {
        if (response.result === 'ok') {
          if (response.data) {
            if (response.data.username_taken) {
              accountExistText.value = 'Username already taken'
            }
            if (response.data.email_taken) {
              accountExistText.value = 'Email already taken'
            }
            if (response.data.username_taken && response.data.email_taken) {
              accountExistText.value = 'Username and Email already taken'
            }
            if (!response.data.username_taken && !response.data.email_taken) {
              router.push({
                name: 'get-to-know-you',
              })
            }
          }
          isLoading.value = false
        } else {
          isLoading.value = false
          SetProfileError.isError = true
          SetProfileError.message = 'Something went wrong, please try again later'
        }
      })
      .catch((er) => {
        console.error('Error checking account existence: ', er)
        isLoading.value = false
        SetProfileError.isError = true
        SetProfileError.message = 'Something went wrong, please try again later'
      })
  } else {
    SetProfileError.isError = true
    SetProfileError.message = 'Please fill all fields correctly before proceeding'
  }
}

// before unmounting if the user is a guest, close the dialog modal
onBeforeUnmount(() => {
  if (isUserGuest.value) {
    chatbotStore.setDialogModal(false)
  }
})
</script>

<template>
  <div>
    <div class="min-h-screen w-full dark:bg-lightgray hidden md:flex py-8">
      <div class="dark:bg-darkgray bg-lightBackground flex flex-col w-11/12 mx-auto rounded-[34px]">
        <div class="h-20 flex justify-start items-center">
          <img :src="toggleImage()" alt="rafikey-logo" class="w-40 pt-6 ps-4" />
        </div>
        <div class="w-3/4 xl:space-y-5 space-y-4 mx-auto">
          <div class="flex flex-col pt-8 items-center space-y-1">
            <h2 class="text-4xl font-semibold dark:text-white">Set up your profile</h2>
            <p class="text-lg text-stone-700 text-center dark:text-stone-300">
              Let's get you set up so you can access your personal account for a more personalized
              experience
            </p>
          </div>
          <div class="lg:w-3/4 w-full mx-auto flex items-center gap-2 cursor-pointer">
            <div
              class="tooltip tooltip-bottom flex items-center gap-2 cursor-pointer"
              data-tip="Use Rafikey without an account"
            >
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="chatbotStore.isAnonymous"
                  type="checkbox"
                  class="checkbox h-5 w-5 mt-1 border-2 border-gray-400 dark:border-gray-500 checked:bg-button-light checked:border-button-light focus:ring-2 focus:ring-button-light/50 transition-all duration-150"
                />
                <span class="text-sm text-gray-900 dark:text-gray-100 pt-1">Remain Anonymous</span>
              </label>
            </div>
          </div>

          <div class="border-b pt-8 border-gray-400 w-1/2 mx-auto"></div>
          <div class="space-y-10">
            <form>
              <div class="space-y-2 lg:w-3/4 w-full mx-auto">
                <div class="grid grid-cols-2 gap-8">
                  <div class="col-span-1 flex-col space-y-1">
                    <label
                      class="form-control w-full dark:text-white text-gray-950 text-sm"
                      for="username"
                      >Username (Required)</label
                    >
                    <input
                      v-model="setProfileData.username"
                      id="username-lg"
                      type="text"
                      class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-lg p-2 lg:text-lg text-sm"
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
                    <label class="text-gray-950 dark:text-white text-sm" for="email"
                      >Email (Required)</label
                    >
                    <input
                      v-model="setProfileData.email"
                      id="email-lg"
                      type="email"
                      class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-lg p-2 lg:text-lg text-sm"
                      required
                      placeholder="Enter your email"
                    />
                    <span v-if="emailMeta.validated && !emailMeta.valid" class="text-rose-500">{{
                      emailErrorMessage
                    }}</span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-8">
                  <div class="relative space-y-1">
                    <label class="text-gray-950 dark:text-white text-sm d" for="password">
                      Password (Required)
                    </label>
                    <input
                      v-model="setProfileData.password"
                      id="password-lg"
                      :type="togglePasswordVisibility"
                      class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-lg p-2 lg:text-lg text-sm"
                      required
                      placeholder="Enter password"
                    />
                    <span
                      @click="isPasswordVisible = !isPasswordVisible"
                      class="dark:text-white material-icons-outlined absolute cursor-pointer right-3 top-9"
                      >{{ isPasswordVisible?  'visibility_off' : 'visibility'}}</span
                    >
                    <span
                      v-if="passwordMeta.validated && !passwordMeta.valid"
                      class="text-rose-500"
                      >{{ passwordErrorMessage }}</span
                    >
                  </div>
                  <div class="relative space-y-1">
                    <label class="text-gray-950 dark:text-white text-sm" for="confirmPassword">
                      Confirm Password (Required)
                    </label>
                    <input
                      v-model="setProfileData.confirmPassword"
                      id="confirmPassword-lg"
                      :type="toggleConfirmPasswordVisibility"
                      class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-lg p-2 lg:text-lg text-sm"
                      required
                      placeholder="Confirm password"
                    />
                    <span
                      v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"
                      class="text-rose-500"
                      >{{ confirmPasswordErrorMessage }}</span
                    >

                    <span
                      @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                      class="dark:text-white material-icons-outlined absolute cursor-pointer right-3 top-9"
                      >{{ isConfirmPasswordVisible ?  'visibility_off' : 'visibility'}}</span
                    >
                  </div>
                </div>
              </div>
            </form>
            <div class="flex flex-col gap-2 items-center">
              <div>
                <span class="pe-1 text-sm dark:text-white">Read our full</span>
                <router-link
                  to="/auth/register/terms-condition-1"
                  class="text-sm cursor-pointer text-button-light"
                  >Terms of Use
                </router-link>
                <span class="text-sm dark:text-white px-1">and</span>
                <router-link
                  to="/auth/register/privacy-policy-1"
                  class="text-sm cursor-pointer text-button-light"
                >
                  Privacy Policy
                </router-link>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="setProfileData.isTermsCondition"
                  class="checkbox h-5 w-5 mt-1
                        border-2 border-gray-400 dark:border-gray-500
                        checked:bg-button-light checked:border-button-light
                        focus:ring-2 focus:ring-button-light/50
                        transition-all duration-150"
                />
                <p class="text-gray-800 dark:text-gray-100 text-sm font-semibold">
                  Please accept before proceeding
                </p>
              </div>
            </div>
          </div>
          <div v-if="SetProfileError.isError" class="w-3/4 mx-auto flex gap-2">
            <span class="material-icons-outlined text-rose-500">error</span>
            <span class="text-rose-500">{{ SetProfileError.message }}</span>
          </div>
          <div v-if="accountExistText" class="w-3/4 mx-auto flex gap-2">
            <span class="material-icons-outlined text-rose-500">error</span>
            <span class="text-rose-500">{{ accountExistText }}</span>
          </div>

          <div class="border-b pt-4 border-gray-400 w-1/2 mx-auto"></div>
          <div class="w-4/6 mx-auto flex pt-12 justify-between items-center">
            <button
              @click="goToKnowYou"
              :class="[!everyThingOk ? 'bg-button-inactive' : 'bg-button-light  ']"
              class="btn w-full btn-sm text-lg rounded-2xl py-6 border-none shadow-none"
            >
              <span v-if="!isLoading" class="text-sm">Next</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
          <div class="flex justify-center pb-2">
            <p class="text-sm dark:text-white">
              Already have an account?
              <RouterLink to="/auth/login" class="text-sm text-rose-400">Log in</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="md:hidden block dark:bg-darkgray min-h-screen w-full">
      <div class="w-44 h-24 mx-auto flex justify-center items-center">
        <img :src="imageToggleSmallDevice()" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col md:px-20 px-10 space-y-3">
        <div class="flex flex-col items-center space-y-2">
          <h2 class="text-2xl font-semibold dark:text-white">Set up your profile</h2>
          <p class="text-sm text-gray-700 dark:text-stone-300 text-center">
            Let's get you set up so you can access your personal account for a more personalized
            experience
          </p>
        </div>
        <!--        <div class="" >-->
        <!--          <div class=" flex gap-2 tooltip  tooltip-bottom" data-tip="Remain anonymous and use the Rafikey without creating an account">-->
        <!--            <input-->
        <!--              id="checkbox"-->
        <!--              v-model="chatbotStore.isAnonymous"-->
        <!--              type="checkbox"-->
        <!--              class="checked:bg-button-light mt-1 checked:border-none checkbox h-4 w-4 text-button-light dark:border-slate-300 border-slate-800"-->
        <!--            />-->
        <!--            <p class="md:text-lg text-sm dark:text-white text-black pt-1">Remain Anonymous</p>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="w-full mx-auto flex items-center gap-2 cursor-pointer">
          <div
            class="tooltip tooltip-bottom flex items-center gap-2 cursor-pointer"
            data-tip="Use Rafikey without an account"
          >
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="chatbotStore.isAnonymous"
                type="checkbox"
                class="checkbox h-5 w-5 mt-1
                      border-2 border-gray-400 dark:border-gray-500
                      checked:bg-button-light checked:border-button-light
                      focus:ring-2 focus:ring-button-light/50
                      transition-all duration-150"
              />
              <span class="text-sm text-gray-900 dark:text-gray-100 pt-1">Remain Anonymous</span>
            </label>
          </div>
        </div>


        <div class="border-b border-stone-400 w-full"></div>
        <div class="space-y-2">
          <form class="space-y-2">
            <div class="space-y-0.5">
              <label for="username" class="dark:text-white text-black md:text-lg text-sm"
                >Username (Required)</label
              >
              <input
                v-model="setProfileData.username"
                id="username"
                type="text"
                class="w-full dark:bg-darkgray dark:text-white border-[1px] border-gray-300 rounded-lg p-2 md:text-lg text-sm"
                required
                placeholder="Choose a username"
              />
              <div v-if="usernameMeta.validated && !usernameMeta.valid">
                <span class="md:text-lg text-sm text-rose-500">{{ usernameErrorMessage }}</span>
              </div>
            </div>

            <div class="space-y-0.5">
              <label for="email" class="dark:text-white text-black md:text-lg text-sm"
                >Email (Required)</label
              >
              <input
                v-model="setProfileData.email"
                id="email"
                type="email"
                class="w-full dark:text-white dark:bg-darkgray border-[1px] border-gray-300 rounded-lg p-2 md:text-lg text-sm"
                required
                placeholder="Enter your email"
              />
              <span
                v-if="emailMeta.validated && !emailMeta.valid"
                class="md:text-lg text-sm text-rose-500"
                >{{ emailErrorMessage }}</span
              >
            </div>
            <div class="relative space-y-1">
              <label class="text-gray-950 dark:text-white text-sm" for="password">
                Password (Required)
              </label>
              <input
                v-model="setProfileData.password"
                id="password-lg"
                :type="togglePasswordVisibility"
                class="w-full dark:bg-darkgray dark:text-white border border-gray-300 rounded-lg p-2 lg:text-lg text-sm pr-10"
                required
                placeholder="Enter password"
              />
              <!-- unified toggle button -->
              <button
                type="button"
                @click="isPasswordVisible = !isPasswordVisible"
                class="absolute right-3 top-1/2 transform -translate-y-[55%] sm:-translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                <span class="material-icons-outlined text-xl">
                  {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              <span v-if="passwordMeta.validated && !passwordMeta.valid" class="text-rose-500"
                >{{ passwordErrorMessage }}
              </span>
            </div>

            <div class="relative space-y-1">
              <label class="text-gray-950 dark:text-white text-sm" for="confirmPassword">
                Confirm Password (Required)
              </label>
              <input
                v-model="setProfileData.confirmPassword"
                id="confirmPassword-lg"
                :type="toggleConfirmPasswordVisibility"
                class="w-full dark:bg-darkgray dark:text-white border border-gray-300 rounded-lg p-2 lg:text-lg text-sm pr-10"
                required
                placeholder="Confirm password"
              />

              <!-- unified toggle button -->
              <button
                type="button"
                @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                class="absolute right-3 top-1/2 transform -translate-y-[55%] sm:-translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                <span class="material-icons-outlined text-xl leading-none">
                  {{ isConfirmPasswordVisible ? 'visibility_off' : 'visibility' }}
                </span>
              </button>

              <span
                v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"
                class="text-rose-500"
              >
                {{ confirmPasswordErrorMessage }}
              </span>
            </div>
          </form>

          <div class="flex gap-2">
            <div>
              <div class="text-nowrap">
                <span class="pe-1 text-sm dark:text-white">Read our full</span>
                <router-link
                  to="/auth/register/terms-condition-1"
                  class="text-sm cursor-pointer text-button-light"
                  >Terms of Use
                </router-link>
                <span class="text-sm dark:text-white px-1">and</span>
                <router-link
                  to="/auth/register/privacy-policy-1"
                  class="text-sm cursor-pointer text-button-light"
                >
                  Privacy Policy
                </router-link>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex gap-1 xl:gap-1 justify-center">
                  <input
                    type="checkbox"
                    v-model="setProfileData.isTermsCondition"
                    class="checkbox h-5 w-5 mt-1
                    border-2 border-gray-400 dark:border-gray-500
                    checked:bg-button-light checked:border-button-light
                    focus:ring-2 focus:ring-button-light/50
                    transition-all duration-150"                  />
                </div>
                <div>
                  <p class="text-gray-900 dark:text-gray-50 text-sm font-medium">Please accept before proceeding</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="SetProfileError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500 text-sm">{{ SetProfileError.message }}</span>
        </div>
        <div class="border-b border-stone-400 w-full pt-2"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center">
          <button
            @click="goToKnowYou"
            :class="[!everyThingOk ? 'bg-button-inactive' : 'bg-button-light ']"
            class="btn w-full btn-sm text-sm rounded-2xl py-5 border-none shadow-none"
          >
            <span v-if="!isLoading" class="text-sm">Next</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
        <div class="flex justify-center">
          <p class="text-sm dark:text-white">
            Already have an account?
            <RouterLink to="/auth/login" class="text-sm text-rose-400">Log in</RouterLink>
          </p>
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
            <p class="md:text-large text-small dark:text-white">Are you sure?</p>
            <span class="md:text-small dark:text-white text-center text-extra-small"
              >If you login anonymously, your chats won't be saved for future reference.</span
            >
          </div>
        </template>
        <template #footer>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-1 w-full">
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
                class="w-full btn btn-sm bg-transparent border-casablanca-300 shadow-none rounded-lg"
              >
                <span class="text-extra-small dark:text-white md:text-small">Cancel</span>
              </button>
            </div>
          </div>
        </template>
      </DialogModal>
    </Teleport>
  </div>
</template>

<style scoped></style>
