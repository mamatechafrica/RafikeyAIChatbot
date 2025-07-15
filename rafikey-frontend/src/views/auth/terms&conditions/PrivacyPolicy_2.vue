<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import imageLight from '@/assets/images/rafikey-icon-light.png'
import imageDark from '@/assets/images/rafikey-icon-dark.png'
import { useRafikeyChatbotStore } from '@/stores'

const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()

const toggleImage = computed(() => {
  return chatbotStore.isDarkMode ? imageDark : imageLight
})
</script>

<template>
  <div class="h-full w-full dark:bg-lightgray">
    <div class="md:w-10/12 w-11/12 mx-auto pb-10">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-nowrap text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
          >
            <span class="material-icons-outlined dark:text-white md:text-lg text-sm">chevron_left</span>
            <span class="md:text-lg text-sm font-light dark:text-white">Back to Sign Up</span>
          </div>
        </div>
        <div class="flex invisible lg:visible justify-center col-span-1">lg:text-3xl text-xl
          <img :src="toggleImage" alt="rafikey-icon" />
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link
              to="/auth/register/terms-of-service"
              class="bg-casablanca-200 md:text-lg text-xs w-fit rounded-lg flex justify-center items-center px-2"
            >
              <span>Terms of Use</span></router-link
            >
          </div>
          <div class="flex flex-col items-center space-y-3">
            <h2 class="lg:text-4xl text-lg text-center font-semibold dark:text-white">Privacy Policy</h2>
            <p class="lg:text-2xl text-sm dark:text-white">
              Last updated:
              <span class="text-casablanca-300 lg:text-2xl text-sm">19 June 2025</span>
            </p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg space-y-4 lg:px-6 px-1 dark:text-white">
          <div class="">
            <p class="md:text-xl text-sm ">
              At Rafikey, your privacy and safety comes first. This policy explains what personal
              information we collect, wky we collect it, and how we keep it safe. We are committed
              to protecting your data and following the General Data Protection Regulation (GDPR).
            </p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg font-semibold">What We Collect</h2>
            <p class="md:text-xl text-sm ">We only collect the information you choose to give us, such as:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-xl text-sm ">Username (can be anonymous)</li>
              <li class="md:text-xl text-sm ">Email address(for login and support)</li>
              <li class="md:text-xl text-sm ">Password(encrypted and never visible to anyone)</li>
              <li class="md:text-xl text-sm ">Age range, and relationship status(to personalize your experience)</li>
            </ul>
            <p class="md:text-xl text-sm ">
              We do not collect real names, phone numbers, or any sensitive data unless you choose
              to share it.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg  font-semibold">Why We Collect It</h2>
            <p class="md:text-xl text-sm ">We use your information to:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-xl text-sm">Personalize support and content for your age and identity</li>
              <li class="md:text-xl text-sm">Keep your account secure</li>
              <li class="md:text-xl text-sm ">Improve Rafikey to better serve your needs</li>
            </ul>
            <p class="md:text-xl text-sm">
              We never sell or share your information with third parties for advertising or
              tracking.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg  font-semibold">How We Keep It Safe</h2>
            <ul class="list-disc pl-10">
              <li class="md:text-xl text-sm">All passwords are securely encrypted.</li>
              <li class="md:text-xl text-sm">Your data is stored on secure servers.</li>
              <li class="md:text-xl text-sm">
                Only authorized Rafikey staff can access limited data - only when needed for
                support.
              </li>
            </ul>
            <p class="md:text-xl text-sm">
              We never sell or share your information with third parties for advertising or
              tracking.
            </p>
          </div>
          <div class="">
            <h2 class="md:text-3xl text-lg  font-semibold">Your Rights</h2>
            <p class="md:text-xl text-sm">You have the right to:</p>
            <ul class="list-disc pl-10">
              <li class="md:text-xl text-sm">Ask what data we hold about you.</li>
              <li class="md:text-xl text-sm">Request updates or deletion of your data</li>
              <li class="md:text-xl text-sm">Withdraw consent at any time</li>
            </ul>
            <p class="md:text-xl text-sm">
              To do so, email us at
              <a href="mailto:Support@rafikey.org" class="text-casablanca-600"
                >support@rafikey.org</a
              >
            </p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-lg font-semibold">Cookies</h2>
            <p class="md:text-xl text-sm">
              We use minimal cookies to help the website function properly. We do not use tracking
              cookies or ad-based cookies.
            </p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-lg font-semibold">GDPR Compliance</h2>
            <p class="md:text-xl text-sm">
              Rafikey is fully GDPR-compliant. If you're under 16, make sure sure you have
              permission from a parent or guardian before signing up.
            </p>
          </div>
          <div class="">
            <h2  class="lg:text-3xl text-lg font-semibold">Contact Us</h2>
            <p class="md:text-xl text-sm">
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
