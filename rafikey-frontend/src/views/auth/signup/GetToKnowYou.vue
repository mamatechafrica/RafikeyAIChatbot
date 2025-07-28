<script setup lang="ts">
import { reactive, computed, ref, onMounted, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import LisxBox from '@/components/LisxBox.vue'
import RadioGroup from '@/components/chat/RadioGroup.vue'
import {range} from "lodash";
import { useAuthStore, useCreateAccountFormStore, useRafikeyChatbotStore } from '@/stores'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'




interface Buttons {
  name: string
  id: number
}

const createAccountFormStore = useCreateAccountFormStore()
const authStore = useAuthStore()
const chatbotStore = useRafikeyChatbotStore()
const router = useRouter()
const isLoading = ref(false)

const toggleImage = computed(() => {
  return  chatbotStore.isDarkMode ? imageDark : imageLight
})
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

watch(everyThingOk, (value) =>{
  if(value){
    signupError.isError = false
    signupError.message = ''
  }
})


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

    <div class="h-screen w-full overflow-hidden hidden md:flex items-center justify-center dark:bg-lightgray">
      <div class="bg-lightBackground dark:bg-darkgray flex flex-col w-10/12 mx-auto rounded-2xl pb-10">
        <div>
          <div>
            <img :src="toggleImage" alt="rafikey-logo" />
          </div>
          <div class="w-10/12 rounded-2xl   mx-auto" :class="[signupError.isError? ' space-y-4': 'space-y-6']">
            <div class="flex flex-col items-center">
              <h2 class="text-4xl font-semibold dark:text-white">Let's Get To Know You Better</h2>
            </div>
            <div class="border-b border-gray-400 w-1/2 xl:w-1/4 mx-auto dark:border-stone-400"></div>
            <div class="space-y-4">
              <div class="flex flex-col items-center">
                <p class="text-lg dark:text-white">How old are you</p>
                <span class="text-lg text-gray-700 dark:text-stone-300">So we can tailor content and support</span>
              </div>
              <div class="">
                <RadioGroup :radio-type="ageRange"  @change="selectedRadio"/>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-center">
                <p class="text-lg text-white">Which gender are you</p>
              </div>
              <div class="">
                <RadioGroup :radio-type="genderSet" @change="selectedRadio"/>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-center flex-col items-center">
                <p class="text-lg text-white">Are you in a relationship?</p>
                <span class="text-lg text-gray-700 dark:text-stone-300">Helps with personalized advice</span>
              </div>

              <div class="">
                <RadioGroup :radio-type="relationshipStatus" @change="selectedRadio"/>
              </div>
            </div>
            <div v-if="signupError.isError" class="flex gap-2 justify-start w-full lg:w-3/4  xl:w-1/2 mx-auto ">
              <span class="material-icons-outlined text-rose-500">error</span>
              <span class="text-rose-500">{{signupError.message}}</span>
            </div>
            <div class="border-b border-gray-400 w-1/2 xl:w-1/4  mx-auto dark:border-stone-400"></div>
            <div class="flex flex-col">
              <div class="flex gap-1 xl:gap-1 justify-center">
                <input type="checkbox" v-model="getToKnowYouData.isTermsCondition" class="checkbox text-button-light border-slate-800 dark:border-white" />
                <p class="text-lg text-center dark:text-white">
                  We follow strict privacy rules (GDPR-compliant). Your info is safe and won't be shared
                  without your consent.
                </p>
              </div>

              <div class="flex justify-center">
                <span class="pe-1 dark:text-white text-lg">Read our full</span>
                <router-link to="/auth/register/privacy-policy-1" class="text-lg cursor-pointer text-button-light"
                >Terms of Use
                </router-link>
                <span class="px-1 dark:text-white text-lg">and</span>
                <router-link to="/auth/register/privacy-policy-1" class="text-lg cursor-pointer text-button-light">
                  Privacy Policy
                </router-link>
              </div>
            </div>
<!--            <div class="w-3/4 mx-auto flex justify-between items-center"></div>-->
            <div class="flex justify-center">
              <button
                @click="createAccountHandler"
                class="btn w-full xl:w-1/2  btn-sm text-lg rounded-2xl py-6 bg-button-light border-none shadow-none"
              >
                <span v-if="!isLoading" class="text-lg">Sign up</span>
                <span v-else class="loading loading-spinner loading-sm"></span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>


  <!--    Small screen -->
  <div class="md:hidden block min-h-screen w-full overflow-hidden dark:bg-darkgray">
    <div class="flex justify-center">
      <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" class="w-24" />
    </div>
    <div class="md:px-20 px-6 space-y-2  sm:space-y-4">
      <div>
        <h2 class="md:text-2xl text-lg font-semibold text-center dark:text-white">Let's Know You Better</h2>
      </div>
      <div class="border-b border-gray-400 smx-auto dark:border-stone-400"></div>

      <div  class="space-y-2">
        <p class="text-gray-950 dark:text-white md:text-lg text-sm">Age Range</p>
        <LisxBox :list-items="ageRange" :place-holder="ageRangePlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 md:text-lg text-sm dark:text-stone-300">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div class="space-y-2">
        <p class="text-gray-950 md:text-lg text-sm dark:text-white">Gender</p>
        <LisxBox :list-items="genderSet" :place-holder="genderPlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 md:text-lg text-sm dark:text-stone-300">
          This helps us give you the right kind of support and info for your age
        </p>
      </div>
      <div class="space-y-2">
        <p class="text-gray-950 md:text-lg text-sm dark:text-white">Are you in a relationship</p>
        <LisxBox :list-items="relationshipStatus" :place-holder="relationshipPlaceholder" @selected-list-item="selectedRadio" />
        <p class="text-gray-400 md:text-lg text-sm dark:text-stone-300">Optional - help with personalized advice.</p>
      </div>
      <div v-if="signupError.isError" class="flex gap-2">
        <span class="material-icons-outlined text-rose-500">error</span>
        <span class="text-rose-500 md:text-lg text-sm">{{signupError.message}}</span>
      </div>
      <div class="border-b border-gray-400 mx-auto dark:border-stone-400"></div>
      <div>
        <p class="text-gray-950 md:text-lg text-sm dark:text-white">
          We follow strict privacy rules (GDPR-compliant). Your info is safe and won't be shared
          without your consent.
        </p>
      </div>
      <div class="">
        <input type="checkbox" v-model="getToKnowYouData.isTermsCondition" class="checkbox text-button-light border-slate-800 dark:border-white" />
        <span class="text-gray-950 dark:text-white md:text-lg text-sm ps-4"
          >Creating an account means you are okay with our</span
        >
        <router-link to="/auth/register/privacy-policy-1" class="cursor-pointer md:text-lg text-sm text-button-light">
          Terms of Use
        </router-link>
        <span class="dark:text-white md:text-lg text-sm"> and</span>
        <router-link to="/auth/register/privacy-policy-1" class="md:text-lg text-sm cursor-pointer text-button-light">
          Privacy Policy
        </router-link>
      </div>
      <div class="w-3/4 mx-auto flex justify-between items-center">
        <button
          @click="createAccountHandler"
          class="btn w-full btn-sm 0 text-lg rounded-2xl py-5 bg-button-light border-none shadow-none"
        >
          <span v-if="!isLoading" class="text-sm md:text-lg">Sign up</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
