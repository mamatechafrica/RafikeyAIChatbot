<script setup lang="ts">
import  { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="h-screen w-full">
    <div class="w-10/12 mx-auto pb-10">
      <div class="grid grid-cols-3 sticky top-0 z-40 bg-white">
        <div class="col-span-1 flex flex-col justify-end">
          <div
            @click="router.go(-1)"
            class="flex lg:pb-10 pb-8 cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
            <span class="material-icons-outlined">chevron_left</span>
            <span class="lg:text-lg text-sm font-light">Back to Sign Up</span>
          </div>
        </div>
        <div class="flex invisible lg:visible justify-center col-span-1">
          <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon"/>
        </div>
      </div>
      <div class="bg-gray-100 mx-auto p-10 rounded-2xl space-y-5">
       <div>
         <div class="flex justify-end">
           <router-link  to="/auth/terms-of-service" class="bg-casablanca-200 lg:text-lg text-sm w-fit rounded-lg flex justify-center items-center px-2"><span>Terms of Use</span></router-link>
         </div>
         <div class="flex  flex-col items-center space-y-3" >
           <h2 class="lg:text-4xl text-lg text-center  font-semibold">Privacy Policy</h2>
           <p class="lg:text-2xl text-sm ">Last updated: <span class="text-casablanca-300 lg:text-2xl text-sm ">19 June 2025</span></p>
           <div class="border-b border-gray-500 w-64 mx-auto"></div>
         </div>
       </div>

        <div class="flex flex-col lg:text-xl text-lg  space-y-4 lg:px-6 px-1">
          <div class="">
            <p>At Rafikey, your privacy and safety comes first. This policy explains what personal information we collect, wky we collect it, and how we keep it safe. We are committed to protecting your data and following the General Data Protection Regulation (GDPR).</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">What We Collect</h2>
            <p>We only collect the information you choose to give us, such as:</p>
            <ul class="list-disc pl-10">
              <li>Username (can be anonymous)</li>
              <li>Email address(for login and support)</li>
              <li>Password(encrypted and never visible to anyone)</li>
              <li>Age range, and relationship status(to personalize your experience)</li>
            </ul>
            <p>We do not collect real names, phone numbers, or any sensitive data unless you choose to share it.</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">Why We Collect It</h2>
            <p>We use your information to:</p>
            <ul class="list-disc pl-10">
              <li>Personalize support and content for your age and identity</li>
              <li>Keep your account secure</li>
              <li>Improve Rafikey to better serve your needs</li>
            </ul>
            <p>We never sell or share your information with third parties for advertising or tracking.</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">How We Keep It Safe</h2>
            <ul class="list-disc pl-10">
              <li>All passwords are securely encrypted.</li>
              <li>Your data is stored on secure servers.</li>
              <li>Only authorized Rafikey staff can access limited data - only when needed for support. </li>
            </ul>
            <p>We never sell or share your information with third parties for advertising or tracking.</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">Your Rights</h2>
            <p>You have the right to:</p>
            <ul class="list-disc pl-10">
              <li>Ask what data we hold about you.</li>
              <li>Request updates or deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To do so, email us at <a href="mailto:Support@rafikey.org" class="text-casablanca-600">support@rafikey.org</a></p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">Cookies</h2>
            <p>We use minimal cookies to help the website function properly. We do not use tracking cookies or ad-based cookies.</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">GDPR Compliance</h2>
            <p>Rafikey is fully GDPR-compliant. If you're under 16, make sure sure you have permission from a parent or guardian before signing up.</p>
          </div>
          <div class="">
            <h2 class="lg:text-3xl text-xl font-semibold">Contact Us</h2>
            <p>If you have questions or concerns about your privacy, contact us at  <a href="mailto:Support@rafikey.org" class="text-casablanca-600">support@rafikey.org</a> </p>
          </div>
        </div>
     </div>
    </div>

  </div>

</template>

<style scoped>

</style>
