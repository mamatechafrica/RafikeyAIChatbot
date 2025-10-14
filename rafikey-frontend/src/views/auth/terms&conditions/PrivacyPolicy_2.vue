<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRafikeyChatbotStore } from '@/stores'
import { toggleImage } from '@/composables/imageToggle.ts'

const router = useRouter()
const chatbotStore = useRafikeyChatbotStore()
</script>

<template>
  <div class="min-h-screen w-full dark:bg-lightgray">
    <div class="md:w-10/12 w-11/12 mx-auto pb-10">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white dark:bg-lightgray">
        <div class="col-span-1 flex flex-col items-start justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-nowrap text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none"
          >
            <span class="material-icons-outlined dark:text-white md:text-lg text-sm"
              >chevron_left</span
            >
            <span
              v-if="chatbotStore.isShowTermsButton"
              class="text-extra-extra-small font-light dark:text-white"
              >Back to Sign Up</span
            >
            <span v-else class="text-extra-extra-small font-light dark:text-white">Go back</span>
          </div>
        </div>
        <div
          class="flex md:visible invisible w-full md:justify-center justify-end col-span-2 md:col-span-1"
        >
          <img :src="toggleImage()" alt="rafikey-icon" class="md:w-60 w-40" />
        </div>
      </div>

      <div class="bg-gray-100 dark:bg-darkgray mx-auto p-10 rounded-2xl space-y-5">
        <div>
          <div class="flex justify-end">
            <router-link
              to="/auth/register/terms-of-service"
              class="bg-casablanca-300 dark:opacity-50 md:text-small text-extra-extra-small-2 w-fit rounded-lg flex justify-center items-center md:px-2 px-3 py-1"
            >
              <span>Terms of Use</span></router-link
            >
          </div>
          <div class="flex flex-col items-center space-y-3">
            <h2
              class="md:text-extra-extra-large-1 text-large text-center font-semibold dark:text-white"
            >
              Privacy Policy
            </h2>
            <p class="md:text-large text-text-extra-extra-small-2 dark:text-white">
              Effective Date:
              <span class="text-casablanca-300 md:text-large text-extra-extra-small-2"
                >August 2025</span
              >
            </p>
            <p class="md:text-large text-text-extra-extra-small-2 dark:text-white">
              Last Updated:
              <span class="text-casablanca-300 md:text-large text-extra-extra-small-2"
                >30th September 2025</span
              >
            </p>
            <div class="border-b border-gray-500 w-64 mx-auto"></div>
          </div>
        </div>

        <div class="flex flex-col lg:text-xl text-lg space-y-4 lg:px-6 px-1 dark:text-white">
          <div>
            <p class="md:text-large text-extra-small">
              At Rafikey, your privacy and safety come first. We are committed to creating a space
              where you can explore, learn, and connect without fear of judgment or misuse of your
              personal information.
              <br />
              This Privacy Policy explains how we collect, use, and protect the information you
              share while using Rafikey’s chat, games, and service referral features. Whether you're
              asking questions, playing to learn, or finding support, we want you to feel confident
              that your data is handled with care and respect.
              <br />
              We keep things simple, transparent, and secure—because your trust matters.
            </p>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Who We Are
            </h2>
            <p class="md:text-large text-extra-small">
              Rafikey is a digital platform designed to empower young people with accurate,
              age-appropriate information through chat, games, and service referrals. We prioritize
              your safety, privacy, and trust.
            </p>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              What Information We Collect
            </h2>
            <p class="md:text-large text-extra-small">
              We may collect the following types of information:
            </p>
            <p class="md:text-large text-extra-small font-semibold">1. Basic Usage Data</p>
            <ul class="list-disc pl-10">
              <li>Chat interactions (questions, responses, choices)</li>
              <li>Game progress and scores</li>
              <li>Referral clicks or service selections</li>
              <li>Session duration and bounce rates</li>
              <li>User journey</li>
            </ul>
            <p class="md:text-large text-extra-small font-semibold">2. Optional Personal Information</p>
            <ul class="list-disc pl-10">
              <li>Name (could be a pseudonym)</li>
              <li>Email address or phone for reminders, offers</li>
              <li>Age range or gender (if shared)</li>
              <li>Location (general, not exact)</li>
              <li>Feedback or survey responses</li>
            </ul>
            <p class="md:text-large text-extra-small">
              We do not ask for names, phone numbers, or exact addresses unless explicitly needed
              for service connection, and only with consent.
            </p>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Why We Collect It
            </h2>
            <p class="md:text-large text-extra-small font-semibold">We use this information to:</p>
            <ul class="list-disc pl-10">
              <li>Improve chatbot responses and game experiences</li>
              <li>Tailor content to your age, preferences, and needs</li>
              <li>Connect you to relevant services (e.g., health clinics, helplines)</li>
              <li>Monitor platform safety and performance</li>
            </ul>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              How We Protect Your Data
            </h2>
            <ul class="list-disc pl-10">
              <li>All data is stored securely and encrypted.</li>
              <li>We do not sell or share your data with advertisers.</li>
              <li>
                Only authorized Rafikey team members or partners can access data, and only for
                support or improvement purposes.
              </li>
            </ul>
          </div>

          <!-- 🟣 New Section: Data Retention and Deletion -->
          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Data Retention and Deletion
            </h2>
            <p class="md:text-large text-extra-small">
              To protect your privacy, Rafikey automatically deletes all chat history and
              interaction data after one (1) month. Before deletion occurs, users receive a
              notification reminding them that their chat history will be cleared.
            </p>
            <p class="md:text-large text-extra-small">
              This ensures your data is not stored longer than necessary. If you prefer to delete
              your chats or account earlier, you can do so through your settings or by contacting us
              at
              <a href="mailto:rafikey@afrimedia.org" class="text-casablanca-600"
                >rafikey@afrimedia.org</a
              >.
            </p>
          </div>
          <!-- End new section -->

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              What We Don’t Do
            </h2>
            <ul class="list-disc pl-10">
              <li>Track you across other apps or websites.</li>
              <li>We don’t collect sensitive personal data without clear consent.</li>
              <li>
                We don’t allow bullying, harassment, or unsafe content, and we take action if it
                occurs.
              </li>
            </ul>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Third-Party Services
            </h2>
            <p class="md:text-large text-extra-small">
              If you choose to connect with a service (like a health provider or helpline), we’ll
              only share the minimum necessary information, and only with your consent.
            </p>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Children’s Privacy
            </h2>
            <p class="md:text-large text-extra-small">
              Rafikey is designed with youth safety in mind. For users under 18:
            </p>
            <ul class="list-disc pl-10">
              <li>We encourage caregivers to guide younger users.</li>
              <li>We limit data collection to what’s needed for safe use.</li>
              <li>We adhere to child protection laws and digital safety standards.</li>
            </ul>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">
              Your Rights
            </h2>
            <p class="md:text-large text-extra-small">You can:</p>
            <ul class="list-disc pl-10">
              <li>Ask what data we’ve collected</li>
              <li>Request the deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Join as a guest (terms and conditions apply)</li>
            </ul>
            <p class="md:text-large text-extra-small">
              To do so, contact:
              <a href="mailto:rafikey@afrimedia.org" class="text-casablanca-600"
                >rafikey@afrimedia.org</a
              >
            </p>
          </div>

          <div>
            <h2 class="md:text-extra-extra-large-1 text-extra-small font-semibold mb-2">Consent</h2>
            <p class="md:text-large text-extra-small">
              By using Rafikey, you agree to this privacy policy. We’ll notify you if major changes
              are made.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
