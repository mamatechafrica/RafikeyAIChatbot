<script setup lang="ts">
import  { useRouter } from 'vue-router'
import { useCreateAccountFormStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
import imageLight from '../../../assets/images/rafikey-icon.png'
import imageDark from '../../../assets/images/rafikey-icon-dark.png'
import { computed } from 'vue'

const isDark = localStorage.getItem('darkMode')
console.log('we have mode', isDark)
const toggleImage = computed(() => {
  return isDark ? imageDark : imageLight
})

const router = useRouter()
const createAccountFormStore = useCreateAccountFormStore()

const isTermsConditionHandler = (value: boolean) =>{
  createAccountFormStore.setProfile({
    terms_accepted: value
  })
  if(value) {
    router.push({
      name: 'get-to-know-you'
    })
  }
    else{
      console.log("Decline terms")
      showSweetAlert({
        type: 'warning',
        message: 'You must accept the terms and conditions to continue or use Rafikey anonymously',
      })
    }
}


</script>

<template>
  <div class="h-full w-full dark:bg-lightgray">
    <div class="md:w-10/12 w-11/12 mx-auto space-y-4">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col justify-end ">
          <div
            @click="router.go(-1)"
            class="flex  lg:pb-10 pb-8  cursor-pointer text-gray-1000 text-nowrap justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
            <span class="material-icons-outlined dark:text-white  md:text-lg text-sm ">chevron_left</span>
            <span class=" md:text-lg text-sm  font-light dark:text-white">Back to Sign Up</span>
          </div>
        </div>
        <div class="flex invisible lg:visible justify-center col-span-1">
          <img :src="toggleImage" alt="rafikey-icon"/>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link to="/auth/privacy-policy-2" class="bg-casablanca-200 md:text-lg text-xs w-fit rounded-lg flex justify-center items-center px-2"><span>Privacy Policy</span></router-link>
          </div>
          <div class="flex  flex-col items-center space-y-3" >
            <h2 class="lg:text-4xl text-lg text-center  font-semibold dark:text-white">Privacy Policy</h2>
            <p class="lg:text-2xl text-sm dark:text-white">Last updated: <span class="text-casablanca-300 lg:text-2xl text-sm ">19 June 2025</span></p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg dark:text-white space-y-4 lg:px-6 px-1">
          <div class="">
            <p class="md:text-xl text-sm">Welcome to Rafikey! These Terms of Use explain how you can use Rafikey safely and respectfully. By using Rafikey, you agree to these terms. Please read them carefully.</p>
          </div>
          <div class="md:text-xl text-sm">
            <h2 class="lg:text-3xl text-xl font-semibold">1. What is Rafikey</h2>
            <p>Rafikey is a free digital space where young people can:</p>
            <ul class="list-disc pl-10">
              <li>Chat with a helpful bot about health and relationships.</li>
              <li>Find trusted information and articles.</li>
              <li>Located friendly clinics and services near them</li>
              <li>Talk safely and privately about what matters to them.</li>
            </ul>
          </div>
          <div>
            <h2 class="md:text-3xl text-lg  font-semibold">2. Who Can Use Rafikey?</h2>
            <p class="md:text-xl text-sm">Rafikey is built for people aged 10 and above. If you are under 18, we recommend  telling a trusted adult you're using the service - but you don't have to if you're not comfortable.</p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg  font-semibold">3. Your Privacy Matters</h2>
            <ul class="list-disc pl-10 md:text-xl text-sm">
              <li>We do not collect your name, unless you give it.</li>
              <li>Your conversations are private - we don't share or sell them.</li>
              <li>We may ask for your location, but only to help you find service near you. You can always say no.</li>
              <li>You can delete your account and data anytime.</li>
              <li>We follow strict rules like GDPR to keep your data safe.</li>
            </ul>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg  font-semibold">4. Use Rafikey Respectfully</h2>
            <p class="md:text-xl text-sm">By using Rafikey, you agree to:</p>
            <ul class="list-disc pl-10 md:text-xl text-sm">
              <li>Be honest about your questions and needs.</li>
              <li>Not harm others or share harmful, violent or illegal content.</li>
              <li>Not pretend to be someone else.</li>
            </ul>
            <p class="md:text-xl text-sm">We never sell or share your information with third parties for advertising or tracking.</p>
            <p class="md:text-xl text-sm">Rafikey is here to support and guide - please use it kindly and responsibly.</p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg font-semibold">5. This Is Not Emergency</h2>
            <p class="md:text-xl text-sm">Rafikey gives information and guidance, but it is not a substitute for emergency medical, mental health or legal help. If you are in danger, please reach out to a trusted adult, local clinic or emergency number in your country.</p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg font-semibold">6. We May Improve Things</h2>
            <p class="md:text-xl text-sm">We're always working to make Rafikey better. That means we may update these terms from time to time. If we do, we'll let you know here or in the app.</p>
          </div>
          <div class="pb-24">
            <h2 class="md:text-3xl text-lg  font-semibold">7. Contact Us</h2>
            <p class="md:text-xl text-sm">If you have questions or concerns about your privacy, contact us at  <a href="mailto:Support@rafikey.org" class="text-casablanca-600">support@rafikey.org</a> </p>
          </div>
        </div>
      </div>
      <div class="fixed bottom-0 left-0 right-0 w-full py-4  bg-white dark:bg-lightgray">
        <div class="flex justify-center text-gray-950 text-xl gap-16">
          <button @click="isTermsConditionHandler(false)" class="bg-transparent  border border-casablanca-400 rounded-2xl md:text-xl text-sm md:py-3 md:px-6 px-4 py-1 dark:text-white">Decline</button>
          <button @click="isTermsConditionHandler(true)" class="bg-casablanca-400 rounded-2xl md:py-3 md:px-6 px-3 md:text-xl text-sm py-1">Accept</button>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>

</style>
