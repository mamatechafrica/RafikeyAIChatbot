<script setup lang="ts">
import { reactive, computed, ref, onMounted, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import LisxBox from '@/components/LisxBox.vue'
import RadioGroup from '@/components/chat/RadioGroup.vue'
import { range } from 'lodash'
import { useAuthStore, useCreateAccountFormStore, useNotificationStore } from '@/stores'
import { imageToggleSmallDevice, toggleImage } from '@/composables/imageToggle.ts'

interface Buttons {
  name: string
  id: number
}

const createAccountFormStore = useCreateAccountFormStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const isLoading = ref(false)
const ageRangePlaceholder = 'Choose your age range'
const genderPlaceholder = 'Choose your gender'
const relationshipPlaceholder = 'Pick an option'

const getToKnowYouData = reactive({
  age: '',
  gender: '',
  relationship_status: '',
})

const signupError = reactive({
  isError: false,
  message: '',
})

const ageRange = [
  {
    name: '10-14',
    id: 1,
  },
  {
    name: '15-19',
    id: 2,
  },
  {
    name: '20-24',
    id: 3,
  },
  {
    name: '25-29',
    id: 4,
  },
] as Buttons[]

const genderSet = [
  {
    name: 'Male',
    id: 5,
  },
  {
    name: 'Female',
    id: 6,
  },
  {
    name: 'Non-Binary',
    id: 7,
  },
  {
    name: 'Rather Not Say',
    id: 8,
  },
] as Buttons[]

const relationshipStatus = [
  {
    name: 'Yes',
    id: 9,
  },
  {
    name: 'No',
    id: 10,
  },
  {
    name: 'Rather Not Say',
    id: 11,
  },
] as Buttons[]

onMounted(() => {})

// selected get-to-know-you data
const selectedRadio = (value: Buttons) => {
  if (range(1, 5).includes(value.id)) {
    getToKnowYouData.age = value.name
  } else if (range(5, 9).includes(value.id)) {
    getToKnowYouData.gender = value.name
  } else {
    getToKnowYouData.relationship_status = value.name
  }
}

// all the get-to-know-you-data is okay
const everyThingOk = computed(() => {
  return (
    getToKnowYouData.age && getToKnowYouData.gender && getToKnowYouData.relationship_status
  )
})

watch(everyThingOk, (value) => {
  if (value) {
    signupError.isError = false
    signupError.message = ''
  }
})

// create account after everything is okay
const createAccountHandler = () => {
  if (everyThingOk.value) {
    // save the get-to-know-you data to the store
    createAccountFormStore.setProfile({
      age: getToKnowYouData.age,
      gender: getToKnowYouData.gender,
      relationship_status: getToKnowYouData.relationship_status,
    })
    isLoading.value = true
    authStore
      .createAccount()
      .then((response) => {
        if (response.result === 'ok') {
          notificationStore.addNotification('Account created successfully', 'success')
        setTimeout(()=>{
          router.push({
            name: 'login',
          })
          createAccountFormStore.clearProfile()
        }, 2000)
        } else {
          notificationStore.addNotification(response.message, 'error')
        }
      })
      .catch((error) => {
        console.error('Error creating account:', error)
        notificationStore.addNotification('An error occurred while creating your account, please try again later', 'error')

      })
      .finally(() => {
        isLoading.value = false
      })
  } else {
    // show an error message
    signupError.isError = true
    signupError.message = 'Please fill in all fields correctly'
  }
}

onBeforeMount(() => {
  setTimeout(() => {
    router.push({})
  }, 3000)
})
</script>

<template>
  <div class="min-h-screen dark:bg-lightgray w-full py-6 md:flex">
    <div
      class="relative bg-lightBackground dark:bg-darkgray flex flex-col w-10/12 mx-auto rounded-[34px] pb-10"
    >
      <div>
        <div class="h-20 flex justify-start items-center">
          <img :src="toggleImage()" alt="rafikey-logo" class="w-40 pt-6 ps-4" />
        </div>
        <div class="w-11/12 space-y-12 rounded-2xl mx-auto">
          <div class="md:pt-14 pt-1">
            <div class="flex flex-col items-center">
              <h2 class="text-extra-extra-large dark:text-white font-semibold">
                Let's Get To Know You Better
              </h2>
            </div>
          </div>

          <div class="border-b border-gray-400 w-1/3 mx-auto"></div>
          <div class="space-y-6">
            <div class="space-y-4">
              <div class="flex flex-col items-center">
                <p class="text-small dark:text-white">How old are you (Required)</p>
                <span class="text-small text-gray-700 dark:text-stone-300"
                  >So we can tailor content and support</span
                >
              </div>
              <div class="">
                <RadioGroup :radio-type="ageRange" @change="selectedRadio" />
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-center">
                <p class="text-small dark:text-white">Which gender are you (Required)</p>
              </div>
              <div class="">
                <RadioGroup :radio-type="genderSet" @change="selectedRadio" />
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-center flex-col items-center">
                <p class="text-small dark:text-white">Are you in a relationship? (Required)</p>
                <span class="text-small text-gray-700 dark:text-stone-300"
                  >Helps with personalized advice</span
                >
              </div>

              <div class="">
                <RadioGroup :radio-type="relationshipStatus" @change="selectedRadio" />
              </div>
            </div>
                        <div
                          v-if="signupError.isError"
                          class="flex gap-2 justify-start w-full lg:w-3/4 xl:w-1/2 mx-auto"
                        >
                          <span class="material-icons-outlined text-rose-500">error</span>
                          <span class="text-rose-500">{{ signupError.message }}</span>
                        </div>
          </div>
          <div class="border-b border-gray-400 w-1/3 mx-auto"></div>
          <div class="flex justify-center">
            <button
              @click="createAccountHandler"
              :class="[!everyThingOk ? 'bg-button-inactive' : 'bg-button-light']"
              class="btn w-1/3 btn-sm text-lg py-6 rounded-2xl border-none shadow-none"
            >
              <span v-if="!isLoading" class="text-extra-small">Sign up</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--    Small screen -->
  <div class="md:hidden dark:bg-darkgray block min-h-screen w-full overflow-hidden">
    <div class="w-36 h-20 mx-auto flex justify-center items-center">
      <img :src="imageToggleSmallDevice()" alt="rafikey-logo" />
    </div>
    <div class="md:px-20 px-6 space-y-4 sm:space-y-6">
      <div>
        <h2 class="text-extra-large dark:text-white font-semibold text-center">
          Let's Know You Better
        </h2>
      </div>
      <div class="border-b-[1px] border-stone-400 smx-auto"></div>

      <div class="space-y-2">
        <p class="text-gray-950 dark:text-white text-extra-small">Age Range (Required)</p>
        <LisxBox
          :list-items="ageRange"
          :place-holder="ageRangePlaceholder"
          @selected-list-item="selectedRadio"
        />
        <p class="text-gray-400 dark:text-stone-300 text-extra-extra-small">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div class="space-y-2">
        <p class="text-gray-950 text-extra-small dark:text-white">Gender (Required)</p>
        <LisxBox
          :list-items="genderSet"
          :place-holder="genderPlaceholder"
          @selected-list-item="selectedRadio"
        />
        <p class="text-gray-400 text-extra-extra-small dark:text-stone-300">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div class="space-y-2">
        <p class="text-gray-950 text-extra-small dark:text-white">
          Are you in a relationship (Required)
        </p>
        <LisxBox
          :list-items="relationshipStatus"
          :place-holder="relationshipPlaceholder"
          @selected-list-item="selectedRadio"
        />
        <p class="text-gray-400 text-extra-extra-small">To proceed fill all the fields</p>
      </div>
            <div v-if="signupError.isError" class="flex gap-2">
              <span class="material-icons-outlined text-rose-500">error</span>
              <span class="text-rose-500 md:text-lg text-sm">{{ signupError.message }}</span>
            </div>
      <div class="border-b-[1px] border-stone-400 mx-auto"></div>
      <div class="w-3/4 mx-auto flex justify-between items-center">
        <button
          @click="createAccountHandler"
          :class="[!everyThingOk ? 'bg-button-inactive' : 'bg-button-light']"
          class="btn w-full btn-sm 0 text-lg rounded-2xl py-5 border-none shadow-none"
        >
          <span v-if="!isLoading" class="text-sm md:text-lg">Sign up</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
