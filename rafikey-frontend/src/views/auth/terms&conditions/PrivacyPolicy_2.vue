<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { useRafikeyChatbotStore } from '@/stores'

const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()

const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ?  imageDark: imageLight
})


</script>

<template>
  <div class="h-screen w-full dark:bg-lightgray">
    <div class="md:w-10/12 w-11/12 mx-auto pb-10">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col items-start justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-nowrap text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
          >
            <span class="material-icons-outlined dark:text-white md:text-lg text-sm">chevron_left</span>
            <span v-if="chatbotStore.isShowTermsButton" class="text-extra-extra-small font-light dark:text-white">Back to Sign Up</span>
            <span v-else class="text-extra-extra-small font-light dark:text-white">Go back</span>
          </div>
        </div>
        <div class="flex   w-full   md:justify-center justify-end col-span-2  md:col-span-1">
          <img :src="toggleImage" alt="rafikey-icon" class="md:w-60 w-40" />
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link
              to="/auth/register/terms-of-service"
              class="bg-casablanca-200 md:text-small text-extra-extra-small-2 w-fit rounded-lg flex justify-center items-center md:px-2 px-3 py-1"
            >
              <span>Terms of Use</span></router-link
            >
          </div>
          <div class="flex flex-col items-center space-y-3">
            <h2 class="md:text-extra-extra-large-1 text-large text-center font-semibold dark:text-white">Privacy Policy</h2>
            <p class="md:text-large text-text-extra-extra-small-2  dark:text-white">
              Last updated:
              <span class="text-casablanca-300 md:text-large text-extra-extra-small-2">19 June 2025</span>
            </p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg space-y-4 lg:px-6 px-1 dark:text-white">
          <div class="">
            <p class="md:text-large text-extra-small">
              At Rafikey, your privacy and safety comes first. This policy explains what personal
              information we collect, wky we collect it, and how we keep it safe. We are committed
              to protecting your data and following the General Data Protection Regulation (GDPR).
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small  font-semibold">What We Collect</h2>
            <p class="md:text-large text-extra-small ">We only collect the information you choose to give us, such as:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-large text-extra-small">Username (can be anonymous)</li>
              <li class="md:text-large text-extra-small">Email address(for login and support)</li>
              <li class="md:text-large text-extra-small ">Password(encrypted and never visible to anyone)</li>
              <li class="md:text-large  text-extra-small">Age range, and relationship status(to personalize your experience)</li>
            </ul>
            <p class="md:text-large text-extra-small">
              We do not collect real names, phone numbers, or any sensitive data unless you choose
              to share it.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1  text-extra-small font-semibold">Why We Collect It</h2>
            <p class="md:text-large text-extra-small">We use your information to:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-large text-extra-small">Personalize support and content for your age and identity</li>
              <li class="md:text-large text-extra-small">Keep your account secure</li>
              <li class="md:text-large text-extra-small">Improve Rafikey to better serve your needs</li>
            </ul>
            <p class="md:text-large text-extra-small">
              We never sell or share your information with third parties for advertising or
              tracking.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold">How We Keep It Safe</h2>
            <ul class="list-disc pl-10">
              <li class="md:text-large text-extra-small">All passwords are securely encrypted.</li>
              <li class="md:text-large text-extra-small">Your data is stored on secure servers.</li>
              <li class="md:text-large text-extra-small">
                Only authorized Rafikey staff can access limited data - only when needed for
                support.
              </li>
            </ul>
            <p class="md:text-large text-extra-small">
              We never sell or share your information with third parties for advertising or
              tracking.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small  font-semibold">Your Rights</h2>
            <p class="text-large">You have the right to:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-large text-extra-small">Ask what data we hold about you.</li>
              <li class="md:text-large text-extra-small">Request updates or deletion of your data</li>
              <li class="md:text-large text-extra-small">Withdraw consent at any time</li>
            </ul>
            <p class="md:text-large text-extra-small">
              To do so, email us at
              <a href="mailto:Support@rafikey.org" class="text-casablanca-600"
                >support@rafikey.org</a
              >
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold">Cookies</h2>
            <p class="md:text-large text-extra-small">
              We use minimal cookies to help the website function properly. We do not use tracking
              cookies or ad-based cookies.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold">GDPR Compliance</h2>
            <p class="md:text-large text-extra-small">
              Rafikey is fully GDPR-compliant. If you're under 16, make sure sure you have
              permission from a parent or guardian before signing up.
            </p>
          </div>
          <div class="">
            <h2  class="md:text-extra-extra-large-1 text-extra-small font-semibold">Contact Us</h2>
            <p class="md:text-large text-extra-small">
              If you have questions or concerns about your privacy, contact us at
              <a href="mailto:Support@rafikey.org" class="text-casablanca-600"
                >support@rafikey.org</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
