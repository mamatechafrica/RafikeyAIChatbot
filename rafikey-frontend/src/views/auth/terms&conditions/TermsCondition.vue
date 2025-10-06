<script setup lang="ts">
import  { useRouter } from 'vue-router'
import { toggleImage } from '@/composables/imageToggle.ts'

const router = useRouter()


</script>

<template>
  <div class="min-h-screen w-full dark:bg-lightgray">
    <div class="w-10/12 mx-auto space-y-4 pb-10">
      <div class="grid grid-cols-3 sticky top-0 pt-10 md:pt-0 z-40 bg-white dark:bg-lightgray">
      <div class="col-span-1 flex flex-col items-start justify-end ">
        <div
          @click="router.go(-1)"
          class="flex  lg:pb-10 pb-8  cursor-pointer text-gray-1000 text-nowrap justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
          <span class="material-icons-outlined dark:text-white  md:text-lg text-sm ">chevron_left</span>
          <span class="text-extra-extra-small  font-light dark:text-white">Go Back</span>
        </div>
      </div>
      <div class="md:flex hidden w-full   md:justify-center justify-end col-span-2  md:col-span-1">
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
    </div>
  </div>

</template>

<style scoped>

</style>
