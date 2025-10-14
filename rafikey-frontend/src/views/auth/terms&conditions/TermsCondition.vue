<script setup lang="ts">
import  { useRouter } from 'vue-router'
import { useCreateAccountFormStore, useRafikeyChatbotStore } from '@/stores'
import { showSweetAlert } from "@/composables/alert.ts";
import { toggleImage } from "@/composables/imageToggle.ts";


const router = useRouter()
const createAccountFormStore = useCreateAccountFormStore()
const chatbotStore = useRafikeyChatbotStore()


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
  <div class="min-h-screen w-full dark:bg-lightgray">
    <div class="w-10/12 mx-auto space-y-4 pb-10">
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
        <div class="flex w-full   md:justify-center justify-end col-span-2  md:col-span-1">
          <img :src="toggleImage()" alt="rafikey-icon" class="md:w-60 w-40"/>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link to="/auth/register/privacy-policy-2" class="bg-casablanca-300 dark:opacity-50  md:text-small text-extra-extra-small-2  w-fit rounded-lg flex justify-center items-center md:px-2 px-3 py-1">
              <span class="">Privacy Policy</span>
            </router-link>
          </div>
          <div class="flex  flex-col items-center space-y-3">
            <h2 class="md:text-extra-extra-large-1 text-large  font-semibold dark:text-white">Terms of Use </h2>
            <p class="md:text-large text-text-extra-extra-small-2  dark:text-white">
              Effective Date:
              <span class="text-casablanca-300 md:text-large text-extra-extra-small-2">August 2025</span>
            </p>
            <p class="md:text-large text-text-extra-extra-small-2  dark:text-white">
              Last Updated:
              <span class="text-casablanca-300 md:text-large text-extra-extra-small-2">30th September 2025</span>
            </p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg dark:text-white space-y-4 lg:px-6 px-1">
          <div class="">
            <p class="md:text-large text-extra-small">
              Welcome to Rafikey! Rafikey is a digital platform designed to support young people with trusted information,
              interactive learning, and access to services. Whether you're chatting with our bot, playing games,
              or exploring service referrals, you're part of a community built on respect, safety, and empowerment.
              <br>
              By using Rafikey, you agree to follow these Terms of Use. They help ensure that everyone—no matter
              their background or identity—can engage freely and safely. Please take a moment to read them
              carefully to understand your rights, responsibilities, and how we protect your experience.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">1. Purpose of Rafikey</h2>
            <p class="md:text-large text-extra-small ">Rafikey is a digital platform designed to:</p>
              <ul class="list-disc md:pl-6 pl-4 space-y-1">
                <li class="md:text-large text-extra-small">Provide age-appropriate information on health, relationships, and rights</li>
                <li class="md:text-large text-extra-small">Offer interactive games that build knowledge and confidence</li>
                <li class="md:text-large text-extra-small">Connect users to trusted services and support networks</li>
              </ul>
              <p class="md:text-large text-extra-small ">Rafikey is not a substitute for professional medical or legal advice.</p>
          </div>

          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">2. Who Can Use Rafikey</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">Rafikey is designed for young people aged 18 and above.</li>
              <li class="md:text-large text-extra-small">If you’re under 18, we recommend using Rafikey with a parent, caregiver, or trusted adult.</li>
              <li class="md:text-large text-extra-small">By using Rafikey, you confirm that you understand and accept these terms.</li>
            </ul>
          </div>

          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">3. Chat and Game Use</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">You are welcome to ask questions, play games, and explore the content freely.</li>
              <li class="md:text-large text-extra-small">Please use respectful language when engaging</li>
              <li class="md:text-large text-extra-small">Bullying, hate speech, or inappropriate content is not allowed.</li>
              <li class="md:text-large text-extra-small">Rafikey may guide you to services or resources based on your inputs, but you’re always in control of what you choose to access.</li>
            </ul>

          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">4. Service Referrals</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">Rafikey may suggest health clinics, helplines, or support services.</li>
              <li class="md:text-large text-extra-small">These referrals are based on general location and topic relevance, not personal data.</li>
              <li class="md:text-large text-extra-small">Rafikey does not guarantee the quality or availability of third-party services.</li>
            </ul>

          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">5. Privacy and Safety</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">Rafikey protects your privacy. We do not collect personal data unless you choose to share it for a more personalized experience </li>
              <li class="md:text-large text-extra-small">For more details, see our [Privacy Policy].</li>
              <li class="md:text-large text-extra-small">If you feel unsafe or experience abuse, Rafikey can help you find support, but we encourage you to speak to a trusted adult immediately.</li>
            </ul>
          </div>

          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">6. What You Shouldn’t Do</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">Use Rafikey to harm, harass, or mislead others</li>
              <li class="md:text-large text-extra-small">Share false or dangerous information</li>
              <li class="md:text-large text-extra-small">Try to access or misuse the platform’s systems or data</li>
            </ul>
          </div>

          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">7. Changes and Updates</h2>
            <ul class="list-disc md:pl-6 pl-4 space-y-1">
              <li class="md:text-large text-extra-small">Rafikey may update these terms or their features at any time.</li>
              <li class="md:text-large text-extra-small">We’ll let you know if major changes happen. Continued use means you accept the updates.</li>
            </ul>


          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold">8. Contact Us</h2>
            <p class="md:text-large text-extra-small ">If you have questions or concerns, reach out to: <a href="mailto:rafikey@afrimedia.org" class="text-blue-500">rafikey@afrimedia.org</a></p>
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
