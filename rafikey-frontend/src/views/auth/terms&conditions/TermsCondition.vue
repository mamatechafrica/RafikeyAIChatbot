<script setup lang="ts">
import  { useRouter } from 'vue-router'
import { useCreateAccountFormStore, useRafikeyChatbotStore } from '@/stores'
import { showSweetAlert } from '@/modules/alert.ts'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { computed } from 'vue'

const router = useRouter()
const createAccountFormStore = useCreateAccountFormStore()
const chatbotStore = useRafikeyChatbotStore()

const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ? imageDark: imageLight
})
console.log("MOde---", chatbotStore.isDarkMode)
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
const goBack = () =>{
  if(chatbotStore.isShowTermsButton){
    router.push({ name: 'get-to-know-you' })
  } else{
    router.push({ name: 'newChat' })
  }
}


</script>

<template>
  <div class="h-screen w-full dark:bg-lightgray">
    <div class="w-10/12 mx-auto space-y-4">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col items-start justify-end ">
          <div
            @click="goBack"
            class="flex  lg:pb-10 pb-8  cursor-pointer text-gray-1000 text-nowrap justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
            <span class="material-icons-outlined dark:text-white  md:text-lg text-sm ">chevron_left</span>
            <span v-if="chatbotStore.isShowTermsButton" class="text-extra-extra-small font-light dark:text-white">Back to Sign Up</span>
            <span v-else  class="text-extra-extra-small  font-light dark:text-white">Back to Chats</span>
          </div>
        </div>
        <div class="flex   w-full   md:justify-center justify-end col-span-2  md:col-span-1">
          <img :src="toggleImage" alt="rafikey-icon" class="md:w-60 w-40"/>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link to="/auth/register/privacy-policy-2" class="bg-casablanca-200 md:text-small text-extra-extra-small-2  w-fit rounded-lg flex justify-center items-center md:px-2 px-3 py-1"><span>Privacy Policy</span></router-link>
          </div>
          <div class="flex  flex-col items-center space-y-3" >
            <h2 class="md:text-extra-extra-large-1 text-large font-semibold dark:text-white">Terms of Use </h2>
            <p class="md:text-large text-text-extra-extra-small-2 dark:text-white">Last updated: <span class="text-casablanca-300  md:text-large text-extra-extra-small-2">19 June 2025</span></p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg dark:text-white space-y-4 lg:px-6 px-1">
          <div class="">
            <p class="md:text-large text-extra-small">Welcome to Rafikey! These Terms of Use explain how you can use Rafikey safely and respectfully. By using Rafikey, you agree to these terms. Please read them carefully.</p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold">1. What is Rafikey</h2>
            <p class="md:text-large text-extra-small ">Rafikey is a free digital space where young people can:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-large text-extra-small">Chat with a helpful bot about health and relationships.</li>
              <li class="md:text-large text-extra-small">Find trusted information and articles.</li>
              <li class="md:text-large text-extra-small">Located friendly clinics and services near them</li>
              <li class="md:text-large text-extra-small">Talk safely and privately about what matters to them.</li>
            </ul>
          </div>
          <div>
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">2. Who Can Use Rafikey?</h2>
            <p class="md:text-large text-extra-small">Rafikey is built for people aged 10 and above. If you are under 18, we recommend  telling a trusted adult you're using the service - but you don't have to if you're not comfortable.</p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1  text-extra-small  font-semibold">3. Your Privacy Matters</h2>
            <ul class="list-disc pl-10 md:text-large text-extra-small">
              <li>We do not collect your name, unless you give it.</li>
              <li>Your conversations are private - we don't share or sell them.</li>
              <li>We may ask for your location, but only to help you find service near you. You can always say no.</li>
              <li>You can delete your account and data anytime.</li>
              <li>We follow strict rules like GDPR to keep your data safe.</li>
            </ul>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">4. Use Rafikey Respectfully</h2>
            <p class="md:text-large text-extra-small">By using Rafikey, you agree to:</p>
            <ul class="list-disc pl-10 md:text-large text-extra-small">
              <li>Be honest about your questions and needs.</li>
              <li>Not harm others or share harmful, violent or illegal content.</li>
              <li>Not pretend to be someone else.</li>
            </ul>
            <p class="md:text-large text-extra-small">We never sell or share your information with third parties for advertising or tracking.</p>
            <p class="md:text-large text-extra-small">Rafikey is here to support and guide - please use it kindly and responsibly.</p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">5. This Is Not Emergency</h2>
            <p class="md:text-large text-extra-small">Rafikey gives information and guidance, but it is not a substitute for emergency medical, mental health or legal help. If you are in danger, please reach out to a trusted adult, local clinic or emergency number in your country.</p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">6. We May Improve Things</h2>
            <p class="md:text-large text-extra-small">We're always working to make Rafikey better. That means we may update these terms from time to time. If we do, we'll let you know here or in the app.</p>
          </div>
          <div class="pb-24">
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">7. Contact Us</h2>
            <p class="md:text-large text-extra-small">If you have questions or concerns about your privacy, contact us at  <a href="mailto:Support@rafikey.org" class="text-casablanca-600">support@rafikey.org</a> </p>
          </div>
        </div>
      </div>

      <div v-if="chatbotStore.isShowTermsButton" class="fixed bottom-0 left-0 right-0 w-full py-4  bg-white dark:bg-lightgray">
        <div class="flex justify-center text-gray-950 text-xl gap-16">
          <div @click="isTermsConditionHandler(false)" class="bg-transparent  border border-casablanca-400 rounded-2xl text-small py-2  px-5 dark:text-white">Decline</div>
          <div @click="isTermsConditionHandler(true)" class="bg-casablanca-400 rounded-2xl text-small  py-2  px-5">Accept</div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
