<script setup lang="ts">

import LoadingPage_2 from '@/views/auth/welcomepages/LoadingPage_2.vue'
import LoadingPage_3 from '@/views/auth/welcomepages/LoadingPage_3.vue'
import LoadingPage_4 from '@/views/auth/welcomepages/LoadingPage_4.vue'
</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block">
      <div class="grid grid-cols-2 w-10/12 mx-auto">
        <!--      left side-->
        <div class="col-span-1">
          <div>
            <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-4xl text-2xl font-semibold">Set a password</h2>
              <p class="lg:text-xl text-lg text-gray-700">Your previous password has been reset.
                Please set a new password for your account</p>
            </div>

            <div>
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    id="newPassword"
                    type="password"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="newPassword">
                    Create Password
                  </label>
                  <!--                <span class="material-icons-outlined absolute right-3 top-6">visibility_off</span>-->
                  <span class="material-icons-outlined absolute right-3 top-6">visibility</span>
                </div>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="confirmPassword">
                    Re-enter Password
                  </label>
                  <!--                <span class="material-icons-outlined absolute right-3 top-6">visibility_off</span>-->
                  <span class="material-icons-outlined absolute right-3 top-6">visibility</span>
                </div>
                <div
                  class="btn btn-sm bg-casablanca-400 hover:bg-casablanca-300 text-lg rounded-2xl py-6">
                  <span>Set password</span>
                </div>
              </form>
            </div>

          </div>


        </div>
        <!--      right side-->
        <div class="col-span-1 flex items-center justify-center h-screen">
          <img src="@/assets/images/reset-password.png" alt="reset-password-images" />

        </div>

      </div>

    </div>

    <!--    Small screens-->
    <div class="lg:hidden block h-screen w-full">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col px-20 space-y-8">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-3xl font-semibold">Rest your Password</h2>
          <div class="space-y-2">
            <p class="text-lg text-gray-700 text-center">Your previous password has been reset</p>
            <p class="text-lg text-gray-700 text-center">Please set a new password for your account.</p>
          </div>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-8">
          <div class="relative">
            <label class="text-gray-950 text-lg" for="password">
              Create Password
            </label>
            <input
              id="password"
              type="password"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="1234567@Hello"
            />
            <!--                <span class="material-icons-outlined absolute right-3 top-6">visibility_off</span>-->
            <span class="material-icons-outlined absolute right-3 top-10 cursor-pointer">visibility</span>
          </div>

          <div class="relative">
            <label class="text-gray-950 text-lg" for="password">
              Confirm Password
            </label>
            <input
              id="password"
              type="password"
              class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
              required
              placeholder="1234567@Hello"
            />
            <!--                <span class="material-icons-outlined absolute right-3 top-6">visibility_off</span>-->
            <span class="material-icons-outlined absolute right-3 top-10 cursor-pointer">visibility</span>
          </div>
        </form>
        <div class="border-b border-gray-400 w-full pt-6"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            class="btn w-full btn-sm bg-casablanca-300 hover:bg-casablanca-400 text-lg rounded-2xl py-6">
            Set Password
          </button>
        </div>
      </div>
    </div>
  </div>
  <!--<LoadingPage_2 />-->
  <!--  <LoadingPage_3 />-->
<!--  <LoadingPage_4 />-->
</template>

<style scoped>

</style>
