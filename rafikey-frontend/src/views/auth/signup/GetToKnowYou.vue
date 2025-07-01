<script setup lang="ts">
import { reactive, computed, ref, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import LisxBox from '@/components/LisxBox.vue'
import RadioGroup from '@/components/chat/RadioGroup.vue'
import {range} from "lodash";
import {useAuthStore, useCreateAccountFormStore} from "@/stores";
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-black.png'

const isDark = localStorage.getItem('darkMode')
console.log('we have mode', isDark)
const toggleImage = computed(() => {
  return isDark ? imageDark : imageLight
})

interface Buttons {
  name: string
  id: number
}

const createAccountFormStore = useCreateAccountFormStore()
const authStore = useAuthStore()
const router = useRouter()

const ageRangePlaceholder = 'Choose your age range'
const genderPlaceholder = 'Choose your gender'
const relationshipPlaceholder = 'Pick an option'



const getToKnowYouData = reactive({
  age: '',
  gender: '',
  relationship_status: '',
  isTermsCondition: false,
})

const signupError = reactive({
  isError: false,
  message: ''
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

onMounted(()=>{

})


// selected get-to-know-you data
const selectedRadio = (value: Buttons) => {
if(range(1, 5).includes(value.id)) {
  console.log('age range selected:', value.name)
  getToKnowYouData.age = value.name
} else if (range(5, 9).includes(value.id)) {
  getToKnowYouData.gender = value.name
} else {
  getToKnowYouData.relationship_status = value.name
}
}

// all the get-to-know-you-data is okay
const  everyThingOk = computed(()=>{
  return(
    // createAccountFormStore.getProfile.username &&
    // createAccountFormStore.getProfile.email &&
    // createAccountFormStore.getProfile.password &&
    // createAccountFormStore.getProfile.age &&
    // createAccountFormStore.getProfile.gender &&
    // createAccountFormStore.getProfile.terms_accepted &&
    // createAccountFormStore.getProfile.relationship_status

  getToKnowYouData.age && getToKnowYouData.gender && getToKnowYouData.relationship_status && getToKnowYouData.isTermsCondition
  )
})
const isLoading = ref(false)

// create account after everything is okay
const createAccountHandler = () =>{
  if(everyThingOk.value) {
    // save the get-to-know-you data to the store
    createAccountFormStore.setProfile({
      ...getToKnowYouData
    })
    console.log(createAccountFormStore.getProfile)
    isLoading.value = true
    authStore.createAccount()
      .then((response) => {
        if(response.result === 'ok'){
          router.push({
            name:'login'
          })
          createAccountFormStore.clearProfile()
        }
        else{
          signupError.message = response.message
          signupError.isError = true
        }
      })
      .catch((error) => {
        console.error('Error creating account:', error)
        signupError.isError = true
        signupError.message =  'An error occurred while logging in, please try again later'
      })
      .finally(()=>{
        isLoading.value = false
      })
  } else {
    // show an error message
    console.error('Please fill all the fields')
    signupError.isError= true
    signupError.message =  'Please fill in all fields correctly'
  }
}
 onMounted(()=>{
   getToKnowYouData.isTermsCondition =  createAccountFormStore.getProfile.terms_accepted
 })

onBeforeMount(()=>{
  setTimeout(()=>{
    router.push({

    })
  }, 3000)
})

</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block">
      <div>
        <img src="@/assets/images/rafikey-icon.png" alt="rafikey-logo" />
      </div>
      <div class="w-6/12 mx-auto space-y-8">
        <div class="flex flex-col items-center">
          <h2 class="lg:text-3xl text-xl font-semibold">Let's Get To Know You Better</h2>
        </div>
        <div class="border-b border-gray-400 w-3/4 mx-auto"></div>
        <div class="space-y-4">
          <div class="flex flex-col items-center">
            <p class="lg:text-xl text-lg">How old are you</p>
            <span class="text-lg text-gray-700">So we can tailor content and support</span>
          </div>
          <div class="">
            <RadioGroup :radio-type="ageRange"  @change="selectedRadio"/>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-center">
            <p class="lg:text-xl text-lg">Which gender are you</p>
          </div>
          <div class="">
            <RadioGroup :radio-type="genderSet" @change="selectedRadio"/>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-center flex-col items-center">
            <p class="lg:text-xl text-lg">Are you in a relationship?</p>
            <span class="text-lg text-gray-700">Helps with personalized advice</span>
          </div>

          <div class="">
            <RadioGroup :radio-type="relationshipStatus" @change="selectedRadio"/>
          </div>
        </div>
        <div v-if="signupError.isError" class="flex gap-2">
          <span class="material-icons-outlined text-rose-500">error</span>
          <span class="text-rose-500">{{signupError.message}}</span>
        </div>
        <div class="border-b border-gray-400 w-3/4 mx-auto"></div>
        <div class="flex flex-col">
          <div class="flex gap-1 xl:gap-1 justify-center">
            <input type="checkbox" v-model="getToKnowYouData.isTermsCondition" class="checkbox text-casablanca-400 border-slate-800" />
            <p class="text-center">
              We follow strict privacy rules (GDPR-compliant). Your info is safe and won't be shared
              without your consent.
            </p>
          </div>

          <div class="flex justify-center">
            <span class="pe-1">Read our full</span>
            <router-link to="/auth/privacy-policy-1" class="cursor-pointer text-casablanca-600"
              >Terms of Use
            </router-link>
            <span class="px-1">and</span>
            <router-link to="/auth/privacy-policy-1" class="cursor-pointer text-casablanca-600">
              Privacy Policy
            </router-link>
          </div>
        </div>
        <div class="w-3/4 mx-auto flex justify-between items-center"></div>
        <div class="flex justify-center">
          <button
            @click="createAccountHandler"
            :disabled="!everyThingOk"
            :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
            class="btn w-full xl:w-1/2  btn-sm text-lg rounded-2xl py-6"
          >
            <span v-if="!isLoading">Sign up</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>

      </div>
    </div>
  </div>

  <!--    Small screen -->
  <div class="lg:hidden block h-screen w-full">
    <div class="flex justify-center">
      <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
    </div>
    <div class="px-20 space-y-6">
      <div>
        <h2 class="text-2xl font-semibold text-center">Let's Know You Better</h2>
      </div>
      <div class="border-b border-gray-400 smx-auto"></div>

      <div>
        <p class="text-gray-950 text-lg">Age Range</p>
        <LisxBox :list-items="ageRange" :place-holder="ageRangePlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 text-lg">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div>
        <p class="text-gray-950 text-lg">Gender</p>
        <LisxBox :list-items="genderSet" :place-holder="genderPlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 text-lg">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div>
        <p class="text-gray-950 text-lg">Are you in a relationship</p>
        <LisxBox :list-items="relationshipStatus" :place-holder="relationshipPlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 text-lg">Optional - help with personalized advice.</p>
      </div>
      <div v-if="signupError.isError" class="flex gap-2">
        <span class="material-icons-outlined text-rose-500">error</span>
        <span class="text-rose-500">{{signupError.message}}</span>
      </div>
      <div class="border-b border-gray-400 mx-auto"></div>
      <div>
        <p class="text-gray-950 text-lg">
          We follow strict privacy rules (GDPR-compliant). Your info is safe and won't be shared
          without your consent.
        </p>
      </div>
      <div class="">
        <input type="checkbox" v-model="getToKnowYouData.isTermsCondition" class="checkbox text-casablanca-400 border-slate-800" />
        <span class="text-gray-950 text-lg ps-4"
          >Creating an account means you are okay with our</span
        >
        <router-link to="/auth/privacy-policy-1" class="cursor-pointer text-casablanca-600">
          Terms of Use
        </router-link>
        <span class=""> and</span>
        <router-link to="/auth/privacy-policy-1" class="cursor-pointer text-casablanca-600">
          Privacy Policy
        </router-link>
      </div>
      <div class="w-3/4 mx-auto flex justify-between items-center">
        <button
          @click="createAccountHandler"
          :disabled="!everyThingOk"
          :class="[!everyThingOk ? 'bg-casablanca-100' : 'bg-casablanca-300 hover:bg-casablanca-400']"
          class="btn w-full btn-sm 0 text-lg rounded-2xl py-6"
        >
          <span v-if="!isLoading">Sign up</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
